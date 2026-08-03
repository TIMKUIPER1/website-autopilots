begin;

insert into workflow.error_runbooks (
  id, brand_id, error_code, title, operator_summary, first_response,
  escalation_owner, severity, source_reference
) values
  ('91000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000002', 'AUTOREVIEWS_DESTINATION_BLOCKED',
   'AutoReviews bestemming geblokkeerd', 'De AutoReviews-bestemming voldoet niet aan het exacte read-only originbeleid.',
   '["Wijzig geen destination vanuit het incident.","Vergelijk endpoint en goedgekeurde origin buiten de UI.","Laat een configuratiewijziging apart reviewen."]',
   'Autopilots platform owner', 'P1', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000002', 'AUTOREVIEWS_INVALID_CONTRACT',
   'AutoReviews contract ongeldig', 'De AutoReviews-snapshot voldoet niet aan het afgesproken aggregate-no-PII contract.',
   '["Bevestig de actuele contractversie.","Vergelijk alleen veldnamen en classificatie met het snapshotcontract.","Laat de AutoReviews-eigenaar het contract herstellen zonder private payload te kopiëren."]',
   'AutoReviews product owner', 'P2', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000002', 'AUTOREVIEWS_INVALID_JSON',
   'AutoReviews antwoord ongeldig', 'De AutoReviews-snapshotendpoint antwoordt, maar niet met geldige JSON.',
   '["Bevestig dat de observatie actueel is.","Controleer alleen content-type en contractstatus.","Laat de AutoReviews-eigenaar de response herstellen; kopieer geen ruwe response."]',
   'AutoReviews product owner', 'P2', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000002', 'AUTOREVIEWS_RESPONSE_TOO_LARGE',
   'AutoReviews antwoord te groot', 'De AutoReviews-snapshot overschrijdt de maximale read-only responsegrens.',
   '["Bevestig de maximale contractgrootte.","Vraag alleen geaggregeerde velden en paginering te controleren.","Verhoog de limiet niet vanuit een incident."]',
   'AutoReviews product owner', 'P2', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000003', 'AUTOPLANNER_API_ACCESS_DENIED',
   'AutoPlanner healthtoegang geweigerd', 'De AutoPlanner health- of readinessendpoint weigert de read-only controle.',
   '["Bevestig welke endpointstatus 401 of 403 retourneert.","Controleer de goedgekeurde read-only toegang buiten de incidentweergave.","Roteer of deel geen credentials vanuit het incident."]',
   'AutoPlanner product owner', 'P1', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000013', '20000000-0000-4000-8000-000000000003', 'AUTOPLANNER_API_UNREACHABLE',
   'AutoPlanner API onbereikbaar', 'De AutoPlanner healthendpoint kon niet veilig binnen de tijdgrens worden bereikt.',
   '["Bevestig de laatste waarneming en HTTP-status.","Controleer alleen read-only bereikbaarheid van de healthendpoint.","Escaleren naar de AutoPlanner-eigenaar; voer geen automatische restart uit."]',
   'AutoPlanner product owner', 'P1', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000014', '20000000-0000-4000-8000-000000000003', 'AUTOPLANNER_HEALTH_CONTRACT_INVALID',
   'AutoPlanner healthcontract ongeldig', 'De AutoPlanner healthendpoint antwoordt, maar het antwoord is ongeldig of te groot.',
   '["Bevestig de actuele healthcontractversie.","Controleer alleen responsevorm, content-type en grootte.","Laat de AutoPlanner-eigenaar het contract herstellen zonder ruwe payload te kopiëren."]',
   'AutoPlanner product owner', 'P2', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000015', '20000000-0000-4000-8000-000000000003', 'AUTOPLANNER_READINESS_CONTRACT_INVALID',
   'AutoPlanner readinesscontract ongeldig', 'De AutoPlanner readinessendpoint antwoordt, maar het antwoord is ongeldig of te groot.',
   '["Bevestig de actuele readinesscontractversie.","Controleer alleen responsevorm, content-type en grootte.","Laat de AutoPlanner-eigenaar het contract herstellen zonder dependencydetails te kopiëren."]',
   'AutoPlanner product owner', 'P2', 'docs/runbooks/ERROR_RESPONSE.md'),
  ('91000000-0000-4000-8000-000000000016', '20000000-0000-4000-8000-000000000003', 'AUTOPLANNER_READINESS_UNAVAILABLE',
   'AutoPlanner readiness niet beschikbaar', 'De healthendpoint antwoordt, maar de readinessendpoint is niet veilig bereikbaar.',
   '["Bevestig de actuele health- en readinessstatus.","Controleer alleen read-only bereikbaarheid van de readinessendpoint.","Laat de AutoPlanner-eigenaar endpoint en dependencies verifiëren."]',
   'AutoPlanner product owner', 'P2', 'docs/runbooks/ERROR_RESPONSE.md');

do $$
declare
  v_generic integration.incidents%rowtype;
begin
  select i.* into v_generic
  from integration.incidents i
  where i.brand_id = '20000000-0000-4000-8000-000000000003'
    and i.code = 'UNREACHABLE'
    and i.status in ('open', 'acknowledged', 'mitigating')
  for update;

  if found then
    if exists (
      select 1 from integration.incidents i
      where i.brand_id = v_generic.brand_id
        and i.connection_id = v_generic.connection_id
        and i.code = 'AUTOPLANNER_API_UNREACHABLE'
        and i.status in ('open', 'acknowledged', 'mitigating')
    ) then
      update integration.incidents
      set status = 'resolved', updated_at = now(),
          context = context || jsonb_build_object(
            'resolutionReason', 'normalized_duplicate_error_code',
            'supersededByCode', 'AUTOPLANNER_API_UNREACHABLE'
          )
      where id = v_generic.id;
    else
      update integration.incidents
      set code = 'AUTOPLANNER_API_UNREACHABLE',
          runbook_reference = 'docs/runbooks/ERROR_RESPONSE.md',
          updated_at = now(),
          context = context || jsonb_build_object(
            'normalizedFromCode', 'UNREACHABLE',
            'normalizationContract', 'autopilots.product-health.v1'
          )
      where id = v_generic.id;
    end if;
  end if;
end;
$$;

with latest as (
  select distinct on (h.connection_id)
    h.connection_id,
    h.brand_id,
    case
      when h.brand_id = '20000000-0000-4000-8000-000000000003'
        and h.error_code = 'UNREACHABLE'
      then 'AUTOPLANNER_API_UNREACHABLE'
      else h.error_code
    end as current_error_code,
    h.status,
    h.id as health_event_id
  from integration.health_events h
  order by h.connection_id, h.observed_at desc, h.id desc
)
update integration.incidents i
set status = 'resolved', updated_at = now(),
    context = i.context || jsonb_build_object(
      'resolutionReason', 'superseded_by_latest_health_observation',
      'resolvedByObservationId', latest.health_event_id,
      'supersededByCode', latest.current_error_code
    )
from latest
where i.connection_id = latest.connection_id
  and i.brand_id = latest.brand_id
  and i.status in ('open', 'acknowledged', 'mitigating')
  and (latest.status = 'healthy' or i.code is distinct from latest.current_error_code);

update integration.incidents
set runbook_reference = 'docs/runbooks/ERROR_RESPONSE.md', updated_at = now()
where status in ('open', 'acknowledged', 'mitigating')
  and exists (
    select 1 from workflow.error_runbooks r
    where r.brand_id = integration.incidents.brand_id
      and r.error_code = integration.incidents.code
  );

create or replace function public.autopilots_record_product_health(
  p_profile_id uuid,
  p_brand_slug text,
  p_status text,
  p_error_code text,
  p_summary text,
  p_observed_at timestamptz,
  p_observation_key text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, core, iam, integration, audit
as $$
declare
  v_brand core.brands%rowtype;
  v_connection integration.connections%rowtype;
  v_principal iam.service_principals%rowtype;
  v_event_id uuid;
  v_incident integration.incidents%rowtype;
  v_severity text;
  v_human_authority boolean := false;
  v_authority_type text;
  v_actor_id text;
  v_source text;
  v_superseded_count integer := 0;
begin
  if p_status not in ('healthy', 'degraded', 'unavailable', 'expired', 'blocked', 'unknown') then
    raise exception 'invalid health status' using errcode = '22023';
  end if;
  if p_status <> 'healthy' and coalesce(p_error_code, '') !~ '^[A-Z][A-Z0-9_]{2,119}$' then
    raise exception 'stable error code required' using errcode = '22023';
  end if;
  if coalesce(p_summary, '') = '' or length(p_summary) > 240 then
    raise exception 'bounded summary required' using errcode = '22023';
  end if;
  if coalesce(p_observation_key, '') !~ '^[A-Za-z0-9:_-]{8,160}$' then
    raise exception 'invalid observation key' using errcode = '22023';
  end if;
  if p_observed_at > now() + interval '5 minutes' or p_observed_at < now() - interval '24 hours' then
    raise exception 'observation timestamp outside accepted window' using errcode = '22023';
  end if;

  select b.* into v_brand
  from core.brands b
  where b.slug = p_brand_slug and b.status <> 'archived';
  if not found then raise exception 'operating brand not found' using errcode = 'P0002'; end if;

  select exists (
    select 1 from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active' and m.status = 'active'
      and m.legal_entity_id = v_brand.legal_entity_id
      and (m.brand_id is null or m.brand_id = v_brand.id)
      and m.role in ('owner', 'admin', 'operator')
  ) into v_human_authority;

  if v_human_authority then
    v_authority_type := 'profile';
    v_actor_id := p_profile_id::text;
    v_source := 'autopilots-control-plane';
  else
    select p.* into v_principal from iam.service_principals p where p.id = p_profile_id;
    if not iam.service_principal_has_scope(
      p_profile_id, v_brand.legal_entity_id, v_brand.id, 'monitoring.health.write'
    ) then
      raise exception 'active monitoring authority required' using errcode = '42501';
    end if;
    v_authority_type := 'service_principal';
    v_actor_id := v_principal.key;
    v_source := v_principal.key;
  end if;

  select c.* into v_connection
  from integration.connections c
  join integration.connector_definitions d on d.id = c.connector_definition_id
  join core.environments e on e.id = c.environment_id and e.brand_id = c.brand_id
  where c.brand_id = v_brand.id and d.key = 'product_api' and e.kind = 'sandbox';
  if not found then raise exception 'product connector not found' using errcode = 'P0002'; end if;

  v_severity := case p_status when 'unavailable' then 'P1' when 'degraded' then 'P2' when 'healthy' then 'P3' else 'P2' end;

  insert into integration.health_events (
    connection_id, brand_id, status, error_code, severity, summary, details,
    observed_at, observation_key
  ) values (
    v_connection.id, v_brand.id, p_status,
    case when p_status = 'healthy' then null else p_error_code end,
    v_severity, p_summary,
    jsonb_build_object(
      'contract', 'autopilots.product-health.v1',
      'sourceQuality', 'live_readonly_probe',
      'authorityType', v_authority_type,
      'externalWrites', false
    ),
    p_observed_at, p_observation_key
  )
  on conflict (connection_id, observation_key) where observation_key is not null do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select h.id into v_event_id from integration.health_events h
    where h.connection_id = v_connection.id and h.observation_key = p_observation_key;
    return jsonb_build_object('eventId', v_event_id, 'replayed', true, 'incident', null);
  end if;

  if p_status = 'healthy' then
    update integration.incidents i
    set status = 'resolved', last_observed_at = p_observed_at, updated_at = now(),
        context = i.context || jsonb_build_object('resolvedByObservationId', v_event_id)
    where i.brand_id = v_brand.id and i.connection_id = v_connection.id
      and i.status in ('open', 'acknowledged', 'mitigating');
    get diagnostics v_superseded_count = row_count;
  else
    update integration.incidents i
    set status = 'resolved', last_observed_at = p_observed_at, updated_at = now(),
        context = i.context || jsonb_build_object(
          'resolvedByObservationId', v_event_id,
          'resolutionReason', 'superseded_by_current_health_code',
          'supersededByCode', p_error_code
        )
    where i.brand_id = v_brand.id and i.connection_id = v_connection.id
      and i.status in ('open', 'acknowledged', 'mitigating')
      and i.code <> p_error_code;
    get diagnostics v_superseded_count = row_count;

    insert into integration.incidents (
      brand_id, connection_id, code, severity, status, title, impact,
      retryable, occurrence_count, first_observed_at, last_observed_at,
      runbook_reference, context
    ) values (
      v_brand.id, v_connection.id, p_error_code, v_severity, 'open',
      v_brand.name || ' vraagt aandacht', p_summary, true, 1,
      p_observed_at, p_observed_at,
      'docs/runbooks/ERROR_RESPONSE.md',
      jsonb_build_object('lastObservationId', v_event_id, 'sourceQuality', 'live_readonly_probe')
    )
    on conflict (brand_id, connection_id, code) where status in ('open', 'acknowledged', 'mitigating')
    do update set
      severity = excluded.severity,
      occurrence_count = integration.incidents.occurrence_count + 1,
      last_observed_at = excluded.last_observed_at,
      impact = excluded.impact,
      runbook_reference = excluded.runbook_reference,
      context = integration.incidents.context || excluded.context,
      updated_at = now()
    returning * into v_incident;
  end if;

  insert into audit.events (
    legal_entity_id, brand_id, environment_id, actor_type, actor_id, action,
    entity_type, entity_id, risk_class, result, evidence, source
  ) values (
    v_brand.legal_entity_id, v_brand.id, v_connection.environment_id,
    case when v_human_authority then 'user' else 'system' end,
    v_actor_id, 'product.health_observed', 'health_event', v_event_id::text,
    'R0', 'succeeded', jsonb_build_array(jsonb_build_object(
      'observationKey', p_observation_key,
      'status', p_status,
      'incidentId', v_incident.id,
      'supersededIncidentCount', v_superseded_count,
      'authorityType', v_authority_type,
      'externalWrites', false
    )), v_source
  );

  return jsonb_build_object(
    'eventId', v_event_id,
    'replayed', false,
    'supersededIncidentCount', v_superseded_count,
    'incident', case when v_incident.id is null then null else jsonb_build_object(
      'id', v_incident.id,
      'status', v_incident.status,
      'severity', v_incident.severity,
      'code', v_incident.code,
      'contextVersion', v_incident.occurrence_count
    ) end
  );
end;
$$;

revoke all on function public.autopilots_record_product_health(uuid, text, text, text, text, timestamptz, text) from public, anon, authenticated;
grant execute on function public.autopilots_record_product_health(uuid, text, text, text, text, timestamptz, text) to service_role;

commit;
