begin;

create or replace function public.autopilots_record_product_snapshot_evidence(
  p_profile_id uuid,
  p_legal_entity_id uuid,
  p_brand_slug text,
  p_contract_sha256 text,
  p_privacy_sha256 text,
  p_freshness_sha256 text,
  p_observed_at timestamptz,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_contract jsonb;
  v_privacy jsonb;
  v_freshness jsonb;
begin
  if coalesce(p_idempotency_key, '') !~ '^snapshot:[0-9a-f]{32}$' then
    raise exception 'invalid snapshot evidence idempotency key' using errcode = '22023';
  end if;

  v_contract := public.autopilots_record_product_connection_evidence(
    p_profile_id, p_legal_entity_id, p_brand_slug, 'contract_probe', 'passed',
    p_contract_sha256, 'contract_validator', p_observed_at, p_idempotency_key || ':contract'
  );
  v_privacy := public.autopilots_record_product_connection_evidence(
    p_profile_id, p_legal_entity_id, p_brand_slug, 'privacy_probe', 'passed',
    p_privacy_sha256, 'contract_validator', p_observed_at, p_idempotency_key || ':privacy'
  );
  v_freshness := public.autopilots_record_product_connection_evidence(
    p_profile_id, p_legal_entity_id, p_brand_slug, 'freshness_probe', 'passed',
    p_freshness_sha256, 'contract_validator', p_observed_at, p_idempotency_key || ':freshness'
  );

  return jsonb_build_object(
    'contract', 'autopilots.product-snapshot-evidence-recorded.v1',
    'brand', p_brand_slug,
    'records', jsonb_build_array(v_contract, v_privacy, v_freshness),
    'riskClass', 'R1',
    'atomic', true,
    'dataConnectionEnabled', false,
    'providerAuthorizationEnabled', false,
    'externalWritesEnabled', false,
    'replayed', (v_contract ->> 'replayed')::boolean
      and (v_privacy ->> 'replayed')::boolean
      and (v_freshness ->> 'replayed')::boolean
  );
end;
$$;

revoke all on function public.autopilots_record_product_snapshot_evidence(
  uuid, uuid, text, text, text, text, timestamptz, text
) from public, anon, authenticated;
grant execute on function public.autopilots_record_product_snapshot_evidence(
  uuid, uuid, text, text, text, text, timestamptz, text
) to service_role;

commit;
