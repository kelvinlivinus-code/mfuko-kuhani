-- Mfuko wa Kuhani COT: hifadhidata ya tovuti
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
--    anasubiri  = amejisajili, hajaidhinishwa (haoni chochote)
--    msomaji    = anaona taarifa tu
--    mhariri    = anasajili, anarekodi malipo na kubadilisha taarifa
--    msimamizi  = kama mhariri, pia anaidhinisha watumiaji na kubadilisha nafasi zao
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

drop policy if exists docs_soma on public.docs;
drop policy if exists docs_ongeza on public.docs;
drop policy if exists docs_badilisha on public.docs;
drop policy if exists docs_futa on public.docs;
create policy docs_soma      on public.docs for select to authenticated using (public.my_role() in ('msomaji','mhariri','msimamizi'));
create policy docs_ongeza    on public.docs for insert to authenticated with check (public.my_role() in ('mhariri','msimamizi'));
create policy docs_badilisha on public.docs for update to authenticated using (public.my_role() in ('mhariri','msimamizi')) with check (public.my_role() in ('mhariri','msimamizi'));
create policy docs_futa      on public.docs for delete to authenticated using (public.my_role() in ('mhariri','msimamizi'));

drop policy if exists profiles_soma on public.profiles;
drop policy if exists profiles_msimamizi on public.profiles;
create policy profiles_soma      on public.profiles for select to authenticated using (user_id = auth.uid() or public.my_role() = 'msimamizi');
create policy profiles_msimamizi on public.profiles for update to authenticated using (public.my_role() = 'msimamizi') with check (public.my_role() = 'msimamizi');

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
create policy nembo_pakia     on storage.objects for insert to authenticated with check (bucket_id = 'nembo' and public.my_role() in ('mhariri','msimamizi'));
create policy nembo_badilisha on storage.objects for update to authenticated using (bucket_id = 'nembo' and public.my_role() in ('mhariri','msimamizi'));

-- 6. Mipangilio ya awali ya mfuko
insert into public.docs (col, id, data) values
  ('config', 'settings', '{"fundName":"Mfuko wa Kuhani - COT","branch":"Tawi la COT (Chief of Operations and Training), JWTZ","entryFee":35000,"monthlyFee":10000,"interestRate":0,"openingBalance":0,"openingDate":""}'::jsonb)
on conflict (col, id) do nothing;
