begin;

create table workflow.error_runbooks (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references core.brands(id) on delete restrict,
  error_code text not null check (error_code ~ '^[A-Z][A-Z0-9_]{2,119}$'),
  title text not null check (char_length(title) between 2 and 160),
  operator_summary text not null check (char_length(operator_summary) between 2 and 500),
  first_response jsonb not null check (jsonb_typeof(first_response) = 'array' and jsonb_array_length(first_response) between 1 and 6),
  escalation_owner text not null check (char_length(escalation_owner) between 2 and 120),
  severity text not null check (severity in ('P0', 'P1', 'P2', 'P3')),
  version integer not null default 1 check (version > 0),
  source_reference text not null check (source_reference ~ '^docs/runbooks/[A-Za-z0-9_./-]{3,240}\.md$'),
  automatic_remediation_enabled boolean not null default false check (automatic_remediation_enabled = false),
  notification_delivery_enabled boolean not null default false check (notification_delivery_enabled = false),
  provider_writes_enabled boolean not null default false check (provider_writes_enabled = false),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, error_code)
);

alter table workflow.error_runbooks enable row level security;
revoke all on workflow.error_runbooks from public, anon, authenticated;
grant select on workflow.error_runbooks to service_role;
revoke insert, update, delete, truncate, references, trigger on workflow.error_runbooks from service_role;

insert into workflow.error_runbooks (
  id, brand_id, error_code, title, operator_summary, first_response,
  escalation_owner, severity, source_reference
) values
  ('91000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'AUTOREVIEWS_LEGACY_SOURCE_UNREACHABLE',
   'AutoReviews bron niet bereikbaar', 'De geregistreerde AutoReviews-bron levert geen actuele read-only snapshot.',
   '["Controleer de tijd van de laatste waarneming.","Herhaal alleen de read-only healthcontrole.","Laat de AutoReviews-eigenaar endpoint en service-status verifiëren."]',
   'AutoReviews product owner', 'P1', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'AUTOREVIEWS_UNREACHABLE',
   'AutoReviews API onbereikbaar', 'De ingestelde AutoReviews-snapshotendpoint antwoordt niet binnen de veilige grens.',
   '["Bevestig dat de observatie actueel is.","Controleer alleen bereikbaarheid en de allowlisted origin.","Escaleren naar AutoReviews zonder credentials in tickets te plaatsen."]',
   'AutoReviews product owner', 'P1', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003', 'AUTOPLANNER_DEPENDENCIES_MISSING',
   'AutoPlanner dependency ontbreekt', 'AutoPlanner antwoordt, maar minimaal één vereiste dependency is nog niet gereed.',
   '["Controleer de actuele ready-status.","Noteer welke dependency als missing wordt gemeld.","Laat de AutoPlanner-eigenaar de dependency herstellen en valideer daarna read-only."]',
   'AutoPlanner product owner', 'P2', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000003', 'AUTOPLANNER_DESTINATION_BLOCKED',
   'AutoPlanner bestemming geblokkeerd', 'De ingestelde bestemming voldoet niet aan het exacte read-only originbeleid.',
   '["Wijzig geen destination vanuit het incident.","Vergelijk endpoint en goedgekeurde origin buiten de UI.","Laat een configuratiewijziging apart reviewen."]',
   'Autopilots platform owner', 'P1', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000004', 'ROOFPLANNER_API_UNREACHABLE',
   'RoofPlanner API onbereikbaar', 'De RoofPlanner healthendpoint kon niet veilig worden bereikt.',
   '["Bevestig de laatste waarneming en foutcode.","Controleer read-only bereikbaarheid van de healthendpoint.","Escaleren naar de RoofPlanner-eigenaar; voer geen automatische restart uit."]',
   'RoofPlanner product owner', 'P1', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000004', 'ROOFPLANNER_DEPENDENCIES_NOT_READY',
   'RoofPlanner dependencies niet gereed', 'RoofPlanner antwoordt, maar de readinesscontrole meldt nog niet gereed.',
   '["Controleer de actuele readinesswaarneming.","Identificeer de niet-gereed dependency zonder private payload te kopiëren.","Laat de RoofPlanner-eigenaar herstellen en valideer opnieuw read-only."]',
   'RoofPlanner product owner', 'P2', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000004', 'ROOFPLANNER_DESTINATION_BLOCKED',
   'RoofPlanner bestemming geblokkeerd', 'De ingestelde bestemming voldoet niet aan het exacte read-only originbeleid.',
   '["Wijzig geen destination vanuit het incident.","Vergelijk endpoint en goedgekeurde origin buiten de UI.","Laat een configuratiewijziging apart reviewen."]',
   'Autopilots platform owner', 'P1', 'docs/runbooks/ERROR_RESPONSE.md');

create or replace function public.autopilots_error_runbooks(
  p_profile_id uuid,
  p_legal_entity_id uuid
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, core, iam, workflow
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
    raise exception 'organization runbook role required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'contract', 'autopilots.error-runbooks.v1',
    'organization', jsonb_build_object('id', v_entity.id, 'legalName', v_entity.legal_name),
    'runbooks', coalesce((select jsonb_agg(jsonb_build_object(
      'brand', jsonb_build_object('slug', b.slug, 'name', b.name, 'code', b.code),
      'errorCode', r.error_code,
      'title', r.title,
      'operatorSummary', r.operator_summary,
      'firstResponse', r.first_response,
      'escalationOwner', r.escalation_owner,
      'severity', r.severity,
      'version', r.version,
      'sourceReference', r.source_reference
    ) order by b.slug, r.error_code)
    from workflow.error_runbooks r
    join core.brands b on b.id = r.brand_id
    where b.legal_entity_id = p_legal_entity_id and b.status <> 'archived'), '[]'::jsonb),
    'automaticRemediationEnabled', false,
    'notificationDeliveryEnabled', false,
    'providerWritesEnabled', false,
    'generatedAt', now()
  );
end;
$$;

revoke all on function public.autopilots_error_runbooks(uuid, uuid) from public, anon, authenticated;
grant execute on function public.autopilots_error_runbooks(uuid, uuid) to service_role;

commit;
