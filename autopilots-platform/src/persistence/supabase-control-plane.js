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
    if (data?.contract !== "autopilots.onboarding.v2" || !Array.isArray(data.steps)
      || !Array.isArray(data.connections) || !Array.isArray(data.connectorRequests)
      || data.providerAuthorizationEnabled !== false || data.externalWritesEnabled !== false) {
      throw httpError(503, "Onboardingstatus heeft een ongeldig contract");
    }
    return data;
  }

  async stageConnectorRequest(profileId, brandSlug, request, idempotencyKey) {
    assertProfileId(profileId);
    assertBrandSlug(brandSlug);
    assertIdempotencyKey(idempotencyKey);
    const stepKey = String(request?.stepKey || "");
    const displayLabel = String(request?.displayLabel || "").trim();
    if (!/^[a-z][a-z0-9_]{2,62}$/.test(stepKey)) throw httpError(404, "Connectorstap niet gevonden");
    if (displayLabel.length < 2 || displayLabel.length > 120) throw httpError(400, "Connectorlabel moet tussen 2 en 120 tekens bevatten");
    const { data, error } = await this.client.rpc("autopilots_stage_connector_request", {
      p_profile_id: profileId,
      p_brand_slug: brandSlug,
      p_step_key: stepKey,
      p_display_label: displayLabel,
      p_idempotency_key: idempotencyKey
    });
    throwMapped(error, "Het connectorverzoek kon niet veilig worden gestaged");
    if (data?.contract !== "autopilots.connector-request.v1" || !uuid(data.requestId)
      || !uuid(data.commandId) || !uuid(data.approvalId)
      || data.providerAuthorizationStarted !== false || data.providerAccountConnected !== false
      || data.discoveryStarted !== false || data.credentialsStored !== false || data.externalWrites !== false) {
      throw httpError(503, "Het connectorverzoek heeft een ongeldig bewijscontract");
    }
    return data;
  }

  async decideConnectorRequest(profileId, brandSlug, requestId, decision, contextVersion, idempotencyKey) {
    assertProfileId(profileId);
    assertBrandSlug(brandSlug);
    assertUuid(requestId, "Connectorverzoek niet gevonden");
    if (!new Set(["approved", "rejected"]).has(decision)) throw httpError(400, "Ongeldige connectorbeslissing");
    if (!Number.isSafeInteger(contextVersion) || contextVersion < 1) throw httpError(400, "Ongeldige connectorcontext");
    assertIdempotencyKey(idempotencyKey);
    const { data, error } = await this.client.rpc("autopilots_decide_connector_request", {
      p_profile_id: profileId,
      p_brand_slug: brandSlug,
      p_request_id: requestId,
      p_decision: decision,
      p_context_version: contextVersion,
      p_idempotency_key: idempotencyKey
    });
    if (error?.code === "P0001" && /stale connector request context/i.test(String(error.message || ""))) {
      throw httpError(409, "De connectorcontext is gewijzigd; ververs eerst het actuele verzoek");
    }
    throwMapped(error, "De connectorbeslissing kon niet veilig worden vastgelegd");
    if (data?.contract !== "autopilots.connector-decision.v1" || !uuid(data.requestId)
      || !uuid(data.decisionCommandId) || data.providerAuthorizationStarted !== false
      || data.providerAccountConnected !== false || data.discoveryStarted !== false
      || data.credentialsStored !== false || data.externalWrites !== false) {
      throw httpError(503, "De connectorbeslissing heeft een ongeldig bewijscontract");
    }
    return data;
  }

  async portfolio(profileId, legalEntityId) {
    assertProfileId(profileId);
    assertUuid(legalEntityId, "Ongeldige organisatiescope");
    const { data, error } = await this.client.rpc("autopilots_portfolio_snapshot", {
      p_profile_id: profileId,
      p_legal_entity_id: legalEntityId
    });
    throwMapped(error, "Het duurzame portfolio kon niet veilig worden geladen");
    if (data?.contract !== "autopilots.portfolio.v2" || !Array.isArray(data.brands) || !Array.isArray(data.sourceOfTruth)
      || !data.launchReadiness || data.launchReadiness.providerAuthorizationEnabled !== false
      || data.launchReadiness.externalWritesEnabled !== false
      || data.demoMode !== false || data.externalWrites !== false) {
      throw httpError(503, "Het duurzame portfolio heeft een ongeldig contract");
    }
    return data;
  }

  async brandTwin(profileId, brandSlug) {
    assertProfileId(profileId);
    assertBrandSlug(brandSlug);
    const { data, error } = await this.client.rpc("autopilots_brand_twin", {
      p_profile_id: profileId,
      p_brand_slug: brandSlug
    });
    throwMapped(error, "De duurzame bedrijfsweergave kon niet veilig worden geladen");
    if (data?.contract !== "autopilots.brand-twin.v1" || data.brand?.slug !== brandSlug
      || !Array.isArray(data.integrations) || !Array.isArray(data.ownerExceptions)
      || data.demoMode !== false || data.externalWrites !== false) {
      throw httpError(503, "De duurzame bedrijfsweergave heeft een ongeldig contract");
    }
    return data;
  }

  async incidents(profileId, legalEntityId, brandSlug = null) {
    assertProfileId(profileId);
    assertUuid(legalEntityId, "Ongeldige organisatiescope");
    if (brandSlug !== null) assertBrandSlug(brandSlug);
    const { data, error } = await this.client.rpc("autopilots_incident_snapshot_v2", {
      p_profile_id: profileId,
      p_legal_entity_id: legalEntityId,
      p_brand_slug: brandSlug
    });
    throwMapped(error, "Incidentstatus kon niet veilig worden geladen");
    if (!data || data.contract !== "autopilots.incidents.v2" || data.legalEntityId !== legalEntityId || !Array.isArray(data.incidents)) {
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

  async claimMonitoringRun(principalId, { leaseKey, bucket, holderId, intervalSeconds, leaseSeconds }) {
    assertAuthorityId(principalId);
    assertUuid(holderId, "Ongeldige monitoringhouder");
    if (!/^[a-z][a-z0-9:_-]{7,119}$/.test(String(leaseKey || "")) || !Number.isSafeInteger(bucket) || bucket < 0) {
      throw httpError(400, "Ongeldig monitoringtijdvak");
    }
    const { data, error } = await this.client.rpc("autopilots_claim_monitoring_run_v2", {
      p_principal_id: principalId,
      p_lease_key: leaseKey,
      p_bucket: bucket,
      p_holder_id: holderId,
      p_interval_seconds: intervalSeconds,
      p_lease_seconds: leaseSeconds
    });
    throwMapped(error, "De monitoringleasestatus kon niet veilig worden vastgelegd");
    if (data?.contract !== "autopilots.monitoring-lease.v2" || typeof data.claimed !== "boolean" || !uuid(data.runId)) {
      throw httpError(503, "De monitoringleasestatus heeft een ongeldig contract");
    }
    return data;
  }

  async heartbeatMonitoringRun(principalId, runId, holderId, leaseSeconds) {
    assertAuthorityId(principalId);
    assertUuid(runId, "Ongeldige monitoringrun");
    assertUuid(holderId, "Ongeldige monitoringhouder");
    const { data, error } = await this.client.rpc("autopilots_heartbeat_monitoring_run_v2", {
      p_principal_id: principalId,
      p_run_id: runId,
      p_holder_id: holderId,
      p_lease_seconds: leaseSeconds
    });
    throwMapped(error, "De monitoringheartbeat kon niet veilig worden vastgelegd");
    return data === true;
  }

  async completeMonitoringRun(principalId, runId, holderId, outcome, counts, errorCode = null) {
    assertAuthorityId(principalId);
    assertUuid(runId, "Ongeldige monitoringrun");
    assertUuid(holderId, "Ongeldige monitoringhouder");
    const { data, error } = await this.client.rpc("autopilots_complete_monitoring_run_v2", {
      p_principal_id: principalId,
      p_run_id: runId,
      p_holder_id: holderId,
      p_outcome: outcome,
      p_counts: counts,
      p_error_code: errorCode
    });
    throwMapped(error, "De monitoringrun kon niet veilig worden afgesloten");
    if (data?.contract !== "autopilots.monitoring-run.v2" || !uuid(data.runId)) {
      throw httpError(503, "De monitoringrun heeft een ongeldig afsluitcontract");
    }
    return data;
  }

  async monitoringFreshness(principalId, staleAfterSeconds) {
    assertAuthorityId(principalId);
    const { data, error } = await this.client.rpc("autopilots_monitoring_freshness_v2", {
      p_principal_id: principalId,
      p_stale_after_seconds: staleAfterSeconds
    });
    throwMapped(error, "De monitoringfreshness kon niet veilig worden geladen");
    if (data?.contract !== "autopilots.monitoring-freshness.v2" || !Array.isArray(data.brands)) {
      throw httpError(503, "De monitoringfreshness heeft een ongeldig contract");
    }
    return data;
  }

  async accessRoster(profileId, legalEntityId) {
    assertProfileId(profileId);
    assertUuid(legalEntityId, "Ongeldige organisatiescope");
    const { data, error } = await this.client.rpc("autopilots_access_roster", {
      p_profile_id: profileId,
      p_legal_entity_id: legalEntityId
    });
    throwMapped(error, "Het toegangsbeheer kon niet veilig worden geladen");
    if (data?.contract !== "autopilots.access-roster.v1" || !Array.isArray(data.members) || !Array.isArray(data.requests)) {
      throw httpError(503, "Het toegangsbeheer heeft een ongeldig contract");
    }
    return data;
  }

  async stageAccessRequest(profileId, legalEntityId, request, idempotencyKey) {
    assertProfileId(profileId);
    assertUuid(legalEntityId, "Ongeldige organisatiescope");
    assertIdempotencyKey(idempotencyKey);
    const email = String(request?.email || "").trim().toLowerCase();
    const displayName = String(request?.displayName || "").trim();
    const role = String(request?.role || "");
    const brandSlug = request?.brandSlug === null || request?.brandSlug === "" ? null : String(request?.brandSlug || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw httpError(400, "Geldig e-mailadres vereist");
    if (displayName.length < 2 || displayName.length > 120) throw httpError(400, "Naam moet tussen 2 en 120 tekens bevatten");
    if (!new Set(["admin", "operator", "finance", "auditor", "viewer"]).has(role)) throw httpError(400, "Ongeldige toegangsrol");
    if (brandSlug !== null) assertBrandSlug(brandSlug);
    const { data, error } = await this.client.rpc("autopilots_stage_access_request", {
      p_profile_id: profileId,
      p_legal_entity_id: legalEntityId,
      p_email: email,
      p_display_name: displayName,
      p_role: role,
      p_brand_slug: brandSlug,
      p_idempotency_key: idempotencyKey
    });
    throwMapped(error, "Het toegangsverzoek kon niet veilig worden gestaged");
    if (data?.contract !== "autopilots.access-request.v1" || !uuid(data.requestId) || data.externalWrites !== false) {
      throw httpError(503, "Het toegangsverzoek heeft een ongeldig bewijscontract");
    }
    return data;
  }

  async decideAccessRequest(profileId, legalEntityId, requestId, decision, contextVersion, idempotencyKey) {
    assertProfileId(profileId);
    assertUuid(legalEntityId, "Ongeldige organisatiescope");
    assertUuid(requestId, "Toegangsverzoek niet gevonden");
    if (!new Set(["approved", "rejected"]).has(decision)) throw httpError(400, "Ongeldige toegangsbeslissing");
    if (!Number.isSafeInteger(contextVersion) || contextVersion < 1) throw httpError(400, "Ongeldige toegangscontext");
    assertIdempotencyKey(idempotencyKey);
    const { data, error } = await this.client.rpc("autopilots_decide_access_request", {
      p_profile_id: profileId, p_legal_entity_id: legalEntityId, p_request_id: requestId,
      p_decision: decision, p_context_version: contextVersion, p_idempotency_key: idempotencyKey
    });
    if (error?.code === "P0001" && /stale access request context/i.test(String(error.message || ""))) {
      throw httpError(409, "De toegangscontext is gewijzigd; ververs eerst het actuele verzoek");
    }
    throwMapped(error, "De toegangsbeslissing kon niet veilig worden vastgelegd");
    if (data?.contract !== "autopilots.access-decision.v1" || !uuid(data.requestId) || data.membershipApplied !== false || data.externalWrites !== false) {
      throw httpError(503, "De toegangsbeslissing heeft een ongeldig bewijscontract");
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

function assertAuthorityId(value) {
  if (!uuid(value)) throw httpError(503, "Geldige service principal vereist");
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
  if (["23505", "55000"].includes(error.code)) throw httpError(409, "Deze beheeractie conflicteert met de actuele status");
  if (error.code === "22023") throw httpError(400, "Ongeldige incidentactie");
  throw httpError(503, fallback);
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
