"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ProInfo = {
  id: string;
  business_name: string | null;
  first_name: string | null;
  last_name: string | null;
  location_type: "mobile" | "salon" | "either";
  salon_address: string;
  accepting_bookings: boolean;
};

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: proId } = use(params);
  const router = useRouter();
  const [pro, setPro] = useState<ProInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);

  const [form, setForm] = useState({
    service_description: "",
    date: "",
    time: "",
    duration_minutes: 60,
    location_choice: "mobile" as "mobile" | "salon",
    client_address: "",
    client_notes: "",
    estimated_price_gbp: 0,
  });

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setClientId(user.id);

      if (user.id === proId) {
        router.push("/account");
        return;
      }

      const { data: proProfileData } = await supabase
        .from("professional_profiles")
        .select("*")
        .eq("user_id", proId)
        .maybeSingle();

      const { data: proUserData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", proId)
        .maybeSingle();

      if (!proProfileData || !proUserData) {
        setError("Professional not found");
        setLoading(false);
        return;
      }

      const info: ProInfo = {
        id: proId,
        business_name: proProfileData.business_name,
        first_name: proUserData.first_name,
        last_name: proUserData.last_name,
        location_type: proProfileData.location_type,
        salon_address: proProfileData.salon_address || "",
        accepting_bookings: proProfileData.accepting_bookings,
      };

      setPro(info);

      if (info.location_type === "salon") {
        setForm(prev => ({ ...prev, location_choice: "salon" }));
      } else {
        setForm(prev => ({ ...prev, location_choice: "mobile" }));
      }

      setLoading(false);
    }

    init();
  }, [proId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !pro) return;

    setError("");
    setSubmitting(true);

    const requestedDatetime = new Date(`${form.date}T${form.time}`).toISOString();

    const { error: insertError } = await supabase
      .from("bookings")
      .insert({
        client_id: clientId,
        professional_id: pro.id,
        service_id: null,
        service_description: form.service_description,
        requested_datetime: requestedDatetime,
        duration_minutes: form.duration_minutes,
        location_type: form.location_choice,
        client_address: form.location_choice === "mobile" ? form.client_address : null,
        salon_address: form.location_choice === "salon" ? pro.salon_address : null,
        client_notes: form.client_notes || null,
        total_price_pence: Math.round((form.estimated_price_gbp || 0) * 100),
        status: "pending",
      });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <p className="text-[#6B5F58]">Loading…</p>
        </main>
      </>
    );
  }

  if (!pro) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-serif text-4xl font-semibold text-[#2A2521] mb-4">Not available</h1>
          <p className="text-[#6B5F58] mb-8">{error || "This professional isn't available for booking right now."}</p>
          <Link href="/pros" className="text-[#B8746E] hover:underline font-semibold">← Back to search</Link>
        </main>
      </>
    );
  }

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="bg-white border-2 border-[#B8746E] rounded-2xl p-8 mb-6">
              <p className="font-serif text-4xl text-[#B8746E] mb-3">Request sent.</p>
              <p className="text-[#3D2F2A] mb-2">
                Your booking request has been sent to {pro.business_name || `${pro.first_name} ${pro.last_name}`}.
              </p>
              <p className="text-sm text-[#6B5F58]">
                They&apos;ll get in touch to confirm.
              </p>
            </div>
            <Link href="/account" className="text-[#B8746E] hover:underline font-semibold">
              View my account →
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const proName = pro.business_name || `${pro.first_name || ""} ${pro.last_name || ""}`.trim() || "the professional";

  return (
    <>
      <Header />
      <main className="px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <Link href={`/pros/${pro.id}`} className="text-sm text-[#B8746E] hover:underline mb-4 inline-block">
            ← Back to profile
          </Link>
          <h1 className="font-serif text-4xl font-semibold text-[#2A2521] mb-2">
            Request booking
          </h1>
          <p className="text-sm text-[#6B5F58] mb-8">
            With <span className="font-semibold text-[#B8746E]">{proName}</span>
          </p>

          {!pro.accepting_bookings ? (
            <div className="bg-[#F5EDE6] border border-[#DDB4B0] rounded-xl p-6 text-center">
              <p className="text-[#3D2F2A]">This professional isn&apos;t accepting new bookings right now.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">
                  What do you want done?
                </label>
                <input
                  type="text"
                  required
                  value={form.service_description}
                  onChange={(e) => setForm({...form, service_description: e.target.value})}
                  placeholder="e.g. Knotless braids, beard trim, lash lift"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({...form, time: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">
                  Estimated duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={form.duration_minutes}
                  onChange={(e) => setForm({...form, duration_minutes: parseInt(e.target.value) || 60})}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"
                />
              </div>

              {pro.location_type === "either" && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">
                    Where?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({...form, location_choice: "mobile"})}
                      className={`py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition ${
                        form.location_choice === "mobile"
                          ? "bg-[#3D2F2A] text-white"
                          : "bg-white/60 text-[#3D2F2A] border border-[#E8DCD0]"
                      }`}
                    >
                      They come to me
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({...form, location_choice: "salon"})}
                      className={`py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition ${
                        form.location_choice === "salon"
                          ? "bg-[#3D2F2A] text-white"
                          : "bg-white/60 text-[#3D2F2A] border border-[#E8DCD0]"
                      }`}
                    >
                      I go to salon
                    </button>
                  </div>
                </div>
              )}

              {form.location_choice === "mobile" && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">
                    Your address
                  </label>
                  <input
                    type="text"
                    required
                    value={form.client_address}
                    onChange={(e) => setForm({...form, client_address: e.target.value})}
                    placeholder="Full address including postcode"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"
                  />
                </div>
              )}

              {form.location_choice === "salon" && pro.salon_address && (
                <div className="bg-[#F5EDE6] border border-[#DDB4B0] rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-1">Salon location</p>
                  <p className="text-sm text-[#3D2F2A]">{pro.salon_address}</p>
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">
                  Estimated price (£, optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.estimated_price_gbp || ""}
                  onChange={(e) => setForm({...form, estimated_price_gbp: parseFloat(e.target.value) || 0})}
                  placeholder="Leave blank to agree with pro"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={form.client_notes}
                  onChange={(e) => setForm({...form, client_notes: e.target.value})}
                  placeholder="Anything the pro should know? Hair type, allergies, preferred style..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521] resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-[#B8746E] text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#3D2F2A] text-white py-4 rounded-xl font-semibold text-sm hover:bg-[#5A4640] transition disabled:opacity-50"
              >
                {submitting ? "Sending request…" : "Send booking request"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}