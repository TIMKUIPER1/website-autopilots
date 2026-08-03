import { createClient } from "@supabase/supabase-js";

export class SupabaseAuthError extends Error {
  constructor(code, message, status = 401) {
    super(message);
    this.name = "SupabaseAuthError";
    this.code = code;
    this.status = status;
  }
}

export class SupabaseAuthGateway {
  constructor({ url, publishableKey }) {
    if (!url || !publishableKey) throw new SupabaseAuthError("AUTH_CONFIGURATION_MISSING", "Supabase Auth is niet geconfigureerd.", 503);
    this.url = url;
    this.publishableKey = publishableKey;
  }

  client(accessToken) {
    return createClient(this.url, this.publishableKey, {
      global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
    });
  }

  async sendMagicLink(email, redirectTo) {
    const { error } = await this.client().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: false }
    });
    if (error) throw new SupabaseAuthError("MAGIC_LINK_FAILED", "De beveiligde inloglink kon niet worden verstuurd.", error.status || 400);
  }

  async verifyAndLoadContext(accessToken) {
    if (!accessToken || accessToken.length > 10000) throw new SupabaseAuthError("INVALID_ACCESS_TOKEN", "De inloglink is ongeldig of verlopen.");
    const client = this.client(accessToken);
    const [{ data: userData, error: userError }, { data: context, error: contextError }] = await Promise.all([
      client.auth.getUser(accessToken),
      client.rpc("autopilots_session_context_v2")
    ]);
    if (userError || !userData?.user) throw new SupabaseAuthError("INVALID_ACCESS_TOKEN", "De inloglink is ongeldig of verlopen.");
    if (contextError) throw new SupabaseAuthError("SESSION_CONTEXT_UNAVAILABLE", "De accountrechten konden niet veilig worden geladen.", 503);
    if (!context || context.contract !== "autopilots.session-context.v2" || context.authUserId !== userData.user.id) {
      throw new SupabaseAuthError("MEMBERSHIP_REQUIRED", "Dit account heeft geen actieve Autopilots-toegang.", 403);
    }
    return normalizeContext(context);
  }

  async prepareMfa(accessToken, refreshToken) {
    const context = await this.verifyAndLoadContext(accessToken);
    if (!context.mfaRequired || context.assuranceLevel === "aal2") return { mode: "complete", context };
    const client = await this.sessionClient(accessToken, refreshToken);
    const { data: factors, error: factorsError } = await client.auth.mfa.listFactors();
    if (factorsError) throw new SupabaseAuthError("MFA_FACTORS_UNAVAILABLE", "Tweestapsverificatie kon niet worden voorbereid.", factorsError.status || 400);
    const verifiedTotp = factors?.totp?.[0];
    if (verifiedTotp) return { mode: "challenge", factorId: verifiedTotp.id };

    for (const factor of factors?.all || []) {
      if (factor.factor_type === "totp" && factor.status !== "verified") {
        const { error } = await client.auth.mfa.unenroll({ factorId: factor.id });
        if (error) throw new SupabaseAuthError("MFA_CLEANUP_FAILED", "Een eerdere onvoltooide MFA-inrichting kon niet veilig worden vervangen.", error.status || 400);
      }
    }
    const { data: enrollment, error: enrollmentError } = await client.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Autopilots Control Plane",
      issuer: "Autopilots"
    });
    if (enrollmentError || !enrollment?.totp?.qr_code) {
      throw new SupabaseAuthError("MFA_ENROLLMENT_FAILED", "Tweestapsverificatie kon niet worden gestart.", enrollmentError?.status || 400);
    }
    return {
      mode: "enroll",
      factorId: enrollment.id,
      qrCode: enrollment.totp.qr_code,
      secret: enrollment.totp.secret
    };
  }

  async verifyMfa(accessToken, refreshToken, factorId, code) {
    if (!/^[0-9a-f-]{36}$/i.test(String(factorId || "")) || !/^\d{6}$/.test(String(code || ""))) {
      throw new SupabaseAuthError("INVALID_MFA_INPUT", "Vul de zescijferige code uit je authenticator-app in.", 400);
    }
    const client = await this.sessionClient(accessToken, refreshToken);
    const { data, error } = await client.auth.mfa.challengeAndVerify({ factorId, code });
    if (error || !data?.access_token) throw new SupabaseAuthError("MFA_VERIFICATION_FAILED", "De authenticatorcode is ongeldig of verlopen.", error?.status || 401);
    const context = await this.verifyAndLoadContext(data.access_token);
    if (context.mfaRequired && context.assuranceLevel !== "aal2") {
      throw new SupabaseAuthError("MFA_ASSURANCE_MISSING", "Supabase heeft het hogere beveiligingsniveau niet bevestigd.", 403);
    }
    return context;
  }

  async sessionClient(accessToken, refreshToken) {
    if (!accessToken || !refreshToken || accessToken.length > 10000 || refreshToken.length > 10000) {
      throw new SupabaseAuthError("INVALID_AUTH_SESSION", "De tijdelijke inlogsessie is ongeldig of verlopen.");
    }
    const client = this.client();
    const { error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) throw new SupabaseAuthError("INVALID_AUTH_SESSION", "De tijdelijke inlogsessie is ongeldig of verlopen.", error.status || 401);
    return client;
  }
}

export function normalizeContext(context) {
  const brands = Array.isArray(context.brands) ? context.brands : [];
  if (!context.profileId || !context.email || !context.role || !context.legalEntityId || !brands.length) {
    throw new SupabaseAuthError("INVALID_SESSION_CONTEXT", "De accountrechten zijn onvolledig.", 403);
  }
  const validRoles = new Set(["owner", "admin", "operator", "finance", "auditor", "viewer"]);
  const validAssurance = new Set(["aal1", "aal2"]);
  const slugs = brands.map((brand) => String(brand?.slug || ""));
  if (!validRoles.has(context.role) || !validAssurance.has(context.assuranceLevel || "aal1")
    || slugs.some((slug) => !/^[a-z][a-z0-9-]{1,62}$/.test(slug))
    || new Set(slugs).size !== slugs.length
    || brands.some((brand) => brand.legalEntityId !== context.legalEntityId)) {
    throw new SupabaseAuthError("INVALID_SESSION_CONTEXT", "De accountscope is ongeldig.", 403);
  }
  return {
    id: context.profileId,
    authUserId: context.authUserId,
    email: String(context.email).toLowerCase(),
    role: "internal",
    iamRole: context.role,
    organizationId: context.legalEntityId,
    name: context.displayName || context.email,
    companyIds: slugs,
    assuranceLevel: context.assuranceLevel || "aal1",
    mfaRequired: context.mfaRequired === true,
    authProvider: "supabase"
  };
}
