begin;

create trigger product_connection_gate_evidence_append_only
before update or delete on integration.product_connection_gate_evidence
for each row execute function audit.reject_mutation();

create or replace function public.autopilots_record_product_connection_evidence(
  p_profile_id uuid,
  p_legal_entity_id uuid,
  p_brand_slug text,
  p_gate_key text,
  p_result text,
  p_evidence_sha256 text,
  p_source_category text,
  p_observed_at timestamptz,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, core, iam, integration, workflow, ledger, audit
as $$
declare
  v_brand core.brands%rowtype;
  v_environment core.environments%rowtype;
  v_contract integration.product_snapshot_contracts%rowtype;
  v_policy integration.product_connection_gate_policies%rowtype;
  v_command workflow.commands%rowtype;
  v_command_id uuid := gen_random_uuid();
  v_evidence_id uuid := gen_random_uuid();
  v_context_version bigint;
  v_payload jsonb;
  v_result jsonb;
begin
  if coalesce(p_brand_slug, '') !~ '^[a-z][a-z0-9-]{2,62}$'
    or p_result not in ('passed', 'failed')
    or coalesce(p_evidence_sha256, '') !~ '^[0-9a-f]{64}$'
    or coalesce(p_idempotency_key, '') !~ '^[A-Za-z0-9:_-]{8,160}$' then
    raise exception 'invalid connection evidence input' using errcode = '22023';
  end if;
  if p_gate_key in ('project_identity', 'current_human_approval') then
    raise exception 'gate evidence is derived by a separate authority' using errcode = '42501';
  end if;

  if not exists (
    select 1 from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active'
      and m.legal_entity_id = p_legal_entity_id
      and m.brand_id is null and m.status = 'active'
      and m.role in ('owner', 'admin', 'operator')
  ) then
    raise exception 'organization evidence operator required' using errcode = '42501';
  end if;

  select b.* into v_brand from core.brands b
  where b.legal_entity_id = p_legal_entity_id and b.slug = p_brand_slug
    and b.status <> 'retired';
  if not found then raise exception 'product brand not found' using errcode = 'P0002'; end if;
  select e.* into strict v_environment from core.environments e
  where e.brand_id = v_brand.id and e.kind = 'sandbox';
  select c.* into v_contract from integration.product_snapshot_contracts c
  where c.brand_id = v_brand.id and c.legal_entity_id = p_legal_entity_id
    and c.contract_key = 'autopilots.product-snapshot.v1';
  if not found then raise exception 'product snapshot contract not found' using errcode = 'P0002'; end if;
  select p.* into v_policy from integration.product_connection_gate_policies p
  where p.gate_key = p_gate_key;
  if not found then raise exception 'connection gate not found' using errcode = 'P0002'; end if;

  if p_observed_at is null or p_observed_at > now() + interval '60 seconds'
    or p_observed_at < now() - (v_policy.maximum_age_seconds * interval '1 second') then
    raise exception 'connection evidence observation is outside its validity window' using errcode = '22023';
  end if;
  if p_source_category <> (case
    when p_gate_key = 'owned_https_endpoint' then 'transport_probe'
    when p_gate_key = 'vault_secret_reference' then 'security_test'
    when p_gate_key in ('contract_probe', 'privacy_probe', 'freshness_probe') then 'contract_validator'
    when p_gate_key = 'reconciliation' then 'reconciliation'
    when p_gate_key in ('revocation_test', 'rate_limit_test', 'failure_mode_test') then 'security_test'
    when p_gate_key = 'independent_review' then 'independent_review'
    else null
  end) then
    raise exception 'source category does not own this gate' using errcode = '42501';
  end if;

  v_context_version := greatest(1, extract(epoch from v_contract.updated_at)::bigint);
  v_payload := jsonb_build_object(
    'legalEntityId', p_legal_entity_id,
    'snapshotContractId', v_contract.id,
    'gateKey', p_gate_key,
    'result', p_result,
    'evidenceSha256', p_evidence_sha256,
    'sourceCategory', p_source_category,
    'observedAt', p_observed_at
  );

  select c.* into v_command from workflow.commands c
  where c.brand_id = v_brand.id and c.environment_id = v_environment.id
    and c.idempotency_key = p_idempotency_key;
  if found then
    if v_command.command_type <> 'integration.connection-evidence.record'
      or v_command.context_version <> v_context_version
      or v_command.payload <> v_payload then
      raise exception 'idempotency key reused with different connection evidence' using errcode = '23505';
    end if;
    return v_command.result || jsonb_build_object('replayed', true);
  end if;

  insert into integration.product_connection_gate_evidence (
    id, legal_entity_id, brand_id, snapshot_contract_id, gate_key, result,
    evidence_sha256, source_category, observed_at, expires_at
  ) values (
    v_evidence_id, p_legal_entity_id, v_brand.id, v_contract.id, p_gate_key, p_result,
    p_evidence_sha256, p_source_category, p_observed_at,
    p_observed_at + (v_policy.maximum_age_seconds * interval '1 second')
  );

  v_result := jsonb_build_object(
    'contract', 'autopilots.product-connection-evidence-recorded.v1',
    'evidenceId', v_evidence_id,
    'brand', p_brand_slug,
    'gateKey', p_gate_key,
    'result', p_result,
    'riskClass', 'R1',
    'dataConnectionEnabled', false,
    'providerAuthorizationEnabled', false,
    'externalWritesEnabled', false,
    'replayed', false
  );

  insert into workflow.commands (
    id, brand_id, environment_id, actor_profile_id, command_type, risk_class,
    idempotency_key, status, context_version, payload, result, completed_at
  ) values (
    v_command_id, v_brand.id, v_environment.id, p_profile_id,
    'integration.connection-evidence.record', 'R1', p_idempotency_key,
    'succeeded', v_context_version, v_payload, v_result, now()
  ) returning * into v_command;

  insert into ledger.usage_entries (
    legal_entity_id, brand_id, environment_id, provider, metric, quantity, unit,
    total_cost_minor, currency, quality, source_reference, idempotency_key, occurred_at
  ) values (
    p_legal_entity_id, v_brand.id, v_environment.id,
    'autopilots-control-plane', 'governed_command', 1, 'command',
    0, 'EUR', 'measured', v_command_id::text, 'usage:' || p_idempotency_key, now()
  );

  insert into audit.events (
    legal_entity_id, brand_id, environment_id, actor_type, actor_id, action,
    entity_type, entity_id, risk_class, result, evidence, correlation_id, source
  ) values (
    p_legal_entity_id, v_brand.id, v_environment.id, 'user', p_profile_id::text,
    'integration.connection-evidence.record', 'product_connection_gate_evidence',
    v_evidence_id::text, 'R1', 'succeeded',
    jsonb_build_array(jsonb_build_object(
      'commandId', v_command_id, 'gateKey', p_gate_key,
      'evidenceSha256', p_evidence_sha256, 'sourceCategory', p_source_category
    )), v_command.correlation_id, 'autopilots-control-plane'
  );

  return v_result;
end;
$$;

revoke all on function public.autopilots_record_product_connection_evidence(
  uuid, uuid, text, text, text, text, text, timestamptz, text
) from public, anon, authenticated;
grant execute on function public.autopilots_record_product_connection_evidence(
  uuid, uuid, text, text, text, text, text, timestamptz, text
) to service_role;

commit;
