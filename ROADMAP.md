# Nana's Hub Roadmap

The step-by-step build plan for Nana's Hub. It lives here, with the code, so it can't get lost.

**How to use this file**

- Work through the phases in order. Tick a box by changing `[ ]` to `[x]` when a step is done.
- Add new ideas to **Ideas and notes** at the bottom rather than keeping them in a chat.
- After changing this file, commit and push it like any other change (`git add .`, `git commit -m "Update roadmap"`, `git push`).
- When working with Claude, say "read ROADMAP.md first" (Claude Code does this automatically via `CLAUDE.md`).

Last updated: 15 October 2026

---

## Key decisions

- **Clients book on the pro's own booking site** (Acuity, Fresha, Booksy, Square, Calendly). Nana's Hub is where clients *find* pros; the booking itself happens on the pro's site.
- **Pros without a booking link** show "Message on Instagram" (if they've added their handle) or "Booking link coming soon". There is no "Request booking" button.
- **Tech:** Next.js on Vercel, Supabase for accounts, database and photo storage, Resend for emails. Code on GitHub at `nanashub/nanas-hub`. Live at nanashub.co.uk.

---

## Phase 1: Foundations (done)

- [x] Homepage with waitlist (saves to the `waitlist` table)
- [x] Custom logo, favicon and header
- [x] Sign up and log in, as a client or a pro
- [x] Account page
- [x] Pro profile editor (bio, location, salon or mobile, Instagram, booking link, slot release info)
- [x] Pro Highlights with photo uploads
- [x] Public pro profile pages
- [x] Browse pros page with location and salon/mobile filters
- [x] Booking request form and pro dashboard (accept, decline, complete). No longer linked from profiles; see Phase 2.
- [x] Booking email templates with Resend (`sendBookingEmail` in `app/actions.ts`)
- [x] Homepage sections: services, how it works, meet the pros, plans for pros, founder quote
- [x] Book now button goes to the pro's own booking site
- [x] Fixed mixed-up account and pros pages

## Phase 2: Tidy up before inviting pros

- [ ] Check `RESEND_API_KEY` is set in Vercel (Settings → Environment Variables)
- [x] Row Level Security on for every table; emails, phones and postcodes hidden; pros can't edit their own ratings, verified badge or plan (`supabase/2026-10-15-security-fixes.sql`)
- [x] Fixed photo uploads (created the lowercase `portfolio` bucket, deleted the old `Portfolio` one)
- [ ] Decide what to do with the old booking request flow (`/book/[id]` page, bookings table, dashboard requests): remove it, or keep it for later
- [ ] Repurpose the pro dashboard around the new model (profile views, Book now clicks, reviews)
- [x] Category filter on Browse pros; homepage category buttons go to matching pros (categories live in `lib/categories.ts`)
- [x] Services and prices in the pro profile editor and on profile pages
- [x] Categories split into 12 groups (e.g. Single plait styles, Cornrows, Lashes, Brows) with a style dropdown, plus Other with the pro's own description (`supabase/2026-10-15-category-styles.sql`)
- [x] "Delete my account" on the account page (`supabase/2026-10-15-services-and-account-deletion.sql`)
- [ ] Write a privacy policy and terms (needed under UK GDPR before launch)
- [ ] Ask pros for a booking link or Instagram handle when they set up their profile
- [ ] Test everything on a phone: sign up, edit profile, browse, Book now

## Phase 3: Reviews and trust

- [x] `reviews` table exists in Supabase (it currently requires a completed booking, which needs rethinking now that bookings happen on pros' own sites)
- [ ] Lock down reviews so clients can't change who a review is for, and pros can't hide reviews
- [ ] Let logged-in clients leave a review on a pro's profile
- [ ] Show reviews on the profile and update the average rating and review count
- [ ] Decide how to stop fake reviews (for example, one review per client per pro, and pros can report a review)
- [ ] Show ratings on the Browse pros and homepage cards (already wired to `average_rating` and `total_reviews`)

## Phase 4: Get the first 50 pros (business plan Goal 2)

- [ ] Send the beauty professional survey and follow up with interested pros
- [ ] Decide the founding pro perk (for example, Pro free for the first few months)
- [ ] Personally help the first 5–10 pros set up great profiles
- [ ] Collect feedback on usability, features and design, and adjust
- [ ] Reach 50 pros with complete profiles

## Phase 5: Launch to clients

- [ ] Email the waitlist when there are enough pros in an area
- [ ] Set up and post on Instagram and TikTok, featuring the first pros (business plan Goal 3)
- [ ] Reach out to 2–3 micro-influencers
- [ ] Collect early testimonials
- [ ] Track signups, profile views and Book now clicks

## Phase 6: Earning money

- [ ] Build Pro plan (£10/month) with Stripe subscriptions
- [ ] Decide what Pro includes: analytics, boosted visibility, promotions, client tools
- [ ] Review revenue streams from the business plan: commission per booking is hard when bookings happen on the pro's own site, so focus on subscriptions, featured listings and in-app advertising

## Later

- [ ] Product marketplace (beauty supplies)
- [ ] Online courses and education
- [ ] Events
- [ ] Expand beyond the UK

---

## Ideas and notes

Add anything you remember from your original plan here, then move it into a phase.

-
