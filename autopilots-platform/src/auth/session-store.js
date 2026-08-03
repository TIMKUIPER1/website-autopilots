import { createClient } from "@supabase/supabase-js";
import { normalizeContext, SupabaseAuthError } from "./supabase.js";

export class SupabaseSessionStore {
  constructor({ url, serviceRoleKey, client }) {
    if (!client && (!url || !serviceRoleKey)) throw new Error("Supabase session store configuration missing");
    this.client = client || createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });
  }

  async health() {
    const impossibleHash = "0".repeat(64);
    const { error } = await this.client.rpc("autopilots_resolve_app_session", { p_token_hash: impossibleHash });
    if (error) throw new SupabaseAuthError("SESSION_STORE_UNAVAILABLE", "Het duurzame sessieregister is niet beschikbaar.", 503);
    return { durable: true, provider: "supabase" };
  }

  async create(tokenHash, user, expiresAt) {
    assertTokenHash(tokenHash);
    const { data, error } = await this.client.rpc("autopilots_create_app_session", {
      p_token_hash: tokenHash,
      p_profile_id: user.id,
      p_auth_user_id: user.authUserId,
      p_assurance_level: user.assuranceLevel,
      p_expires_at: new Date(expiresAt).toISOString()
    });
    if (error || !data) throw new SupabaseAuthError("SESSION_CREATE_FAILED", "De beveiligde applicatiesessie kon niet worden aangemaakt.", 503);
    return data;
  }

  async resolve(tokenHash) {
    assertTokenHash(tokenHash);
    const { data, error } = await this.client.rpc("autopilots_resolve_app_session", { p_token_hash: tokenHash });
    if (error) throw new SupabaseAuthError("SESSION_RESOLVE_FAILED", "De applicatiesessie kon niet veilig worden gecontroleerd.", 503);
    if (!data) return null;
    const session = normalizeContext(data);
    return { ...session, sessionId: data.sessionId, expiresAt: Date.parse(data.expiresAt) };
  }

  async revoke(tokenHash, reason = "user_logout") {
    assertTokenHash(tokenHash);
    const { data, error } = await this.client.rpc("autopilots_revoke_app_session", {
      p_token_hash: tokenHash,
      p_reason: String(reason).slice(0, 120)
    });
    if (error) throw new SupabaseAuthError("SESSION_REVOKE_FAILED", "De applicatiesessie kon niet worden ingetrokken.", 503);
    return data === true;
  }
}

export function assertTokenHash(value) {
  if (!/^[0-9a-f]{64}$/.test(String(value || ""))) throw new Error("Invalid session token hash");
}
