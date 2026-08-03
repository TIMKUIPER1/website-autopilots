begin;

create table workflow.alert_policies (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references core.legal_entities(id) on delete restrict,
  severity text not null check (severity in ('P0', 'P1', 'P2', 'P3')),
  minimum_occurrences integer not null check (minimum_occurrences between 1 and 100),
  escalation_after_seconds integer not null check (escalation_after_seconds between 0 and 604800),
  repeat_suppression_seconds integer not null check (repeat_suppression_seconds between 60 and 604800),
  escalation_owner text not null check (char_length(escalation_owner) between 2 and 120),
  policy_status text not null default 'active' check (policy_status in ('active', 'disabled')),
  human_review_required boolean not null default true check (human_review_required = true),
  notification_channel text not null default 'none' check (notification_channel = 'none'),
  automatic_remediation_enabled boolean not null default false check (automatic_remediation_enabled = false),
  notification_delivery_enabled boolean not null default false check (notification_delivery_enabled = false),
  provider_writes_enabled boolean not null default false check (provider_writes_enabled = false),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (legal_entity_id, severity)
);

alter table workflow.alert_policies enable row level security;
revoke all on workflow.alert_policies from public, anon, authenticated;
grant select on workflow.alert_policies to service_role;
revoke insert, update, delete, truncate, references, trigger on workflow.alert_policies from service_role;

insert into workflow.alert_policies (
  id, legal_entity_id, severity, minimum_occurrences, escalation_after_seconds,
  repeat_suppression_seconds, escalation_owner
) values
  ('92000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'P0', 1, 0, 300, 'Autopilots incident owner'),
  ('92000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'P1', 2, 900, 1800, 'Autopilots operations owner'),
  ('92000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'P2', 3, 3600, 7200, 'Operating brand owner'),
  ('92000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'P3', 5, 21600, 43200, 'Operating brand owner');

create or replace function public.autopilots_alert_policy_snapshot(
  p_profile_id uuid,
  p_legal_entity_id uuid
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, core, iam, integration, workflow
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
    raise exception 'organization alert policy role required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'contract', 'autopilots.alert-policy-snapshot.v1',
    'organization', jsonb_build_object('id', v_entity.id, 'legalName', v_entity.legal_name),
    'summary', jsonb_build_object(
      'activeIncidents', (select count(*) from integration.incidents i join core.brands b on b.id = i.brand_id
        where b.legal_entity_id = p_legal_entity_id and i.status in ('open', 'acknowledged', 'mitigating')),
      'escalationDue', (select count(*) from integration.incidents i
        join core.brands b on b.id = i.brand_id
        join workflow.alert_policies p on p.legal_entity_id = b.legal_entity_id and p.severity = i.severity and p.policy_status = 'active'
        where b.legal_entity_id = p_legal_entity_id and i.status in ('open', 'acknowledged', 'mitigating')
          and i.occurrence_count >= p.minimum_occurrences
          and i.first_observed_at <= now() - make_interval(secs => p.escalation_after_seconds)),
      'notificationAttempts', 0,
      'deliveries', 0
    ),
    'policies', coalesce((select jsonb_agg(jsonb_build_object(
      'severity', p.severity,
      'minimumOccurrences', p.minimum_occurrences,
      'escalationAfterSeconds', p.escalation_after_seconds,
      'repeatSuppressionSeconds', p.repeat_suppression_seconds,
      'escalationOwner', p.escalation_owner,
      'status', p.policy_status,
      'version', p.version,
      'humanReviewRequired', p.human_review_required,
      'notificationChannel', p.notification_channel
    ) order by case p.severity when 'P0' then 0 when 'P1' then 1 when 'P2' then 2 else 3 end)
    from workflow.alert_policies p
    where p.legal_entity_id = p_legal_entity_id), '[]'::jsonb),
    'candidates', coalesce((select jsonb_agg(jsonb_build_object(
      'incidentId', i.id,
      'brand', jsonb_build_object('slug', b.slug, 'name', b.name, 'code', b.code),
      'errorCode', i.code,
      'severity', i.severity,
      'incidentStatus', i.status,
      'occurrenceCount', i.occurrence_count,
      'deduplicatedOccurrences', greatest(0, i.occurrence_count - 1),
      'ageSeconds', greatest(0, floor(extract(epoch from now() - i.first_observed_at)))::bigint,
      'policyState', case
        when p.id is null or p.policy_status <> 'active' then 'human_attention'
        when i.occurrence_count < p.minimum_occurrences then 'observe'
        when i.first_observed_at > now() - make_interval(secs => p.escalation_after_seconds) then 'human_attention'
        else 'escalation_due' end,
      'minimumOccurrences', p.minimum_occurrences,
      'escalationAfterSeconds', p.escalation_after_seconds,
      'repeatSuppressionSeconds', p.repeat_suppression_seconds,
      'escalationOwner', coalesce(r.escalation_owner, p.escalation_owner, 'Autopilots operations owner'),
      'runbookVersion', r.version,
      'deliveryStatus', 'disabled',
      'notificationAttempted', false,
      'notificationDelivered', false,
      'humanReviewRequired', true
    ) order by case i.severity when 'P0' then 0 when 'P1' then 1 when 'P2' then 2 else 3 end, i.last_observed_at desc)
    from integration.incidents i
    join core.brands b on b.id = i.brand_id
    left join workflow.alert_policies p on p.legal_entity_id = b.legal_entity_id and p.severity = i.severity
    left join workflow.error_runbooks r on r.brand_id = i.brand_id and r.error_code = i.code
    where b.legal_entity_id = p_legal_entity_id and i.status in ('open', 'acknowledged', 'mitigating')), '[]'::jsonb),
    'automaticRemediationEnabled', false,
    'notificationDeliveryEnabled', false,
    'providerWritesEnabled', false,
    'generatedAt', now()
  );
end;
$$;

revoke all on function public.autopilots_alert_policy_snapshot(uuid, uuid) from public, anon, authenticated;
grant execute on function public.autopilots_alert_policy_snapshot(uuid, uuid) to service_role;

commit;
