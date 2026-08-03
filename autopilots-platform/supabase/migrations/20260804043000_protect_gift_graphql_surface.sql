begin;

revoke all privileges on table public.gift_conversations from public, anon, authenticated;
revoke all privileges on table public.gift_dealerships from public, anon, authenticated;
revoke all privileges on table public.gift_knowledge_items from public, anon, authenticated;
revoke all privileges on table public.gift_messages from public, anon, authenticated;
revoke all privileges on table public.gift_service_requests from public, anon, authenticated;
revoke all privileges on table public.gift_vehicle_notes from public, anon, authenticated;

commit;
