-- Nana's Hub: services, categories and account deletion (15 October 2026)
-- Run in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run before or after the matching code update, and safe to run twice.
-- Everything is inside one transaction: if any line fails, nothing changes.

begin;

-- 1. services: new services are active by default, and the optional
--    details can be left blank.
alter table public.services alter column is_active set default true;
alter table public.services alter column description drop not null;
alter table public.services alter column duration_minutes drop not null;
alter table public.services alter column location_type drop not null;
alter table public.services alter column mobile_travel_fee_pence drop not null;

-- 2. Categories: only allow the categories the website uses
--    (the list in lib/categories.ts). Any older category rules are replaced.
--    NOT VALID means existing rows are left alone; only new saves are checked.
do $$
declare c record;
begin
  for c in
    select conname, conrelid::regclass as tbl
    from pg_constraint
    where contype = 'c'
      and (
        (conrelid = 'public.services'::regclass and pg_get_constraintdef(oid) ilike '%category%')
        or (conrelid = 'public.professional_profiles'::regclass and pg_get_constraintdef(oid) ilike '%service_categories%')
      )
  loop
    execute format('alter table %s drop constraint %I', c.tbl, c.conname);
  end loop;
end $$;

alter table public.services
  add constraint services_category_check
  check (category in ('braids', 'locs', 'natural-hair', 'wigs', 'barbering',
                      'lashes-brows', 'makeup', 'skin', 'nails')) not valid;

alter table public.professional_profiles
  add constraint pro_service_categories_check
  check (service_categories <@ array['braids', 'locs', 'natural-hair', 'wigs', 'barbering',
                                     'lashes-brows', 'makeup', 'skin', 'nails']::text[]) not valid;

-- 3. Account deletion: a signed-in person can delete their own account
--    and everything linked to it. (Photos are removed by the website first.)
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  delete from public.reviews
   where client_id = uid
      or professional_id = uid
      or booking_id in (select id from public.bookings where client_id = uid or professional_id = uid);
  delete from public.bookings where client_id = uid or professional_id = uid;
  delete from public.services where professional_id = uid;
  delete from public.professional_profiles where user_id = uid;
  delete from public.waitlist where lower(email) = (select lower(email) from auth.users where id = uid);
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

commit;

-- 4. Check: shows the result so it can be confirmed.
select 'FUNCTION' as kind, p.proname as name,
       case when p.prosecdef then 'security definer' else 'normal' end as detail
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'delete_my_account'
union all
select 'CHECK', conname, conrelid::regclass::text
from pg_constraint
where conname in ('services_category_check', 'pro_service_categories_check')
union all
select 'SERVICES COLUMN', column_name,
       case when is_nullable = 'YES' then 'optional' else 'required' end
       || coalesce(', default ' || column_default, '')
from information_schema.columns
where table_schema = 'public' and table_name = 'services'
  and column_name in ('is_active', 'description', 'duration_minutes', 'location_type', 'mobile_travel_fee_pence')
order by 1, 2;
