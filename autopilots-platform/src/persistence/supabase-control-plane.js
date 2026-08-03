import { createClient } from "@supabase/supabase-js";

export class SupabaseControlPlaneRepository {
  constructor({ url, serviceRoleKey, client }) {
    if (!client && (!url || !serviceRoleKey)) throw new Error("Supabase control-plane repository configuration missing");
    this.client = client || createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });
  }

  async brandOnboarding(profileId, brandSlug) {
    if (!/^[a-z][a-z0-9-]{2,62}$/.test(String(brandSlug || ""))) throw httpError(404, "Operating brand niet gevonden");
    if (!/^[0-9a-f-]{36}$/i.test(String(profileId || ""))) throw httpError(403, "Actief profiel vereist");
    const { data, error } = await this.client.rpc("autopilots_brand_onboarding", {
      p_profile_id: profileId,
      p_brand_slug: brandSlug
    });
    if (error?.code === "42501") throw httpError(403, "Geen toegang tot deze operating brand");
    if (error?.code === "P0002" || !data) throw httpError(404, "Operating brand niet gevonden");
    if (error) throw httpError(503, "Onboardingstatus kon niet veilig worden geladen");
    return data;
  }
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
