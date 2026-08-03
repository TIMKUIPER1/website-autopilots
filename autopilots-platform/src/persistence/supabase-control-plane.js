import { createClient } from "@supabase/supabase-js";

export class SupabaseControlPlaneRepository {
  constructor({ url, serviceRoleKey, client }) {
    if (!client && (!url || !serviceRoleKey)) throw new Error("Supabase control-plane repository configuration missing");
    this.client = client || createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });
  }

  async brandOnboarding(profileId, brandSlug) {
    assertBrandSlug(brandSlug);
    assertProfileId(profileId);
    const { data, error } = await this.client.rpc("autopilots_brand_onboarding", {
      p_profile_id: profileId,
      p_brand_slug: brandSlug
    });
    if (error?.code === "42501") throw httpError(403, "Geen toegang tot deze operating brand");
    if (error?.code === "P0002" || !data) throw httpError(404, "Operating brand niet gevonden");
    if (error) throw httpError(503, "Onboardingstatus kon niet veilig worden geladen");
    return data;
  }

  async incidents(profileId, brandSlug = null) {
    assertProfileId(profileId);
    if (brandSlug !== null) assertBrandSlug(brandSlug);
    const { data, error } = await this.client.rpc("autopilots_incident_snapshot", {
      p_profile_id: profileId,
      p_brand_slug: brandSlug
    });
    throwMapped(error, "Incidentstatus kon niet veilig worden geladen");
    if (!data || data.contract !== "autopilots.incidents.v1" || !Array.isArray(data.incidents)) {
      throw httpError(503, "Incidentstatus heeft een ongeldig contract");
    }
    return data;
  }

  async recordProductHealth(profileId, health, idempotencyKey) {
    assertProfileId(profileId);
    assertHealthContract(health);
    assertIdempotencyKey(idempotencyKey);
    const { data, error } = await this.client.rpc("autopilots_record_product_health", {
      p_profile_id: profileId,
      p_brand_slug: health.product,
      p_status: health.status,
      p_error_code: health.errorCode || null,
      p_summary: healthSummary(health),
      p_observed_at: health.observedAt,
      p_observation_key: `manual:${idempotencyKey}`
    });
    throwMapped(error, "De gezondheidswaarneming kon niet veilig worden vastgelegd");
    if (!data?.eventId) throw httpError(503, "De gezondheidswaarneming leverde geen bewijs op");
    return data;
  }

  async claimMonitoringRun(profileId, { leaseKey, bucket, holderId, intervalSeconds, leaseSeconds }) {
    assertProfileId(profileId);
    assertUuid(holderId, "Ongeldige monitoringhouder");
    if (!/^[a-z][a-z0-9:_-]{7,119}$/.test(String(leaseKey || "")) || !Number.isSafeInteger(bucket) || bucket < 0) {
      throw httpError(400, "Ongeldig monitoringtijdvak");
    }
    const { data, error } = await this.client.rpc("autopilots_claim_monitoring_run", {
      p_authority_profile_id: profileId,
      p_lease_key: leaseKey,
      p_bucket: bucket,
      p_holder_id: holderId,
      p_interval_seconds: intervalSeconds,
      p_lease_seconds: leaseSeconds
    });
    throwMapped(error, "De monitoringleasestatus kon niet veilig worden vastgelegd");
    if (data?.contract !== "autopilots.monitoring-lease.v1" || typeof data.claimed !== "boolean" || !uuid(data.runId)) {
      throw httpError(503, "De monitoringleasestatus heeft een ongeldig contract");
    }
    return data;
  }

  async heartbeatMonitoringRun(runId, holderId, leaseSeconds) {
    assertUuid(runId, "Ongeldige monitoringrun");
    assertUuid(holderId, "Ongeldige monitoringhouder");
    const { data, error } = await this.client.rpc("autopilots_heartbeat_monitoring_run", {
      p_run_id: runId,
      p_holder_id: holderId,
      p_lease_seconds: leaseSeconds
    });
    throwMapped(error, "De monitoringheartbeat kon niet veilig worden vastgelegd");
    return data === true;
  }

  async completeMonitoringRun(runId, holderId, outcome, counts, errorCode = null) {
    assertUuid(runId, "Ongeldige monitoringrun");
    assertUuid(holderId, "Ongeldige monitoringhouder");
    const { data, error } = await this.client.rpc("autopilots_complete_monitoring_run", {
      p_run_id: runId,
      p_holder_id: holderId,
      p_outcome: outcome,
      p_counts: counts,
      p_error_code: errorCode
    });
    throwMapped(error, "De monitoringrun kon niet veilig worden afgesloten");
    if (data?.contract !== "autopilots.monitoring-run.v1" || !uuid(data.runId)) {
      throw httpError(503, "De monitoringrun heeft een ongeldig afsluitcontract");
    }
    return data;
  }

  async monitoringFreshness(profileId, staleAfterSeconds) {
    assertProfileId(profileId);
    const { data, error } = await this.client.rpc("autopilots_monitoring_freshness", {
      p_authority_profile_id: profileId,
      p_stale_after_seconds: staleAfterSeconds
    });
    throwMapped(error, "De monitoringfreshness kon niet veilig worden geladen");
    if (data?.contract !== "autopilots.monitoring-freshness.v1" || !Array.isArray(data.brands)) {
      throw httpError(503, "De monitoringfreshness heeft een ongeldig contract");
    }
    return data;
  }

  async acknowledgeIncident(profileId, incidentId, contextVersion, idempotencyKey) {
    assertProfileId(profileId);
    if (!uuid(incidentId)) throw httpError(404, "Incident niet gevonden");
    if (!Number.isSafeInteger(contextVersion) || contextVersion < 1) throw httpError(400, "Ongeldige incidentcontext");
    assertIdempotencyKey(idempotencyKey);
    const { data, error } = await this.client.rpc("autopilots_acknowledge_incident", {
      p_profile_id: profileId,
      p_incident_id: incidentId,
      p_context_version: contextVersion,
      p_idempotency_key: idempotencyKey
    });
    throwMapped(error, "Het incident kon niet veilig worden bevestigd");
    if (!data?.commandId || data.status !== "acknowledged") throw httpError(503, "Incidentbevestiging leverde geen commandobewijs op");
    return data;
  }
}

function assertHealthContract(health) {
  const statuses = new Set(["healthy", "degraded", "unavailable", "expired", "blocked", "unknown"]);
  if (!health || health.contract !== "autopilots.product-health.v1" || health.sourceQuality !== "live_readonly_probe") {
    throw httpError(400, "Alleen een actuele read-only productprobe kan worden vastgelegd");
  }
  assertBrandSlug(health.product);
  if (!statuses.has(health.status) || health.externalWrites !== false || !Number.isFinite(Date.parse(health.observedAt))) {
    throw httpError(400, "Ongeldige gezondheidswaarneming");
  }
  if (health.status !== "healthy" && !/^[A-Z][A-Z0-9_]{2,119}$/.test(String(health.errorCode || ""))) {
    throw httpError(400, "Een stabiele foutcode is vereist");
  }
}

function healthSummary(health) {
  if (health.status === "healthy") return `${health.product} health en basisafhankelijkheden antwoorden.`;
  if (health.status === "degraded") return `${health.product} is bereikbaar, maar een of meer basisafhankelijkheden ontbreken.`;
  return `${health.product} healthendpoint is momenteel niet bereikbaar.`;
}

function assertProfileId(value) {
  if (!uuid(value)) throw httpError(403, "Actief profiel vereist");
}

function assertUuid(value, message) {
  if (!uuid(value)) throw httpError(400, message);
}

function assertBrandSlug(value) {
  if (!/^[a-z][a-z0-9-]{2,62}$/.test(String(value || ""))) throw httpError(404, "Operating brand niet gevonden");
}

function assertIdempotencyKey(value) {
  if (!/^[A-Za-z0-9:_-]{8,120}$/.test(String(value || ""))) throw httpError(400, "Geldige Idempotency-Key vereist");
}

function uuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function throwMapped(error, fallback) {
  if (!error) return;
  if (error.code === "42501") throw httpError(403, "Geen toegang tot deze bedrijfsomgeving");
  if (error.code === "P0002") throw httpError(404, "Incident of operating brand niet gevonden");
  if (error.code === "P0001" && /stale incident context/i.test(String(error.message || ""))) {
    throw httpError(409, "De incidentcontext is gewijzigd; ververs eerst de actuele status");
  }
  if (["23505", "55000"].includes(error.code)) throw httpError(409, "Deze incidentactie conflicteert met de actuele status");
  if (error.code === "22023") throw httpError(400, "Ongeldige incidentactie");
  throw httpError(503, fallback);
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
