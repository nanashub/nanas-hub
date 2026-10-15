-- Nana's Hub: new categories, styles and "Other" (15 October 2026)
-- Run in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run twice. Everything is inside one transaction: if any line fails, nothing changes.

begin;

-- 1. New fields: a style for each service, and pros' own words for "Other".
alter table public.services add column if not exists style text;
alter table public.professional_profiles add column if not exists other_category text;
grant insert (other_category) on public.professional_profiles to authenticated;

-- 2. Remove the old category rules so existing data can be moved over.
alter table public.services drop constraint if exists services_category_check;
alter table public.professional_profiles drop constraint if exists pro_service_categories_check;
alter table public.professional_profiles drop constraint if exists pro_other_category_length;

-- 3. Move anything saved under the old category names.
update public.services
   set category = case category
                    when 'braids' then 'single-plaits'
                    when 'wigs' then 'wigs-weaves'
                    when 'lashes-brows' then 'lashes'
                    else category
                  end
 where category in ('braids', 'wigs', 'lashes-brows');

update public.professional_profiles pp
   set service_categories = (
     select coalesce(array_agg(distinct m order by m), '{}')
       from unnest(pp.service_categories) as c,
            unnest(case c
                     when 'braids' then array['single-plaits']
                     when 'wigs' then array['wigs-weaves']
                     when 'lashes-brows' then array['lashes', 'brows']
                     else array[c]
                   end) as m
      where m in ('single-plaits', 'cornrows', 'locs', 'natural-hair', 'wigs-weaves', 'barbering',
                  'lashes', 'brows', 'makeup', 'skin', 'nails', 'other')
   )
 where pp.service_categories && array['braids', 'wigs', 'lashes-brows'];

-- 4. New category rules (the list in lib/categories.ts).
alter table public.services
  add constraint services_category_check
  check (category in ('single-plaits', 'cornrows', 'locs', 'natural-hair', 'wigs-weaves', 'barbering',
                      'lashes', 'brows', 'makeup', 'skin', 'nails', 'other')) not valid;

alter table public.professional_profiles
  add constraint pro_service_categories_check
  check (service_categories <@ array['single-plaits', 'cornrows', 'locs', 'natural-hair', 'wigs-weaves', 'barbering',
                                     'lashes', 'brows', 'makeup', 'skin', 'nails', 'other']::text[]) not valid;

alter table public.professional_profiles
  add constraint pro_other_category_length
  check (other_category is null or char_length(other_category) <= 60) not valid;

commit;

-- 5. Check: shows the result so it can be confirmed.
select 'COLUMN' as kind, table_name || '.' || column_name as name, data_type as detail
from information_schema.columns
where table_schema = 'public'
  and ((table_name = 'services' and column_name = 'style')
    or (table_name = 'professional_profiles' and column_name = 'other_category'))
union all
select 'CHECK', conname, conrelid::regclass::text
from pg_constraint
where conname in ('services_category_check', 'pro_service_categories_check', 'pro_other_category_length')
union all
select 'OLD NAMES LEFT', 'services', count(*)::text
from public.services where category in ('braids', 'wigs', 'lashes-brows')
union all
select 'OLD NAMES LEFT', 'professional_profiles', count(*)::text
from public.professional_profiles where service_categories && array['braids', 'wigs', 'lashes-brows']
order by 1, 2;
