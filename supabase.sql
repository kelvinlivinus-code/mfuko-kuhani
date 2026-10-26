-- MKCOT (Mfuko wa Kuhani wa Operation and Training): hifadhidata ya tovuti
-- Bandika faili hili lote kwenye Supabase > SQL Editor > New query, kisha bofya "Run". Endesha mara moja tu.

-- 1. Kumbukumbu zote za mfuko (wanachama, malipo, matukio, mikopo, miradi, vikao, uongozi, taarifa, mipangilio)
create table if not exists public.docs (
  col        text not null,
  id         text not null,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (col, id)
);

-- 2. Watumiaji wa mfumo na nafasi zao
--    Nafasi na ruhusa zake zimeelezwa chini, kwenye "Ruhusa kwa kila nafasi".
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text default '',
  role       text not null default 'anasubiri' check (role in ('anasubiri','msomaji','mhariri','msimamizi')),
  created_at timestamptz not null default now()
);

-- Mtu wa kwanza kujisajili anakuwa msimamizi; wengine wanasubiri kuidhinishwa
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''),
          case when (select count(*) from public.profiles) = 0 then 'msimamizi' else 'anasubiri' end);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where user_id = auth.uid()
$$;

-- 3. Ruhusa (Row Level Security)
alter table public.docs enable row level security;
alter table public.profiles enable row level security;

drop policy if exists profiles_soma on public.profiles;
drop policy if exists profiles_msimamizi on public.profiles;
create policy profiles_soma      on public.profiles for select to authenticated using (user_id = auth.uid() or public.my_role() = 'msimamizi');
create policy profiles_msimamizi on public.profiles for update to authenticated using (public.my_role() = 'msimamizi') with check (public.my_role() = 'msimamizi');

-- Ruhusa kwa kila nafasi
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

-- 4. Mabadiliko yaonekane papo hapo kwa wote walio mtandaoni
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- 5. Hifadhi ya nembo (logo)
insert into storage.buckets (id, name, public) values ('nembo', 'nembo', true) on conflict (id) do nothing;
drop policy if exists nembo_soma on storage.objects;
drop policy if exists nembo_pakia on storage.objects;
drop policy if exists nembo_badilisha on storage.objects;
create policy nembo_soma      on storage.objects for select using (bucket_id = 'nembo');
create policy nembo_pakia     on storage.objects for insert to authenticated with check (bucket_id = 'nembo' and public.my_role() = 'msimamizi');
create policy nembo_badilisha on storage.objects for update to authenticated using (bucket_id = 'nembo' and public.my_role() = 'msimamizi');

-- 6. Mipangilio ya awali ya mfuko
insert into public.docs (col, id, data) values
  ('config', 'settings', '{"fundName":"MKCOT","branch":"Tawi la COT (Chief of Operations and Training), JWTZ","entryFee":35000,"monthlyFee":10000,"interestRate":0,"openingBalance":0,"openingDate":""}'::jsonb)
on conflict (col, id) do nothing;
