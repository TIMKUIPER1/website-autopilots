begin;

insert into iam.profiles (
  id, auth_user_id, email, display_name, status, mfa_required
)
values (
  '40000000-0000-4000-8000-000000000001',
  'b8a65d30-63eb-4050-93cb-6d6f6907c742',
  'admin@auto-pilots.io',
  'Autopilots Owner',
  'active',
  true
)
on conflict (auth_user_id) do update
set
  email = excluded.email,
  display_name = excluded.display_name,
  status = excluded.status,
  mfa_required = excluded.mfa_required,
  updated_at = now();

insert into iam.memberships (
  id, profile_id, legal_entity_id, brand_id, role, status, granted_by
)
values (
  '50000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  null,
  'owner',
  'active',
  '40000000-0000-4000-8000-000000000001'
)
on conflict (id) do update
set
  role = excluded.role,
  status = excluded.status,
  granted_by = excluded.granted_by,
  updated_at = now();

insert into workflow.commands (
  id, brand_id, environment_id, actor_profile_id, command_type, risk_class,
  idempotency_key, status, context_version, payload, result, correlation_id,
  requested_at, completed_at
)
select
  '60000000-0000-4000-8000-000000000001',
  b.id,
  e.id,
  '40000000-0000-4000-8000-000000000001',
  'iam.owner.bootstrap',
  'R3',
  'bootstrap-owner-admin-auto-pilots-io-v1',
  'approved',
  e.context_version,
  jsonb_build_object(
    'auth_user_id', 'b8a65d30-63eb-4050-93cb-6d6f6907c742',
    'email', 'admin@auto-pilots.io',
    'legal_entity_id', '10000000-0000-4000-8000-000000000001',
    'scope', 'legal_entity_owner',
    'mfa_required', true
  ),
  jsonb_build_object('bootstrap', 'approved_by_human'),
  '60000000-0000-4000-8000-000000000002',
  now(),
  now()
from core.brands b
join core.environments e on e.brand_id = b.id and e.kind = 'production'
where b.id = '20000000-0000-4000-8000-000000000001'
on conflict (brand_id, environment_id, idempotency_key) do nothing;

insert into workflow.approvals (
  id, command_id, brand_id, risk_class, status, context_version, rationale,
  evidence, requested_by, decided_by, requested_at, decided_at
)
select
  '70000000-0000-4000-8000-000000000001',
  c.id,
  c.brand_id,
  'R3',
  'approved',
  c.context_version,
  'Initial owner bootstrap explicitly approved under Werktoestemming A.',
  '["user_consent:werktoestemming_a","auth_invite:admin@auto-pilots.io","bootstrap_exception:initial_owner"]'::jsonb,
  '40000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  now(),
  now()
from workflow.commands c
where c.id = '60000000-0000-4000-8000-000000000001'
on conflict (command_id) do nothing;

insert into audit.events (
  id, legal_entity_id, brand_id, environment_id, actor_type, actor_id, action,
  entity_type, entity_id, risk_class, result, reason, after_value, evidence,
  correlation_id, source
)
select
  '80000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  c.brand_id,
  c.environment_id,
  'user',
  '40000000-0000-4000-8000-000000000001',
  'iam.owner.bootstrap',
  'profile',
  '40000000-0000-4000-8000-000000000001',
  'R3',
  'succeeded',
  'Initial owner granted under explicit human work authorization.',
  jsonb_build_object(
    'email', 'admin@auto-pilots.io',
    'role', 'owner',
    'scope', 'legal_entity',
    'mfa_required', true
  ),
  '["approval:70000000-0000-4000-8000-000000000001","user_consent:werktoestemming_a"]'::jsonb,
  c.correlation_id,
  'owner_bootstrap'
from workflow.commands c
where c.id = '60000000-0000-4000-8000-000000000001'
on conflict (id) do nothing;

commit;
