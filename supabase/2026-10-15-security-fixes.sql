-- Nana's Hub security fixes (15 October 2026)
-- Run in Supabase: SQL Editor -> New query -> paste -> Run.
-- Run this AFTER the matching code update is live on Vercel.
-- Everything is inside one transaction: if any line fails, nothing changes.

begin;

-- 1. Make sure Row Level Security is on for every table.
alter table public.profiles              enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.bookings              enable row level security;
alter table public.reviews               enable row level security;
alter table public.services              enable row level security;
alter table public.waitlist              enable row level security;

-- 2. profiles: the public can only see pros' rows (plus your own row,
--    and a pro can see clients who have booked them).
drop policy if exists profiles_select_all on public.profiles;
drop policy if exists profiles_select_visible on public.profiles;
create policy profiles_select_visible on public.profiles
  for select using (
    auth.uid() = id
    or user_type = 'pro'
    or exists (
      select 1 from public.bookings b
      where b.client_id = profiles.id and b.professional_id = auth.uid()
    )
  );

-- 3. profiles: hide email, phone and postcode from the website entirely.
--    (Your own email still shows on the account page; it comes from your login.)
revoke select on public.profiles from anon, authenticated;
grant select (id, first_name, last_name, location_city, user_type,
              profile_photo, onboarding_complete, created_at)
  on public.profiles to anon, authenticated;

-- 4. professional_profiles: pros can't give themselves ratings, reviews,
--    a verified badge or a paid plan.
--    New profiles: only these columns can be filled in; the rest use their defaults.
revoke insert on public.professional_profiles from anon, authenticated;
grant insert (user_id, business_name, bio, years_experience, location_type,
              salon_address, service_radius_miles, service_postcodes,
              service_categories, specialties, instagram_handle, tiktok_handle,
              external_booking_url, slot_release_info, featured_video_url,
              portfolio_images, accepting_bookings)
  on public.professional_profiles to authenticated;

--    Edits: protected columns are quietly kept at their old values.
create or replace function public.protect_pro_profile_fields()
returns trigger language plpgsql as $$
begin
  if current_user in ('anon', 'authenticated') then
    new.user_id                  := old.user_id;
    new.is_verified              := old.is_verified;
    new.average_rating           := old.average_rating;
    new.total_reviews            := old.total_reviews;
    new.total_completed_bookings := old.total_completed_bookings;
    new.subscription_tier        := old.subscription_tier;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_pro_profile_fields on public.professional_profiles;
create trigger protect_pro_profile_fields
  before update on public.professional_profiles
  for each row execute function public.protect_pro_profile_fields();

commit;

-- 5. Check: shows the result so it can be confirmed.
select 'TABLE' as kind, c.relname as name,
       case when c.relrowsecurity then 'RLS ON' else 'RLS OFF' end as detail
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
union all
select 'BUCKET', id, 'name: ' || name || case when public then ', public' else ', private' end
from storage.buckets
union all
select 'PROFILES POLICY', policyname, cmd
from pg_policies where schemaname = 'public' and tablename = 'profiles'
union all
select 'TRIGGER', tgname, 'on professional_profiles'
from pg_trigger where tgname = 'protect_pro_profile_fields'
order by 1, 2;
