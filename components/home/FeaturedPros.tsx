"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

type Card = {
  id: string | null;
  name: string;
  city: string | null;
  locationType: string;
  bio: string;
  rating: number;
  reviews: number;
  initials: string;
};

const examples: Card[] = [
  { id: null, name: "Adwoa Hair Studio", city: "Romford", locationType: "salon", bio: "Knotless braids, boho braids and kids' styles.", rating: 4.9, reviews: 212, initials: "A" },
  { id: null, name: "Tobi Lash & Brow", city: "Chelmsford", locationType: "mobile", bio: "Hybrid lash sets and brow lamination.", rating: 4.8, reviews: 96, initials: "T" },
  { id: null, name: "Kemi Skin Clinic", city: "Southend", locationType: "either", bio: "Treatments for hyperpigmentation and chemical peels.", rating: 5.0, reviews: 58, initials: "K" },
];

const avatarColours = ["#B8746E", "#3D2F2A", "#B8956A"];

function whereLabel(t: string) {
  if (t === "mobile") return "Mobile";
  if (t === "salon") return "Salon";
  return "Mobile & salon";
}

export default function FeaturedPros() {
  const [cards, setCards] = useState<Card[] | null>(null);

  useEffect(() => {
    async function load() {
      const { data: pros } = await supabase
        .from("professional_profiles")
        .select("*")
        .eq("accepting_bookings", true)
        .limit(3);
      if (!pros || pros.length === 0) {
        setCards([]);
        return;
      }
      const { data: users } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, location_city")
        .in("id", pros.map((p) => p.user_id));
      setCards(
        pros.map((p) => {
          const u = users?.find((x) => x.id === p.user_id);
          const personal = `${u?.first_name || ""} ${u?.last_name || ""}`.trim();
          const name = p.business_name || personal || "Professional";
          return {
            id: p.user_id,
            name,
            city: u?.location_city || null,
            locationType: p.location_type || "mobile",
            bio: p.bio || "",
            rating: p.average_rating || 0,
            reviews: p.total_reviews || 0,
            initials: (`${u?.first_name?.[0] || ""}${u?.last_name?.[0] || ""}` || name[0]).toUpperCase(),
          };
        })
      );
    }
    load();
  }, []);

  const showingExamples = cards !== null && cards.length === 0;
  const list = cards === null ? [] : showingExamples ? examples : cards;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards === null &&
          [0, 1, 2].map((i) => <div key={i} className="h-48 rounded-2xl bg-white/50 border border-[#E8DCD0] animate-pulse" />)}
        {list.map((c, i) => {
          const inner = (
            <>
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-serif text-2xl font-semibold shrink-0"
                  style={{ background: avatarColours[i % avatarColours.length] }}
                >
                  {c.initials}
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-[#2A2521] leading-tight">{c.name}</h3>
                  <p className="text-sm text-[#6B5F58]">
                    {whereLabel(c.locationType)}
                    {c.city && ` · ${c.city}`}
                  </p>
                </div>
              </div>
              {c.bio && <p className="text-sm text-[#3D2F2A] leading-relaxed line-clamp-2">{c.bio}</p>}
              <div className="mt-auto border-t border-[#E8DCD0] pt-3 text-sm">
                <span className="text-[#B8746E] font-semibold">
                  {c.rating > 0 ? `★ ${c.rating.toFixed(1)} · ${c.reviews} review${c.reviews === 1 ? "" : "s"}` : "New on Nana's Hub"}
                </span>
              </div>
            </>
          );
          const cls = "bg-white border border-[#E8DCD0] rounded-2xl p-6 flex flex-col gap-4 transition";
          return c.id ? (
            <Link key={c.id} href={`/pros/${c.id}`} className={`${cls} hover:border-[#B8746E]`}>
              {inner}
            </Link>
          ) : (
            <div key={c.name} className={cls}>
              {inner}
            </div>
          );
        })}
      </div>
      {showingExamples && (
        <p className="text-xs text-[#6B5F58] mt-4">Example profiles. Real pros will appear here as they join.</p>
      )}
    </>
  );
}
