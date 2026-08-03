begin;

create or replace function public.autopilots_decide_access_request(
  p_profile_id uuid, p_legal_entity_id uuid, p_request_id uuid,
  p_decision text, p_context_version bigint, p_idempotency_key text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, core, iam, workflow, ledger, audit
as $$
declare
  v_request iam.access_requests%rowtype;
  v_stage_command workflow.commands%rowtype;
  v_approval workflow.approvals%rowtype;
  v_decision_command workflow.commands%rowtype;
  v_decision_command_id uuid := gen_random_uuid();
begin
  if p_decision not in ('approved', 'rejected') then
    raise exception 'invalid access decision' using errcode = '22023';
  end if;
  if p_context_version is null or p_context_version < 1 then
    raise exception 'invalid access context' using errcode = '22023';
  end if;
  if coalesce(p_idempotency_key, '') !~ '^[A-Za-z0-9:_-]{8,160}$' then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;
  if not exists (
    select 1 from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active'
      and m.legal_entity_id = p_legal_entity_id
      and m.brand_id is null and m.status = 'active'
      and m.role in ('owner', 'admin')
  ) then
    raise exception 'organization access manager required' using errcode = '42501';
  end if;

  select c.* into v_decision_command
  from workflow.commands c join core.brands b on b.id = c.brand_id
  where b.legal_entity_id = p_legal_entity_id
    and c.command_type = 'iam.access.decide'
    and c.idempotency_key = p_idempotency_key;
  if found then
    if v_decision_command.payload ->> 'requestId' <> p_request_id::text
      or v_decision_command.payload ->> 'decision' <> p_decision
      or (v_decision_command.payload ->> 'contextVersion')::bigint <> p_context_version then
      raise exception 'idempotency key reused with different access decision' using errcode = '23505';
    end if;
    return v_decision_command.result || jsonb_build_object('replayed', true);
  end if;

  select r.* into v_request from iam.access_requests r
  where r.id = p_request_id and r.legal_entity_id = p_legal_entity_id for update;
  if not found then raise exception 'access request not found' using errcode = 'P0002'; end if;
  if v_request.request_status <> 'approval_required' then
    raise exception 'access request is no longer pending' using errcode = '55000';
  end if;
  if v_request.context_version <> p_context_version then
    raise exception 'stale access request context' using errcode = 'P0001';
  end if;

  select c.* into strict v_stage_command from workflow.commands c where c.id = v_request.command_id for update;
  select a.* into strict v_approval from workflow.approvals a where a.id = v_request.approval_id for update;
  if v_stage_command.status <> 'approval_required' or v_approval.status <> 'pending'
    or v_approval.context_version <> p_context_version then
    raise exception 'access approval state conflict' using errcode = '55000';
  end if;

  update workflow.approvals set status = p_decision, decided_by = p_profile_id,
    decided_at = now(), evidence = evidence || jsonb_build_array(
      'decision:no_membership_applied', 'decision:no_provider_invite', 'decision:external_writes_false'
    ) where id = v_approval.id;
  update workflow.commands set status = p_decision, result = jsonb_build_object(
    'decision', p_decision, 'membershipApplied', false,
    'providerInviteSent', false, 'externalWrites', false
  ), completed_at = now() where id = v_stage_command.id;
  update iam.access_requests set request_status = p_decision,
    context_version = context_version + 1, updated_at = now() where id = v_request.id;

  insert into workflow.commands (
    id, brand_id, environment_id, actor_profile_id, command_type, risk_class,
    idempotency_key, status, context_version, payload, result, correlation_id, completed_at
  ) values (
    v_decision_command_id, v_stage_command.brand_id, v_stage_command.environment_id,
    p_profile_id, 'iam.access.decide', 'R2', p_idempotency_key, 'succeeded', p_context_version,
    jsonb_build_object('requestId', v_request.id, 'decision', p_decision, 'contextVersion', p_context_version),
    jsonb_build_object(
      'contract', 'autopilots.access-decision.v1', 'requestId', v_request.id,
      'decisionCommandId', v_decision_command_id, 'status', p_decision,
      'contextVersion', p_context_version + 1, 'membershipApplied', false,
      'providerInviteSent', false, 'externalWrites', false, 'replayed', false
    ), v_request.id, now()
  ) returning * into v_decision_command;

  insert into ledger.usage_entries (
    legal_entity_id, brand_id, environment_id, provider, metric, quantity, unit,
    total_cost_minor, currency, quality, source_reference, idempotency_key, occurred_at
  ) values (
    p_legal_entity_id, v_stage_command.brand_id, v_stage_command.environment_id,
    'autopilots-control-plane', 'governed_command', 1, 'command', 0, 'EUR',
    'measured', v_decision_command_id::text, 'usage:' || p_idempotency_key, now()
  );
  insert into audit.events (
    legal_entity_id, brand_id, environment_id, actor_type, actor_id, action,
    entity_type, entity_id, risk_class, result, reason, evidence, correlation_id, source
  ) values (
    p_legal_entity_id, v_stage_command.brand_id, v_stage_command.environment_id,
    'user', p_profile_id::text, 'iam.access.decide', 'access_request', v_request.id::text,
    'R2', p_decision,
    'Human decision recorded; identity, membership and provider delivery remain unapplied.',
    jsonb_build_array(jsonb_build_object(
      'decisionCommandId', v_decision_command_id, 'stageCommandId', v_stage_command.id,
      'approvalId', v_approval.id, 'contextVersion', p_context_version,
      'membershipApplied', false, 'providerInviteSent', false, 'externalWrites', false
    )), v_request.id, 'autopilots-control-plane'
  );
  return v_decision_command.result;
end;
$$;

revoke all on function public.autopilots_decide_access_request(uuid, uuid, uuid, text, bigint, text) from public, anon, authenticated;
grant execute on function public.autopilots_decide_access_request(uuid, uuid, uuid, text, bigint, text) to service_role;

commit;
