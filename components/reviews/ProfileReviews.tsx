"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string | null;
  reviewer_name: string | null;
  pro_response: string | null;
  pro_response_at: string | null;
};

const REVIEW_FIELDS = "id, rating, comment, created_at, updated_at, reviewer_name, pro_response, pro_response_at";
const SHOW_FIRST = 5;

export function Stars({ rating, size = "text-base" }: { rating: number; size?: string }) {
  const percent = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span
      className={`${size} relative inline-block leading-none tracking-tight`}
      role="img"
      aria-label={`${Number(rating.toFixed(1))} out of 5 stars`}
    >
      <span className="text-[#E8DCD0]" aria-hidden="true">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-[#B8746E]" style={{ width: `${percent}%` }} aria-hidden="true">
        ★★★★★
      </span>
    </span>
  );
}

export function reviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function ProfileReviews({
  proId,
  proName,
  onRatingChange,
}: {
  proId: string;
  proName: string;
  onRatingChange: () => void;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mine, setMine] = useState<Review | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      const { data } = await supabase
        .from("reviews")
        .select(REVIEW_FIELDS)
        .eq("professional_id", proId)
        .eq("is_visible", true)
        .order("created_at", { ascending: false });
      setReviews(data || []);
      if (user) {
        const { data: own } = await supabase
          .from("reviews")
          .select(REVIEW_FIELDS)
          .eq("professional_id", proId)
          .eq("client_id", user.id)
          .maybeSingle();
        setMine(own);
      } else {
        setMine(null);
      }
      setLoading(false);
    }
    load();
  }, [proId, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  function startWriting() {
    setRating(mine?.rating ?? 0);
    setComment(mine?.comment ?? "");
    setConfirmed(!!mine);
    setError("");
    setEditing(true);
  }

  async function submit() {
    if (!userId) return;
    const text = comment.trim();
    if (rating < 1) return setError("Choose a star rating.");
    if (text.length < 10) return setError("Write a little more, at least 10 characters, so other clients know what to expect.");
    if (!confirmed) return setError(`Please confirm you've had a treatment with ${proName}.`);
    setSaving(true);
    setError("");
    const result = mine
      ? await supabase.from("reviews").update({ rating, comment: text }).eq("id", mine.id)
      : await supabase.from("reviews").insert({ client_id: userId, professional_id: proId, rating, comment: text });
    setSaving(false);
    if (result.error) {
      if (result.error.code === "23505") setError("You've already reviewed this pro. You can edit your review instead.");
      else if (result.error.code === "42501") setError("You can't review your own profile.");
      else setError("We couldn't save your review. Please try again.");
      return;
    }
    setEditing(false);
    reload();
    onRatingChange();
  }

  async function remove() {
    if (!mine) return;
    setSaving(true);
    const { error: delError } = await supabase.from("reviews").delete().eq("id", mine.id);
    setSaving(false);
    setConfirmDelete(false);
    if (delError) return setError("We couldn't delete your review. Please try again.");
    reload();
    onRatingChange();
  }

  const isOwnProfile = userId === proId;
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const shown = showAll ? reviews : reviews.slice(0, SHOW_FIRST);

  return (
    <section aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-xs uppercase tracking-widest text-[#B8746E] font-semibold mb-3">Reviews</h2>

      {loading ? (
        <p className="text-sm text-[#6B5F58]">Loading reviews…</p>
      ) : (
        <div className="space-y-4">
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="font-serif text-3xl font-semibold text-[#2A2521] tabular-nums">{average.toFixed(1)}</span>
              <div>
                <Stars rating={average} size="text-lg" />
                <p className="text-xs text-[#6B5F58]">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p>
              </div>
            </div>
          )}

          {/* Write / edit your review */}
          {isOwnProfile ? (
            <p className="text-sm text-[#6B5F58] bg-[#F5EDE6] rounded-xl px-4 py-3">
              Clients&apos; reviews of you appear here. You can reply to them from your{" "}
              <Link href="/pro/dashboard" className="text-[#B8746E] font-semibold hover:underline">dashboard</Link>.
            </p>
          ) : !userId ? (
            <p className="text-sm text-[#3D2F2A] bg-[#F5EDE6] rounded-xl px-4 py-3">
              Had a treatment with {proName}?{" "}
              <Link href={`/login?next=/pros/${proId}`} className="text-[#B8746E] font-semibold hover:underline">Log in</Link> or{" "}
              <Link href="/signup" className="text-[#B8746E] font-semibold hover:underline">sign up</Link> to leave a review.
            </p>
          ) : editing ? (
            <div className="bg-white border border-[#DDB4B0] rounded-2xl p-5 space-y-4">
              <p className="font-semibold text-[#2A2521]">{mine ? "Edit your review" : `Review ${proName}`}</p>
              <fieldset>
                <legend className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">Your rating</legend>
                <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                      onClick={() => setRating(n)}
                      className={`text-3xl leading-none px-0.5 transition ${n <= rating ? "text-[#B8746E]" : "text-[#E8DCD0] hover:text-[#DDB4B0]"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="review-comment" className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">Your review</label>
                <textarea
                  id="review-comment"
                  rows={4}
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you have done? How did it turn out, and how long did it last?"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521] resize-none"
                />
                <p className="text-xs text-[#6B5F58] mt-1 tabular-nums">{comment.trim().length} / 1000</p>
              </div>
              {!mine && (
                <label htmlFor="review-confirm" className="flex items-start gap-3 text-sm text-[#3D2F2A] cursor-pointer">
                  <input id="review-confirm" type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#3D2F2A] shrink-0" />
                  <span>I&apos;ve had a treatment with {proName}, and this review is honest and my own.</span>
                </label>
              )}
              {error && <p className="text-sm text-[#B8746E]">{error}</p>}
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={submit} disabled={saving} className="bg-[#3D2F2A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#5A4640] transition disabled:opacity-50">
                  {saving ? "Saving…" : mine ? "Save changes" : "Post review"}
                </button>
                <button type="button" onClick={() => setEditing(false)} disabled={saving} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#6B5F58] hover:text-[#2A2521]">
                  Cancel
                </button>
              </div>
              <p className="text-xs text-[#6B5F58]">Your review shows your first name and last initial.</p>
            </div>
          ) : mine ? (
            <div className="bg-[#F5EDE6] rounded-xl px-4 py-3 text-sm text-[#3D2F2A] flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>
                You reviewed {proName}.{mine && reviews.every((r) => r.id !== mine.id) ? " Your review is hidden while we check it." : ""}
              </span>
              <button type="button" onClick={startWriting} className="font-semibold text-[#B8746E] hover:underline">Edit</button>
              {confirmDelete ? (
                <span className="flex items-center gap-3">
                  <span>Delete your review?</span>
                  <button type="button" onClick={remove} disabled={saving} className="font-semibold text-[#9C3B35] hover:underline">Yes, delete</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="font-semibold text-[#6B5F58] hover:underline">No</button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="font-semibold text-[#6B5F58] hover:underline">Delete</button>
              )}
              {error && <p className="w-full text-[#B8746E]">{error}</p>}
            </div>
          ) : (
            <button type="button" onClick={startWriting} className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-[#DDB4B0] text-sm font-semibold text-[#3D2F2A] hover:bg-[#F5EDE6] transition">
              ★ Write a review
            </button>
          )}

          {/* The reviews */}
          {reviews.length === 0 ? (
            !isOwnProfile && <p className="text-sm text-[#6B5F58]">No reviews yet. Be the first to share your experience.</p>
          ) : (
            <ul className="bg-white border border-[#E8DCD0] rounded-2xl divide-y divide-[#E8DCD0]">
              {shown.map((r) => (
                <li key={r.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="font-semibold text-[#2A2521]">
                      {r.reviewer_name || "Nana's Hub client"}
                      {mine?.id === r.id && <span className="ml-2 text-xs font-normal text-[#6B5F58]">(you)</span>}
                    </p>
                    <p className="text-xs text-[#6B5F58]">
                      {reviewDate(r.created_at)}
                      {r.updated_at ? " · edited" : ""}
                    </p>
                  </div>
                  <Stars rating={r.rating} />
                  <p className="text-sm text-[#3D2F2A] mt-1.5 whitespace-pre-line">{r.comment}</p>
                  {r.pro_response && (
                    <div className="mt-3 ml-3 pl-3 border-l-2 border-[#DDB4B0]">
                      <p className="text-xs font-semibold text-[#2A2521]">Reply from {proName}</p>
                      <p className="text-sm text-[#3D2F2A] mt-0.5 whitespace-pre-line">{r.pro_response}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {reviews.length > SHOW_FIRST && (
            <button type="button" onClick={() => setShowAll(!showAll)} className="text-sm font-semibold text-[#B8746E] hover:underline">
              {showAll ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
            </button>
          )}
          <p className="text-xs text-[#6B5F58]">
            Spotted a fake or unfair review? Email <a href="mailto:hello@nanashub.co.uk" className="underline hover:no-underline">hello@nanashub.co.uk</a>.
          </p>
        </div>
      )}
    </section>
  );
}
