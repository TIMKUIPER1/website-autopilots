begin;

create or replace function integration.enforce_health_observation_order()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, integration
as $$
declare
  v_latest_observed_at timestamptz;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.connection_id::text, 0));

  if new.observation_key is not null and exists (
    select 1 from integration.health_events h
    where h.connection_id = new.connection_id
      and h.observation_key = new.observation_key
  ) then
    return new;
  end if;

  select max(h.observed_at) into v_latest_observed_at
  from integration.health_events h
  where h.connection_id = new.connection_id;

  if v_latest_observed_at is not null and new.observed_at <= v_latest_observed_at then
    raise exception 'stale health observation'
      using errcode = 'P0001',
            detail = 'Health observations must advance monotonically per connection.';
  end if;

  return new;
end;
$$;

revoke all on function integration.enforce_health_observation_order() from public, anon, authenticated;
grant execute on function integration.enforce_health_observation_order() to service_role;

drop trigger if exists health_events_order_guard on integration.health_events;
create trigger health_events_order_guard
before insert on integration.health_events
for each row execute function integration.enforce_health_observation_order();

commit;
