"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ProListing = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  location_city: string | null;
  business_name: string | null;
  bio: string | null;
  location_type: string;
  average_rating: number;
  total_reviews: number;
};

export default function SearchPage() {
  const [pros, setPros] = useState<ProListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "mobile" | "salon">("all");

  useEffect(() => {
    async function loadPros() {
      setLoading(true);

      const { data: proProfiles, error: proError } = await supabase
        .from("professional_profiles")
        .select("*")
        .eq("accepting_bookings", true);

      if (proError || !proProfiles) {
        console.error("Search error:", proError);
        setLoading(false);
        return;
      }

      const userIds = proProfiles.map((p) => p.user_id);
      if (userIds.length === 0) {
        setPros([]);
        setLoading(false);
        return;
      }

      const { data: userProfiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      const merged: ProListing[] = proProfiles.map((p) => {
        const user = userProfiles?.find((u) => u.id === p.user_id);
        return {
          id: p.user_id,
          first_name: user?.first_name || null,
          last_name: user?.last_name || null,
          location_city: user?.location_city || null,
          business_name: p.business_name,
          bio: p.bio,
          location_type: p.location_type || "mobile",
          average_rating: p.average_rating || 0,
          total_reviews: p.total_reviews || 0,
        };
      });

      setPros(merged);
      setLoading(false);
    }

    loadPros();
  }, []);

  const filtered = pros.filter((pro) => {
    if (locationFilter && pro.location_city) {
      if (!pro.location_city.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    }
    if (locationFilter && !pro.location_city) return false;

    if (typeFilter !== "all") {
      if (typeFilter === "mobile" && pro.location_type === "salon") return false;
      if (typeFilter === "salon" && pro.location_type === "mobile") return false;
    }
    return true;
  });

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-200px)]">
        <section className="bg-gradient-to-b from-[#F5EDE6] to-[#DDB4B0] py-12">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-[#2A2521] mb-3 text-center">
              Find your specialist
            </h1>
            <p className="text-[#3D2F2A] text-center mb-8">
              Browse Black beauty and grooming professionals across the UK.
            </p>

            <div className="bg-white rounded-2xl p-4 shadow-lg space-y-3">
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="City (e.g. London, Manchester, Birmingham)"
                className="w-full px-4 py-3 rounded-xl bg-[#F5EDE6] border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"
              />
              <div className="grid grid-cols-3 gap-2">
                {(["all", "mobile", "salon"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTypeFilter(opt)}
                    className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                      typeFilter === opt
                        ? "bg-[#3D2F2A] text-white"
                        : "bg-[#F5EDE6] text-[#3D2F2A] border border-[#E8DCD0]"
                    }`}
                  >
                    {opt === "all" ? "All" : opt === "mobile" ? "Comes to you" : "Salon"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

<section className="text-center pt-4 space-y-3">
  {profile.accepting_bookings ? (
    <>
      {profile.external_booking_url ? (
        <>
          
            href={profile.external_booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#3D2F2A] text-white px-10 py-4 rounded-xl font-semibold text-sm hover:bg-[#5A4640] transition"
          >
            Book now ↗
          </a>
          <div>
            <Link
              href={`/book/${profile.id}`}
              className="text-sm text-[#B8746E] hover:underline"
            >
              Or request a custom date & time
            </Link>
          </div>
        </>
      ) : (
        <Link
          href={`/book/${profile.id}`}
          className="inline-block bg-[#3D2F2A] text-white px-10 py-4 rounded-xl font-semibold text-sm hover:bg-[#5A4640] transition"
        >
          Request booking →
        </Link>
      )}
    </>
  ) : (
    <div className="bg-[#F5EDE6] border border-[#DDB4B0] rounded-xl px-6 py-4 max-w-md mx-auto">
      <p className="text-[#6B5F58] text-sm">Not accepting new bookings right now.</p>
    </div>
  )}
</section>
    </>
  );
}
