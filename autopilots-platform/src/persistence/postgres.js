import { normalizeCommandRequest, assertIdempotentReplay, PersistenceError } from "./contracts.js";

export async function createPostgresConnection({ databaseUrl, max = 10 }) {
  if (!databaseUrl) throw new PersistenceError("DATABASE_URL_REQUIRED", "DATABASE_URL ontbreekt.", 500);
  const { default: postgres } = await import("postgres");
  return postgres(databaseUrl, {
    max,
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
    prepare: true,
    onnotice: () => undefined
  });
}

export class FoundationRepository {
  constructor(sql) {
    if (typeof sql !== "function" || typeof sql.begin !== "function") {
      throw new PersistenceError("INVALID_DATABASE_CLIENT", "Een transactionele PostgreSQL-client is vereist.", 500);
    }
    this.sql = sql;
  }

  async health() {
    const [row] = await this.sql`
      select
        current_database() as database_name,
        to_regclass('core.brands') is not null as foundation_installed,
        to_regclass('workflow.commands') is not null as commands_installed,
        now() as checked_at
    `;
    return row;
  }

  async portfolioForAuthUser(authUserId) {
    const rows = await this.sql`
      select
        le.id as legal_entity_id,
        le.legal_name,
        le.base_currency,
        b.id as brand_id,
        b.slug,
        b.name,
        b.code,
        b.status,
        m.role
      from iam.profiles p
      join iam.memberships m on m.profile_id = p.id and m.status = 'active'
      join core.legal_entities le on le.id = m.legal_entity_id
      join core.brands b on b.legal_entity_id = le.id and (m.brand_id is null or m.brand_id = b.id)
      where p.auth_user_id = ${authUserId}
        and p.status = 'active'
      order by le.legal_name, b.name
    `;
    return rows;
  }

  async requestCommand(input, authContext) {
    const command = normalizeCommandRequest(input);
    const authUserId = requiredAuthUserId(authContext?.authUserId);
    return this.sql.begin(async (tx) => {
      const environmentRows = await tx`
        select id, brand_id, kind, context_version, external_writes_enabled
        from core.environments
        where id = ${command.environmentId} and brand_id = ${command.brandId}
        for update
      `;
      const environment = environmentRows[0];
      if (!environment) throw new PersistenceError("ENVIRONMENT_NOT_FOUND", "Omgeving valt niet binnen het gekozen merk.", 404);
      if (Number(environment.context_version) !== command.contextVersion) {
        throw new PersistenceError("STALE_CONTEXT", "De opdrachtcontext is gewijzigd; laad de actuele context opnieuw.", 409);
      }
      if (environment.kind !== "production" && environment.external_writes_enabled) {
        throw new PersistenceError("INVALID_WRITE_BOUNDARY", "Niet-productieomgevingen mogen geen externe writes uitvoeren.", 409);
      }

      const memberships = await tx`
        select p.id as profile_id, m.role
        from iam.profiles p
        join iam.memberships m on m.profile_id = p.id and m.status = 'active'
        join core.brands b on b.legal_entity_id = m.legal_entity_id
        where p.auth_user_id = ${authUserId}
          and p.status = 'active'
          and b.id = ${command.brandId}
          and (m.brand_id is null or m.brand_id = b.id)
      `;
      const actor = authorizeCommandActor(memberships, command.riskClass);

      const inserted = await tx`
        insert into workflow.commands (
          brand_id, environment_id, actor_profile_id, command_type, risk_class,
          idempotency_key, status, context_version, payload
        ) values (
          ${command.brandId}, ${command.environmentId}, ${actor.profile_id}, ${command.commandType}, ${command.riskClass},
          ${command.idempotencyKey}, ${command.riskClass === "R3" ? "approval_required" : "requested"},
          ${command.contextVersion}, ${tx.json({ ...command.payload, _fingerprint: command.fingerprint })}
        )
        on conflict (brand_id, environment_id, idempotency_key) do nothing
        returning *
      `;

      let persisted = inserted[0];
      if (!persisted) {
        const rows = await tx`
          select * from workflow.commands
          where brand_id = ${command.brandId}
            and environment_id = ${command.environmentId}
            and idempotency_key = ${command.idempotencyKey}
        `;
        persisted = rows[0];
        if (!persisted) throw new PersistenceError("COMMAND_RACE", "Opdracht kon niet betrouwbaar worden teruggelezen.", 409);
        assertIdempotentReplay({
          brandId: persisted.brand_id,
          environmentId: persisted.environment_id,
          commandType: persisted.command_type,
          riskClass: persisted.risk_class,
          contextVersion: Number(persisted.context_version),
          payload: stripFingerprint(persisted.payload),
          fingerprint: persisted.payload?._fingerprint
        }, command);
        return persisted;
      }

      if (command.riskClass === "R3") {
        await tx`
          insert into workflow.approvals (
            command_id, brand_id, risk_class, context_version, rationale, evidence, requested_by
          ) values (
            ${persisted.id}, ${command.brandId}, ${command.riskClass}, ${command.contextVersion},
            ${command.reason}, ${tx.json(command.evidence)}, ${actor.profile_id}
          )
        `;
      }

      await tx`
        insert into audit.events (
          legal_entity_id, brand_id, environment_id, actor_type, actor_id, action,
          entity_type, entity_id, risk_class, result, reason, after_value,
          evidence, correlation_id, source
        )
        select b.legal_entity_id, ${command.brandId}, ${command.environmentId},
          'user', ${actor.profile_id},
          ${command.commandType}, 'command', ${persisted.id}, ${command.riskClass},
          'requested', ${command.reason}, ${tx.json({ status: persisted.status })},
          ${tx.json(command.evidence)}, ${persisted.correlation_id}, ${command.source}
        from core.brands b where b.id = ${command.brandId}
      `;

      return persisted;
    });
  }
}

const COMMAND_ROLES = Object.freeze({
  R0: new Set(["owner", "admin", "operator", "finance"]),
  R1: new Set(["owner", "admin", "operator", "finance"]),
  R2: new Set(["owner", "admin", "operator"]),
  R3: new Set(["owner", "admin"])
});

export function authorizeCommandActor(memberships, riskClass) {
  const allowed = COMMAND_ROLES[riskClass];
  const actor = Array.isArray(memberships) ? memberships.find((membership) => allowed?.has(membership.role)) : null;
  if (!actor?.profile_id) {
    throw new PersistenceError("COMMAND_FORBIDDEN", "Deze gebruiker mag deze opdracht niet voor dit merk aanvragen.", 403);
  }
  return actor;
}

function requiredAuthUserId(value) {
  const normalized = String(value || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
    throw new PersistenceError("AUTH_CONTEXT_REQUIRED", "Een geldige server-gevalideerde gebruikerscontext is verplicht.", 401);
  }
  return normalized;
}

function stripFingerprint(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
  const { _fingerprint, ...rest } = payload;
  return rest;
}
