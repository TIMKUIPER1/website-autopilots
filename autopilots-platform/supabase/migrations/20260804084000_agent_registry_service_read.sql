begin;

grant select on workflow.agent_registry to service_role;
revoke insert, update, delete, truncate, references, trigger
  on workflow.agent_registry from service_role;

commit;
