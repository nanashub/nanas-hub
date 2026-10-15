-- Nana's Hub: reviews (15 October 2026)
-- Run in Supabase: SQL Editor -> New query -> paste -> Run.
-- Run this BEFORE uploading the matching code. Safe to run twice.
-- Everything is inside one transaction: if any line fails, nothing changes.
--
-- Rules:
--  * Any logged-in person can review a pro, except the pro themselves.
--  * One review per person per pro (they can edit or delete it).
--  * 1 to 5 stars plus a comment of 10 to 1000 characters.
--  * The pro can write one public reply. Nobody can change anything else.
--  * The pro's average rating and review count update automatically.
--  * Reviews show the reviewer's first name and last initial only.
--  * Hide a review by setting is_visible to false in the Table Editor.

begin;

-- 1. Columns.
alter table public.reviews alter column booking_id drop not null;
alter table public.reviews alter column is_visible set default true;
alter table public.reviews add column if not exists reviewer_name text;
alter table public.reviews add column if not exists updated_at timestamptz;

-- 2. Rules for the data itself.
alter table public.reviews drop constraint if exists reviews_rating_range;
alter table public.reviews add constraint reviews_rating_range
  check (rating between 1 and 5) not valid;
alter table public.reviews drop constraint if exists reviews_comment_length;
alter table public.reviews add constraint reviews_comment_length
  check (char_length(btrim(comment)) between 10 and 1000) not valid;
alter table public.reviews drop constraint if exists reviews_not_self;
alter table public.reviews add constraint reviews_not_self
  check (client_id <> professional_id) not valid;
create unique index if not exists reviews_one_per_client_per_pro
  on public.reviews (client_id, professional_id);

-- 3. Who can do what.
drop policy if exists reviews_insert_for_own_completed_booking on public.reviews;
drop policy if exists reviews_insert_own on public.reviews;
create policy reviews_insert_own on public.reviews
  for insert to authenticated
  with check (
    auth.uid() = client_id
    and professional_id <> auth.uid()
    and exists (select 1 from public.professional_profiles pp where pp.user_id = professional_id)
  );

drop policy if exists reviews_select_own on public.reviews;
create policy reviews_select_own on public.reviews
  for select to authenticated
  using (auth.uid() = client_id or auth.uid() = professional_id);

drop policy if exists reviews_delete_own on public.reviews;
create policy reviews_delete_own on public.reviews
  for delete to authenticated
  using (auth.uid() = client_id);

-- (Existing policies kept: anyone can read visible reviews, the reviewer can
--  update their review, and the pro can update to reply. The trigger below
--  limits exactly which fields each of them can change.)

-- 4. Lock down fields.
create or replace function public.protect_review_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  first_name text;
  last_name text;
begin
  -- Only limit requests from the website; changes in the dashboard are allowed.
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    select p.first_name, p.last_name into first_name, last_name
      from public.profiles p where p.id = new.client_id;
    new.reviewer_name   := coalesce(nullif(btrim(first_name), ''), 'Nana''s Hub client')
                           || case when nullif(btrim(last_name), '') is not null
                                   then ' ' || upper(left(btrim(last_name), 1)) || '.' else '' end;
    new.is_visible      := true;
    new.pro_response    := null;
    new.pro_response_at := null;
    new.booking_id      := null;
    new.created_at      := now();
    new.updated_at      := null;
    new.comment         := btrim(new.comment);
    return new;
  end if;

  -- UPDATE: nobody can move a review or change who wrote it, when, or whether it's shown.
  new.id              := old.id;
  new.client_id       := old.client_id;
  new.professional_id := old.professional_id;
  new.booking_id      := old.booking_id;
  new.reviewer_name   := old.reviewer_name;
  new.created_at      := old.created_at;
  new.is_visible      := old.is_visible;

  if me = old.client_id then
    -- The reviewer can change their stars and comment.
    new.comment         := btrim(new.comment);
    new.pro_response    := old.pro_response;
    new.pro_response_at := old.pro_response_at;
    if new.rating is distinct from old.rating or new.comment is distinct from old.comment then
      new.updated_at := now();
    else
      new.updated_at := old.updated_at;
    end if;
  elsif me = old.professional_id then
    -- The pro can only write or change their reply.
    new.rating     := old.rating;
    new.comment    := old.comment;
    new.updated_at := old.updated_at;
    new.pro_response := nullif(btrim(coalesce(new.pro_response, '')), '');
    if new.pro_response is distinct from old.pro_response then
      new.pro_response_at := case when new.pro_response is null then null else now() end;
    else
      new.pro_response_at := old.pro_response_at;
    end if;
  else
    raise exception 'Not allowed';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_review_fields on public.reviews;
create trigger protect_review_fields
  before insert or update on public.reviews
  for each row execute function public.protect_review_fields();

-- 5. Keep each pro's average rating and review count up to date.
create or replace function public.refresh_pro_rating(pro uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.professional_profiles pp
     set average_rating = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r
                                    where r.professional_id = pro and r.is_visible), 0),
         total_reviews  = (select count(*) from public.reviews r
                           where r.professional_id = pro and r.is_visible)
   where pp.user_id = pro;
$$;

create or replace function public.reviews_changed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public.refresh_pro_rating(old.professional_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') and (tg_op = 'INSERT' or new.professional_id is distinct from old.professional_id) then
    perform public.refresh_pro_rating(new.professional_id);
  end if;
  return null;
end;
$$;

drop trigger if exists reviews_changed on public.reviews;
create trigger reviews_changed
  after insert or update or delete on public.reviews
  for each row execute function public.reviews_changed();

revoke all on function public.refresh_pro_rating(uuid) from public, anon, authenticated;
revoke all on function public.reviews_changed() from public, anon, authenticated;

-- 6. Bring every pro's rating up to date now.
select public.refresh_pro_rating(user_id) from public.professional_profiles;

commit;

-- 7. Check: shows the result so it can be confirmed.
select 'POLICY' as kind, policyname as name, cmd as detail
from pg_policies where schemaname = 'public' and tablename = 'reviews'
union all
select 'TRIGGER', tgname, 'on reviews'
from pg_trigger where tgname in ('protect_review_fields', 'reviews_changed')
union all
select 'COLUMN', column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'reviews' and column_name in ('reviewer_name', 'updated_at')
union all
select 'REVIEWS', 'total', count(*)::text from public.reviews
order by 1, 2;
