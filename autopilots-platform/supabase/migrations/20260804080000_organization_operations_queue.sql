begin;

create or replace function public.autopilots_operations_queue(
  p_profile_id uuid,
  p_legal_entity_id uuid
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, core, iam, workflow, integration
as $$
declare
  v_entity core.legal_entities%rowtype;
begin
  select le.* into v_entity from core.legal_entities le
  where le.id = p_legal_entity_id and le.status = 'active';
  if not found then raise exception 'organization not found' using errcode = 'P0002'; end if;

  if not exists (
    select 1 from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active'
      and m.legal_entity_id = p_legal_entity_id
      and m.brand_id is null and m.status = 'active'
      and m.role in ('owner', 'admin', 'operator', 'auditor')
  ) then
    raise exception 'organization operations role required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'contract', 'autopilots.operations-queue.v1',
    'organization', jsonb_build_object('id', v_entity.id, 'legalName', v_entity.legal_name),
    'summary', jsonb_build_object(
      'openTasks', (select count(*) from workflow.tasks t join core.brands b on b.id = t.brand_id
        where b.legal_entity_id = p_legal_entity_id and t.status in ('open', 'in_progress', 'waiting')),
      'activeIncidents', (select count(*) from integration.incidents i join core.brands b on b.id = i.brand_id
        where b.legal_entity_id = p_legal_entity_id and i.status in ('open', 'acknowledged', 'mitigating')),
      'onboardingErrors', (select count(*) from integration.onboarding_steps s join core.brands b on b.id = s.brand_id
        where b.legal_entity_id = p_legal_entity_id and s.error_code is not null
          and s.status in ('blocked', 'validation_required')),
      'failedCommands', (select count(*) from workflow.commands c join core.brands b on b.id = c.brand_id
        where b.legal_entity_id = p_legal_entity_id and c.status = 'failed' and c.error_code is not null)
    ),
    'tasks', coalesce((select jsonb_agg(jsonb_build_object(
      'id', t.id,
      'brand', jsonb_build_object('slug', b.slug, 'name', b.name, 'code', b.code),
      'title', t.title,
      'priority', t.priority,
      'status', t.status,
      'dueAt', t.due_at,
      'evidence', t.evidence,
      'incidentId', t.incident_id,
      'approvalId', t.approval_id,
      'createdAt', t.created_at,
      'updatedAt', t.updated_at
    ) order by case t.priority when 'P0' then 0 when 'P1' then 1 when 'P2' then 2 else 3 end, t.created_at)
    from workflow.tasks t
    join core.brands b on b.id = t.brand_id
    where b.legal_entity_id = p_legal_entity_id
      and t.status in ('open', 'in_progress', 'waiting')), '[]'::jsonb),
    'signals', coalesce((with scoped_signals as (
      select
        'incident'::text as source,
        i.id::text as source_id,
        b.slug, b.name, b.code,
        i.code as error_code,
        i.severity,
        i.status,
        i.title,
        i.impact as summary,
        i.occurrence_count,
        i.retryable,
        i.last_observed_at as observed_at,
        i.runbook_reference
      from integration.incidents i
      join core.brands b on b.id = i.brand_id
      where b.legal_entity_id = p_legal_entity_id
        and i.status in ('open', 'acknowledged', 'mitigating')
      union all
      select
        'onboarding'::text,
        s.id::text,
        b.slug, b.name, b.code,
        s.error_code,
        case when s.status = 'blocked' then 'P1' else 'P2' end,
        s.status,
        s.title,
        s.instructions,
        1::bigint,
        false,
        s.updated_at,
        null::text
      from integration.onboarding_steps s
      join core.brands b on b.id = s.brand_id
      where b.legal_entity_id = p_legal_entity_id
        and s.error_code is not null
        and s.status in ('blocked', 'validation_required')
      union all
      select
        'command'::text,
        c.id::text,
        b.slug, b.name, b.code,
        c.error_code,
        case c.risk_class when 'R3' then 'P0' when 'R2' then 'P1' else 'P2' end,
        c.status,
        c.command_type,
        'Governed command failed; inspect typed workflow evidence.'::text,
        1::bigint,
        false,
        coalesce(c.completed_at, c.requested_at),
        null::text
      from workflow.commands c
      join core.brands b on b.id = c.brand_id
      where b.legal_entity_id = p_legal_entity_id
        and c.status = 'failed' and c.error_code is not null
    )
    select jsonb_agg(jsonb_build_object(
      'source', source,
      'sourceId', source_id,
      'brand', jsonb_build_object('slug', slug, 'name', name, 'code', code),
      'errorCode', error_code,
      'severity', severity,
      'status', status,
      'title', title,
      'summary', summary,
      'occurrenceCount', occurrence_count,
      'retryable', retryable,
      'observedAt', observed_at,
      'runbookReference', runbook_reference
    ) order by case severity when 'P0' then 0 when 'P1' then 1 when 'P2' then 2 else 3 end, observed_at desc)
    from scoped_signals), '[]'::jsonb),
    'genericTaskActionEnabled', false,
    'automaticRemediationEnabled', false,
    'providerWritesEnabled', false,
    'generatedAt', now()
  );
end;
$$;

revoke all on function public.autopilots_operations_queue(uuid, uuid) from public, anon, authenticated;
grant execute on function public.autopilots_operations_queue(uuid, uuid) to service_role;

commit;
