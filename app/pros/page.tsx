"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ProfileWithPro = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  location_city: string | null;
  location_postcode: string | null;
  business_name: string;
  bio: string;
  years_experience: number;
  location_type: "mobile" | "salon" | "either";
  salon_address: string;
  service_radius_miles: number;
  instagram_handle: string;
  external_booking_url: string;
  accepting_bookings: boolean;
  average_rating: number;
  total_reviews: number;
};

export default function PublicProProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<ProfileWithPro | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, location_city, location_postcode, user_type")
        .eq("id", id)
        .single();

      if (!userProfile || userProfile.user_type !== "pro") {
        setNotFoundState(true);
        setLoading(false);
        return;
      }

      const { data: proProfile } = await supabase
        .from("professional_profiles")
        .select("*")
        .eq("user_id", id)
        .maybeSingle();

      if (!proProfile) {
        setNotFoundState(true);
        setLoading(false);
        return;
      }

      setProfile({
        id: userProfile.id,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        location_city: userProfile.location_city,
        location_postcode: userProfile.location_postcode,
        business_name: proProfile.business_name || "",
        bio: proProfile.bio || "",
        years_experience: proProfile.years_experience || 0,
        location_type: proProfile.location_type,
        salon_address: proProfile.salon_address || "",
        service_radius_miles: proProfile.service_radius_miles || 0,
        instagram_handle: proProfile.instagram_handle || "",
        external_booking_url: proProfile.external_booking_url || "",
        accepting_bookings: proProfile.accepting_bookings,
        average_rating: proProfile.average_rating || 0,
        total_reviews: proProfile.total_reviews || 0,
      });
      setLoading(false);
    }
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <p className="text-[#6B5F58]">Loading...</p>
        </main>
      </>
    );
  }

  if (notFoundState || !profile) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-serif text-4xl font-semibold text-[#2A2521] mb-4">Professional not found</h1>
          <Link href="/" className="text-[#B8746E] hover:underline font-semibold">Back to home</Link>
        </main>
      </>
    );
  }

  const displayName = profile.business_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Professional";
  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase();
  const proButtonClass = "inline-block bg-[#3D2F2A] text-white px-10 py-4 rounded-xl font-semibold text-sm hover:bg-[#5A4640] transition";

  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-b from-[#F5EDE6] to-[#DDB4B0] py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#DDB4B0] to-[#B8746E] border-4 border-white shadow-lg flex items-center justify-center text-white font-serif text-4xl font-semibold">
                {initials || "?"}
              </div>
              <div className="flex-1">
                <h1 className="font-serif text-4xl md:text-5xl font-semibold text-[#2A2521] mb-1">{displayName}</h1>
                {profile.instagram_handle && <p className="text-[#6B5F58] text-sm">@{profile.instagram_handle}</p>}
                {profile.location_city && (
                  <p className="text-[#3D2F2A] mt-2">
                    {profile.location_city}
                    {profile.location_postcode && ` - ${profile.location_postcode}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#E8DCD0] bg-[#FBF8F5] py-6">
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-serif text-2xl font-semibold text-[#B8746E]">
                {profile.average_rating > 0 ? profile.average_rating.toFixed(1) : "New"}
              </div>
              <div className="text-xs uppercase tracking-widest text-[#6B5F58] mt-1">Rating</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-semibold text-[#B8746E]">{profile.total_reviews}</div>
              <div className="text-xs uppercase tracking-widest text-[#6B5F58] mt-1">Reviews</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-semibold text-[#B8746E]">{profile.years_experience}</div>
              <div className="text-xs uppercase tracking-widest text-[#6B5F58] mt-1">
                {profile.years_experience === 1 ? "Year" : "Years"}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
          <section>
            <h2 className="text-xs uppercase tracking-widest text-[#B8746E] font-semibold mb-3">About</h2>
            <p className="text-[#2A2521] leading-relaxed">{profile.bio || "No bio provided yet."}</p>
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-widest text-[#B8746E] font-semibold mb-3">Where they work</h2>
            <div className="bg-white border border-[#E8DCD0] rounded-2xl p-5">
              {profile.location_type === "mobile" && (
                <>
                  <p className="text-[#2A2521] font-semibold">Mobile professional</p>
                  <p className="text-[#6B5F58] text-sm mt-1">Travels up to {profile.service_radius_miles} miles to you.</p>
                </>
              )}
              {profile.location_type === "salon" && (
                <>
                  <p className="text-[#2A2521] font-semibold">Salon-based</p>
                  {profile.salon_address && <p className="text-[#6B5F58] text-sm mt-1">{profile.salon_address}</p>}
                </>
              )}
              {profile.location_type === "either" && (
                <>
                  <p className="text-[#2A2521] font-semibold">Mobile and salon</p>
                  <p className="text-[#6B5F58] text-sm mt-1">
                    Available at their salon or up to {profile.service_radius_miles} miles from home.
                  </p>
                  {profile.salon_address && <p className="text-[#6B5F58] text-sm mt-2">{profile.salon_address}</p>}
                </>
              )}
            </div>
          </section>

          <section className="text-center pt-4 space-y-3">
            {!profile.accepting_bookings && (
              <div className="bg-[#F5EDE6] border border-[#DDB4B0] rounded-xl px-6 py-4 max-w-md mx-auto">
                <p className="text-[#6B5F58] text-sm">Not accepting new bookings right now.</p>
              </div>
            )}
            {profile.accepting_bookings && profile.external_booking_url && (
              <>
                <a href={profile.external_booking_url} target="_blank" rel="noopener noreferrer" className={proButtonClass}>
                  Book now
                </a>
                <div>
                  <Link href={`/book/${profile.id}`} className="text-sm text-[#B8746E] hover:underline">
                    Or request a custom date and time
                  </Link>
                </div>
              </>
            )}
            {profile.accepting_bookings && !profile.external_booking_url && (
              <Link href={`/book/${profile.id}`} className={proButtonClass}>
                Request booking
              </Link>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
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
      const { data: proProfiles } = await supabase.from("professional_profiles").select("*").eq("accepting_bookings", true);
      if (!proProfiles) { setLoading(false); return; }
      const userIds = proProfiles.map((p) => p.user_id);
      if (userIds.length === 0) { setPros([]); setLoading(false); return; }
      const { data: userProfiles } = await supabase.from("profiles").select("*").in("id", userIds);
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
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-[#2A2521] mb-3 text-center">Find your specialist</h1>
            <p className="text-[#3D2F2A] text-center mb-8">Browse Black beauty and grooming professionals across the UK.</p>
            <div className="bg-white rounded-2xl p-4 shadow-lg space-y-3">
              <input type="text" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} placeholder="City (e.g. London, Manchester, Birmingham)" className="w-full px-4 py-3 rounded-xl bg-[#F5EDE6] border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"/>
              <div className="grid grid-cols-3 gap-2">
                {(["all", "mobile", "salon"] as const).map((opt) => (
                  <button key={opt} type="button" onClick={() => setTypeFilter(opt)} className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${typeFilter === opt ? "bg-[#3D2F2A] text-white" : "bg-[#F5EDE6] text-[#3D2F2A] border border-[#E8DCD0]"}`}>
                    {opt === "all" ? "All" : opt === "mobile" ? "Comes to you" : "Salon"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="max-w-4xl mx-auto px-6 py-10">
          {loading ? (
            <p className="text-center text-[#6B5F58]">Loading pros...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#2A2521] font-serif text-xl mb-2">No professionals found</p>
              <p className="text-sm text-[#6B5F58]">Try adjusting your filters, or check back soon as more pros join.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#6B5F58] mb-6">{filtered.length} {filtered.length === 1 ? "professional" : "professionals"} found</p>
              <div className="space-y-4">
                {filtered.map((pro) => {
                  const displayName = pro.business_name || `${pro.first_name || ""} ${pro.last_name || ""}`.trim() || "Professional";
                  const initials = `${pro.first_name?.[0] || ""}${pro.last_name?.[0] || ""}`.toUpperCase();
                  return (
                    <Link key={pro.id} href={`/pros/${pro.id}`} className="block bg-white border border-[#E8DCD0] rounded-2xl p-5 hover:border-[#B8746E] transition">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#DDB4B0] to-[#B8746E] flex items-center justify-center text-white font-serif text-xl font-semibold flex-shrink-0">
                          {initials || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg font-semibold text-[#2A2521] truncate">{displayName}</h3>
                          <p className="text-xs text-[#6B5F58] mb-2">
                            {pro.location_city || "Location not set"}
                            {" - "}
                            {pro.location_type === "mobile" && "Mobile"}
                            {pro.location_type === "salon" && "Salon"}
                            {pro.location_type === "either" && "Mobile and salon"}
                          </p>
                          {pro.bio && <p className="text-sm text-[#3D2F2A] line-clamp-2">{pro.bio}</p>}
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="text-[#B8746E] font-semibold">
                              {pro.average_rating > 0 ? `${pro.average_rating.toFixed(1)} stars` : "New"}
                            </span>
                            {pro.total_reviews > 0 && (
                              <span className="text-[#6B5F58]">{pro.total_reviews} {pro.total_reviews === 1 ? "review" : "reviews"}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}