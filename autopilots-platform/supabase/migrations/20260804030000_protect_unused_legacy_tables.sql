begin;

alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.customer_domains enable row level security;
alter table public.documents enable row level security;
alter table public.ghl_opportunity_events enable row level security;
alter table public.integration_accounts enable row level security;
alter table public.invoices_purchase enable row level security;
alter table public.review_items enable row level security;
alter table public.sales_ai_scores enable row level security;
alter table public.sales_call_transcripts enable row level security;
alter table public.sales_calls enable row level security;
alter table public.sales_login_sessions enable row level security;
alter table public.sales_team_members enable row level security;
alter table public.sync_runs enable row level security;

revoke all privileges on table public.companies from public, anon, authenticated;
revoke all privileges on table public.contacts from public, anon, authenticated;
revoke all privileges on table public.customer_domains from public, anon, authenticated;
revoke all privileges on table public.documents from public, anon, authenticated;
revoke all privileges on table public.ghl_opportunity_events from public, anon, authenticated;
revoke all privileges on table public.integration_accounts from public, anon, authenticated;
revoke all privileges on table public.invoices_purchase from public, anon, authenticated;
revoke all privileges on table public.review_items from public, anon, authenticated;
revoke all privileges on table public.sales_ai_scores from public, anon, authenticated;
revoke all privileges on table public.sales_call_transcripts from public, anon, authenticated;
revoke all privileges on table public.sales_calls from public, anon, authenticated;
revoke all privileges on table public.sales_login_sessions from public, anon, authenticated;
revoke all privileges on table public.sales_team_members from public, anon, authenticated;
revoke all privileges on table public.sync_runs from public, anon, authenticated;

commit;
