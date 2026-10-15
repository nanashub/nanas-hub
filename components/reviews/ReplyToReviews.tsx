"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Stars, reviewDate, type Review } from "./ProfileReviews";

type ProReview = Review & { is_visible: boolean };

export default function ReplyToReviews({ proId }: { proId: string }) {
  const [reviews, setReviews] = useState<ProReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, updated_at, reviewer_name, pro_response, pro_response_at, is_visible")
        .eq("professional_id", proId)
        .order("created_at", { ascending: false });
      setReviews(data || []);
      setLoading(false);
    }
    load();
  }, [proId]);

  function open(r: ProReview) {
    setOpenId(r.id);
    setDraft(r.pro_response || "");
    setError("");
  }

  async function save(id: string, text: string | null) {
    setSaving(true);
    setError("");
    const { data, error: saveError } = await supabase
      .from("reviews")
      .update({ pro_response: text })
      .eq("id", id)
      .select("pro_response, pro_response_at")
      .single();
    setSaving(false);
    if (saveError || !data) return setError("We couldn't save your reply. Please try again.");
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    setOpenId(null);
  }

  const visible = reviews.filter((r) => r.is_visible);
  const unanswered = visible.filter((r) => !r.pro_response).length;

  return (
    <section className="bg-white border border-[#E8DCD0] rounded-2xl p-6">
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <h2 className="font-serif text-2xl font-semibold text-[#2A2521]">Your reviews</h2>
        {visible.length > 0 && (
          <span className="text-sm text-[#3D2F2A] tabular-nums">{visible.length} {visible.length === 1 ? "review" : "reviews"}</span>
        )}
      </div>
      <p className="text-sm text-[#6B5F58] mb-4">
        {unanswered > 0
          ? `${unanswered} waiting for a reply. A short, friendly reply shows new clients you care.`
          : "Replies show publicly under each review on your profile."}
      </p>

      {loading ? (
        <p className="text-sm text-[#6B5F58]">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-[#3D2F2A] bg-[#F5EDE6] rounded-xl px-4 py-3">
          No reviews yet. Share your profile link with happy clients and ask them to leave one.
        </p>
      ) : (
        <ul className="divide-y divide-[#E8DCD0]">
          {reviews.map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="font-semibold text-[#2A2521]">{r.reviewer_name || "Nana's Hub client"}</p>
                <p className="text-xs text-[#6B5F58]">{reviewDate(r.created_at)}</p>
              </div>
              <Stars rating={r.rating} />
              {!r.is_visible && (
                <p className="text-xs text-[#9C3B35] mt-1">Hidden from your profile while we check it.</p>
              )}
              <p className="text-sm text-[#3D2F2A] mt-1.5 whitespace-pre-line">{r.comment}</p>

              {openId === r.id ? (
                <div className="mt-3 space-y-2">
                  <label htmlFor={`reply-${r.id}`} className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold">Your public reply</label>
                  <textarea
                    id={`reply-${r.id}`}
                    rows={3}
                    maxLength={600}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="e.g. Thank you so much, it was lovely having you in! See you for your next set."
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521] resize-none"
                  />
                  {error && <p className="text-sm text-[#B8746E]">{error}</p>}
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => save(r.id, draft.trim() || null)} disabled={saving} className="bg-[#3D2F2A] text-white px-5 py-2 rounded-xl font-semibold text-sm hover:bg-[#5A4640] transition disabled:opacity-50">
                      {saving ? "Saving…" : r.pro_response ? "Save reply" : "Post reply"}
                    </button>
                    {r.pro_response && (
                      <button type="button" onClick={() => save(r.id, null)} disabled={saving} className="px-3 py-2 rounded-xl text-sm font-semibold text-[#6B5F58] hover:text-[#2A2521]">
                        Remove reply
                      </button>
                    )}
                    <button type="button" onClick={() => setOpenId(null)} disabled={saving} className="px-3 py-2 rounded-xl text-sm font-semibold text-[#6B5F58] hover:text-[#2A2521]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : r.pro_response ? (
                <div className="mt-3 ml-3 pl-3 border-l-2 border-[#DDB4B0]">
                  <p className="text-xs font-semibold text-[#2A2521]">Your reply</p>
                  <p className="text-sm text-[#3D2F2A] mt-0.5 whitespace-pre-line">{r.pro_response}</p>
                  <button type="button" onClick={() => open(r)} className="mt-1 text-xs font-semibold text-[#B8746E] hover:underline">Edit reply</button>
                </div>
              ) : (
                <button type="button" onClick={() => open(r)} className="mt-2 text-sm font-semibold text-[#B8746E] hover:underline">Reply</button>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-[#6B5F58] mt-4">
        Think a review is fake or breaks our rules? Email <a href="mailto:hello@nanashub.co.uk" className="underline hover:no-underline">hello@nanashub.co.uk</a> and we&apos;ll look into it.
      </p>
    </section>
  );
}
