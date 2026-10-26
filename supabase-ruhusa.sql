-- Mfuko wa Kuhani COT: ruhusa kwa kila nafasi
-- Bandika faili hili lote kwenye Supabase > SQL Editor > New query, kisha bofya "Run".
-- Ni salama kuliendesha zaidi ya mara moja. Haligusi taarifa za mfuko.
--
-- Nafasi:
--   anasubiri   = amejisajili, hajaidhinishwa (haoni chochote)
--   mwanachama  = anaona taarifa zake binafsi tu (michango, mikopo na matukio yake) pamoja na matangazo
--   malipo      = Mweka malipo: anarekodi michango na malipo tu
--   katibu      = wanachama, matukio ya kuhaniwa, vikao, uongozi, matangazo na utangulizi
--   mhazini     = malipo, mikopo, miradi na hesabu
--   msomaji     = Mkaguzi: anaona kila kitu, habadilishi chochote
--   msimamizi   = kila kitu, pamoja na watumiaji na mipangilio

-- 1. Kila mtumiaji anaweza kuunganishwa na kumbukumbu yake ya uanachama
alter table public.profiles add column if not exists member_id text;

-- 2. Nafasi mpya (Mhariri wa zamani anakuwa Katibu)
alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'katibu' where role = 'mhariri';
alter table public.profiles add constraint profiles_role_check
  check (role in ('anasubiri','mwanachama','malipo','katibu','mhazini','msomaji','msimamizi'));

create or replace function public.my_member_id() returns text
language sql stable security definer set search_path = public as $$
  select member_id from public.profiles where user_id = auth.uid()
$$;

-- 3. Nani anaona nini
create or replace function public.can_read(c text, i text, d jsonb) returns boolean
language sql stable security definer set search_path = public as $$
  select case public.my_role()
    when 'msimamizi' then true
    when 'msomaji'   then true
    when 'mhazini'   then c in ('members','payments','loans','projects','ledger','events','cabinet','notices','config')
    when 'malipo'    then c in ('members','payments','cabinet','notices','config')
    when 'katibu'    then c in ('members','events','meetings','cabinet','notices','config')
    when 'mwanachama' then c in ('cabinet','notices','config')
      or (public.my_member_id() is not null and (
            (c = 'members' and i = public.my_member_id())
         or (c in ('payments','loans','events') and d->>'memberId' = public.my_member_id())))
    else false end
$$;

-- 4. Nani anabadilisha nini
create or replace function public.can_write(c text, i text) returns boolean
language sql stable security definer set search_path = public as $$
  select case public.my_role()
    when 'msimamizi' then true
    when 'mhazini'   then c in ('payments','loans','projects','ledger')
    when 'malipo'    then c = 'payments'
    when 'katibu'    then c in ('members','events','meetings','cabinet','notices') or (c = 'config' and i = 'about')
    else false end
$$;

drop policy if exists docs_soma on public.docs;
drop policy if exists docs_ongeza on public.docs;
drop policy if exists docs_badilisha on public.docs;
drop policy if exists docs_futa on public.docs;
create policy docs_soma      on public.docs for select to authenticated using (public.can_read(col, id, data));
create policy docs_ongeza    on public.docs for insert to authenticated with check (public.can_write(col, id));
create policy docs_badilisha on public.docs for update to authenticated using (public.can_write(col, id)) with check (public.can_write(col, id));
create policy docs_futa      on public.docs for delete to authenticated using (public.can_write(col, id));

-- 5. Nembo: msimamizi pekee anaweza kuibadilisha
drop policy if exists nembo_pakia on storage.objects;
drop policy if exists nembo_badilisha on storage.objects;
create policy nembo_pakia     on storage.objects for insert to authenticated with check (bucket_id = 'nembo' and public.my_role() = 'msimamizi');
create policy nembo_badilisha on storage.objects for update to authenticated using (bucket_id = 'nembo' and public.my_role() = 'msimamizi');
