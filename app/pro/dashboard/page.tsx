"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";
import ReplyToReviews from "@/components/reviews/ReplyToReviews";

type ProProfile = {
  business_name: string | null;
  bio: string | null;
  service_categories: string[] | null;
  external_booking_url: string | null;
  instagram_handle: string | null;
  portfolio_images: string[] | null;
  location_type: string | null;
  salon_address: string | null;
  service_radius_miles: number | null;
  accepting_bookings: boolean | null;
};

type CheckItem = { label: string; hint: string; done: boolean };

const PHOTOS_NEEDED = 3;

function buildChecklist(p: ProProfile, city: string, serviceCount: number): CheckItem[] {
  const photos = p.portfolio_images?.length || 0;
  const whereDone =
    p.location_type === "mobile"
      ? (p.service_radius_miles || 0) > 0
      : !!p.salon_address?.trim();
  return [
    { label: "Business name", hint: "The name clients will see.", done: !!p.business_name?.trim() },
    { label: "Town or city", hint: "So clients nearby can find you.", done: !!city.trim() },
    { label: "About you", hint: "A few lines about your work and what makes you different.", done: !!p.bio?.trim() },
    { label: "What you do", hint: "Pick your categories, like Single plait styles or Lashes.", done: (p.service_categories?.length || 0) > 0 },
    { label: "Services and prices", hint: "Add at least one service with a starting price.", done: serviceCount > 0 },
    { label: "Where you work", hint: "Your salon address, or how far you travel.", done: whereDone },
    { label: "A way to book", hint: "Your booking link or your Instagram.", done: !!p.external_booking_url?.trim() || !!p.instagram_handle?.trim() },
    { label: `${PHOTOS_NEEDED} or more photos`, hint: `You have ${photos}. Clients book from photos, so show your best work.`, done: photos >= PHOTOS_NEEDED },
  ];
}

export default function ProDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [city, setCity] = useState("");
  const [pro, setPro] = useState<ProProfile | null>(null);
  const [serviceCount, setServiceCount] = useState(0);
  const [profileUrl, setProfileUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, first_name, location_city")
        .eq("id", user.id)
        .single();
      if (profile?.user_type !== "pro") { router.push("/account"); return; }

      const { data: p } = await supabase
        .from("professional_profiles")
        .select("business_name, bio, service_categories, external_booking_url, instagram_handle, portfolio_images, location_type, salon_address, service_radius_miles, accepting_bookings")
        .eq("user_id", user.id)
        .maybeSingle();
      const { count } = await supabase
        .from("services")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", user.id);

      setUserId(user.id);
      setFirstName(profile.first_name || "");
      setCity(profile.location_city || "");
      setPro(p);
      setServiceCount(count || 0);
      setProfileUrl(`${window.location.origin}/pros/${user.id}`);
      setLoading(false);
    }
    init();
  }, [router]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.getElementById("profile-link") as HTMLInputElement | null;
      input?.select();
    }
  }

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

  const checklist = pro ? buildChecklist(pro, city, serviceCount) : [];
  const doneCount = checklist.filter((c) => c.done).length;
  const allDone = pro !== null && doneCount === checklist.length;
  const paused = pro?.accepting_bookings === false;

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-200px)] px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <Link href="/account" className="text-sm text-[#B8746E] hover:underline mb-4 inline-block">Back to account</Link>
            <h1 className="font-serif text-4xl font-semibold text-[#2A2521] mb-2">
              {firstName ? `Hi ${firstName}, here's your dashboard` : "Your dashboard"}
            </h1>
            <p className="text-sm text-[#6B5F58]">Get your profile ready, then share it so clients can find you.</p>
          </div>

          {!pro ? (
            <section className="bg-[#F5EDE6] border border-[#DDB4B0] rounded-2xl p-6">
              <h2 className="font-serif text-2xl font-semibold text-[#2A2521] mb-2">Set up your profile</h2>
              <p className="text-sm text-[#3D2F2A] mb-5">
                You haven&apos;t created your professional profile yet. It takes about 10 minutes, and then clients can find you.
              </p>
              <Link href="/pro/edit" className="inline-block bg-[#3D2F2A] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#5A4640] transition">
                Create my profile →
              </Link>
            </section>
          ) : (
            <>
              {paused && (
                <section className="bg-white border border-[#DDB4B0] rounded-2xl px-5 py-4 text-sm text-[#3D2F2A]">
                  <strong className="font-semibold">Bookings are paused.</strong> Your profile is hidden from Browse pros until you turn{" "}
                  <Link href="/pro/edit" className="text-[#B8746E] font-semibold hover:underline">Accepting bookings</Link> back on.
                </section>
              )}

              <section className="bg-white border border-[#E8DCD0] rounded-2xl p-6">
                <div className="flex items-baseline justify-between gap-4 mb-3">
                  <h2 className="font-serif text-2xl font-semibold text-[#2A2521]">Profile checklist</h2>
                  <span className="text-sm font-semibold text-[#3D2F2A] tabular-nums">{doneCount} of {checklist.length}</span>
                </div>
                <div className="h-2 rounded-full bg-[#F5EDE6] overflow-hidden mb-5" role="progressbar" aria-valuemin={0} aria-valuemax={checklist.length} aria-valuenow={doneCount} aria-label="Profile progress">
                  <div className="h-full bg-[#B8746E] rounded-full transition-all" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
                </div>
                {allDone ? (
                  <p className="text-sm text-[#3D2F2A] bg-[#F5EDE6] rounded-xl px-4 py-3">
                    Your profile is complete. Share your link below to start getting clients.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#E8DCD0]">
                    {checklist.map((item) => (
                      <li key={item.label} className="flex items-start gap-3 py-3">
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${item.done ? "bg-[#3D2F2A] text-white" : "border-2 border-[#DDB4B0]"}`}
                        >
                          {item.done ? "✓" : ""}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold ${item.done ? "text-[#6B5F58] line-through decoration-[#DDB4B0]" : "text-[#2A2521]"}`}>
                            {item.label}
                            <span className="sr-only">{item.done ? " (done)" : " (to do)"}</span>
                          </p>
                          {!item.done && <p className="text-xs text-[#6B5F58] mt-0.5">{item.hint}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {!allDone && (
                  <Link href="/pro/edit" className="mt-4 inline-block bg-[#3D2F2A] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#5A4640] transition">
                    Finish my profile →
                  </Link>
                )}
              </section>

              <section className="bg-[#F5EDE6] border border-[#DDB4B0] rounded-2xl p-6">
                <h2 className="font-serif text-2xl font-semibold text-[#2A2521] mb-1">Share your profile</h2>
                <p className="text-sm text-[#3D2F2A] mb-4">Add this link to your Instagram bio, TikTok or WhatsApp so clients can see your work, services and prices.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label htmlFor="profile-link" className="sr-only">Your profile link</label>
                  <input
                    id="profile-link"
                    readOnly
                    value={profileUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] text-sm text-[#2A2521] outline-none focus:border-[#B8746E]"
                  />
                  <button type="button" onClick={copyLink} className="bg-[#3D2F2A] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#5A4640] transition whitespace-nowrap">
                    {copied ? "Copied ✓" : "Copy link"}
                  </button>
                </div>
                <Link href={`/pros/${userId}`} className="inline-block mt-3 text-sm text-[#B8746E] font-semibold hover:underline">
                  View my profile as clients see it →
                </Link>
              </section>

              <ReplyToReviews proId={userId} />
            </>
          )}

        </div>
      </main>
    </>
  );
}
