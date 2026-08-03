begin;

revoke execute on function public.autopilots_claim_monitoring_run(uuid, text, bigint, uuid, integer, integer) from service_role;
revoke execute on function public.autopilots_heartbeat_monitoring_run(uuid, uuid, integer) from service_role;
revoke execute on function public.autopilots_complete_monitoring_run(uuid, uuid, text, jsonb, text) from service_role;
revoke execute on function public.autopilots_monitoring_freshness(uuid, integer) from service_role;

commit;
