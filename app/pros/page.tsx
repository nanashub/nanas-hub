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
  slot_release_info: string;
  featured_video_url: string;
  portfolio_images: string[];
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
      const { data: userProfile } = await supabase.from("profiles").select("id, first_name, last_name, location_city, location_postcode, user_type").eq("id", id).single();
      if (!userProfile || userProfile.user_type !== "pro") { setNotFoundState(true); setLoading(false); return; }
      const { data: p } = await supabase.from("professional_profiles").select("*").eq("user_id", id).maybeSingle();
      if (!p) { setNotFoundState(true); setLoading(false); return; }
      setProfile({
        id: userProfile.id,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        location_city: userProfile.location_city,
        location_postcode: userProfile.location_postcode,
        business_name: p.business_name || "",
        bio: p.bio || "",
        years_experience: p.years_experience || 0,
        location_type: p.location_type,
        salon_address: p.salon_address || "",
        service_radius_miles: p.service_radius_miles || 0,
        instagram_handle: p.instagram_handle || "",
        external_booking_url: p.external_booking_url || "",
        slot_release_info: p.slot_release_info || "",
        featured_video_url: p.featured_video_url || "",
        portfolio_images: p.portfolio_images || [],
        accepting_bookings: p.accepting_bookings,
        average_rating: p.average_rating || 0,
        total_reviews: p.total_reviews || 0,
      });
      setLoading(false);
    }
    loadProfile();
  }, [id]);

  if (loading) return (<><Header /><main className="min-h-[calc(100vh-200px)] flex items-center justify-center"><p className="text-[#6B5F58]">Loading...</p></main></>);

  if (notFoundState || !profile) return (
    <><Header /><main className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-4xl font-semibold text-[#2A2521] mb-4">Professional not found</h1>
      <Link href="/" className="text-[#B8746E] hover:underline font-semibold">Back to home</Link>
    </main></>
  );

  const displayName = profile.business_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Professional";
  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase();
  const btnClass = "inline-block bg-[#3D2F2A] text-white px-10 py-4 rounded-xl font-semibold text-sm hover:bg-[#5A4640] transition";

  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-b from-[#F5EDE6] to-[#DDB4B0] py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#DDB4B0] to-[#B8746E] border-4 border-white shadow-lg flex items-center justify-center text-white font-serif text-4xl font-semibold">{initials || "?"}</div>
              <div className="flex-1">
                <h1 className="font-serif text-4xl md:text-5xl font-semibold text-[#2A2521] mb-1">{displayName}</h1>
                {profile.instagram_handle && <p className="text-[#6B5F58] text-sm">@{profile.instagram_handle}</p>}
                {profile.location_city && <p className="text-[#3D2F2A] mt-2">{profile.location_city}{profile.location_postcode && ` - ${profile.location_postcode}`}</p>}
              </div>
            </div>
          </div>
        </section>
        <section className="border-b border-[#E8DCD0] bg-[#FBF8F5] py-6">
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-4 text-center">
            <div><div className="font-serif text-2xl font-semibold text-[#B8746E]">{profile.average_rating > 0 ? profile.average_rating.toFixed(1) : "New"}</div><div className="text-xs uppercase tracking-widest text-[#6B5F58] mt-1">Rating</div></div>
            <div><div className="font-serif text-2xl font-semibold text-[#B8746E]">{profile.total_reviews}</div><div className="text-xs uppercase tracking-widest text-[#6B5F58] mt-1">Reviews</div></div>
            <div><div className="font-serif text-2xl font-semibold text-[#B8746E]">{profile.years_experience}</div><div className="text-xs uppercase tracking-widest text-[#6B5F58] mt-1">{profile.years_experience === 1 ? "Year" : "Years"}</div></div>
          </div>
        </section>
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
          <section>
            <h2 className="text-xs uppercase tracking-widest text-[#B8746E] font-semibold mb-3">About</h2>
            <p className="text-[#2A2521] leading-relaxed">{profile.bio || "No bio provided yet."}</p>
          </section>

          {profile.portfolio_images.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-widest text-[#B8746E] font-semibold mb-3">Pro Highlights</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {profile.portfolio_images.map((url, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl bg-[#F5EDE6] border border-[#E8DCD0]">
                    <img src={url} alt={`Highlight ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              {profile.featured_video_url && (
                <div className="mt-4">
                  <a href={profile.featured_video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white border border-[#E8DCD0] rounded-xl px-4 py-3 text-sm text-[#3D2F2A] hover:border-[#B8746E] transition">
                    Watch featured video
                  </a>
                </div>
              )}
            </section>
          )}

          {profile.portfolio_images.length === 0 && profile.featured_video_url && (
            <section>
              <h2 className="text-xs uppercase tracking-widest text-[#B8746E] font-semibold mb-3">Pro Highlights</h2>
              <a href={profile.featured_video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white border border-[#E8DCD0] rounded-xl px-4 py-3 text-sm text-[#3D2F2A] hover:border-[#B8746E] transition">
                Watch featured video
              </a>
            </section>
          )}

          <section>
            <h2 className="text-xs uppercase tracking-widest text-[#B8746E] font-semibold mb-3">Where they work</h2>
            <div className="bg-white border border-[#E8DCD0] rounded-2xl p-5">
              {profile.location_type === "mobile" && (<><p className="text-[#2A2521] font-semibold">Mobile professional</p><p className="text-[#6B5F58] text-sm mt-1">Travels up to {profile.service_radius_miles} miles to you.</p></>)}
              {profile.location_type === "salon" && (<><p className="text-[#2A2521] font-semibold">Salon-based</p>{profile.salon_address && <p className="text-[#6B5F58] text-sm mt-1">{profile.salon_address}</p>}</>)}
              {profile.location_type === "either" && (<><p className="text-[#2A2521] font-semibold">Mobile and salon</p><p className="text-[#6B5F58] text-sm mt-1">Available at their salon or up to {profile.service_radius_miles} miles from home.</p>{profile.salon_address && <p className="text-[#6B5F58] text-sm mt-2">{profile.salon_address}</p>}</>)}
            </div>
          </section>

          {profile.slot_release_info && (
            <section>
              <h2 className="text-xs uppercase tracking-widest text-[#B8746E] font-semibold mb-3">When slots come out</h2>
              <div className="bg-[#F5EDE6] border border-[#DDB4B0] rounded-2xl p-5">
                <p className="text-[#2A2521]">{profile.slot_release_info}</p>
              </div>
            </section>
          )}

          <section className="text-center pt-4 space-y-3">
            {!profile.accepting_bookings && (<div className="bg-[#F5EDE6] border border-[#DDB4B0] rounded-xl px-6 py-4 max-w-md mx-auto"><p className="text-[#6B5F58] text-sm">Not accepting new bookings right now.</p></div>)}
            {profile.accepting_bookings && profile.external_booking_url && (
              <>
                <a href={profile.external_booking_url} target="_blank" rel="noopener noreferrer" className={btnClass}>Book now</a>
                <div><Link href={`/book/${profile.id}`} className="text-sm text-[#B8746E] hover:underline">Or request a custom date and time</Link></div>
              </>
            )}
            {profile.accepting_bookings && !profile.external_booking_url && (
              <Link href={`/book/${profile.id}`} className={btnClass}>Request booking</Link>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}