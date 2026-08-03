begin;

alter table public.audit_log enable row level security;
alter table public.integration_health enable row level security;
alter table public.invoices_sales enable row level security;
alter table public.raw_imports enable row level security;

revoke all privileges on table public.audit_log from public, anon, authenticated;
revoke all privileges on table public.integration_health from public, anon, authenticated;
revoke all privileges on table public.invoices_sales from public, anon, authenticated;
revoke all privileges on table public.raw_imports from public, anon, authenticated;

commit;
