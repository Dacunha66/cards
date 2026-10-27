-- Move the admin check out of the public API (Supabase security advisor 0028/0029).
-- Policies still use it; it is just no longer callable as /rest/v1/rpc/is_admin.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

drop policy "cards: everyone reads active cards, admins read all" on public.cards;
drop policy "cards: admins insert" on public.cards;
drop policy "cards: admins update" on public.cards;
drop policy "cards: admins delete" on public.cards;
create policy "cards: everyone reads active cards, admins read all" on public.cards
  for select to anon, authenticated using (status = 'active' or (select private.is_admin()));
create policy "cards: admins insert" on public.cards
  for insert to authenticated with check ((select private.is_admin()));
create policy "cards: admins update" on public.cards
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "cards: admins delete" on public.cards
  for delete to authenticated using ((select private.is_admin()));

drop policy "settings: admins insert" on public.game_settings;
drop policy "settings: admins update" on public.game_settings;
create policy "settings: admins insert" on public.game_settings
  for insert to authenticated with check ((select private.is_admin()));
create policy "settings: admins update" on public.game_settings
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy "card images: admins upload" on storage.objects;
drop policy "card images: admins change" on storage.objects;
drop policy "card images: admins delete" on storage.objects;
create policy "card images: admins upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'card-images' and (select private.is_admin()));
create policy "card images: admins change" on storage.objects
  for update to authenticated using (bucket_id = 'card-images' and (select private.is_admin()));
create policy "card images: admins delete" on storage.objects
  for delete to authenticated using (bucket_id = 'card-images' and (select private.is_admin()));

drop function public.is_admin();
