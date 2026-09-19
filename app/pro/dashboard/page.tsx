"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";

type BookingWithClient = {
  id: string;
  client_id: string;
  client_name: string;
  service_description: string;
  requested_datetime: string;
  location_type: string;
  client_address: string | null;
  salon_address: string | null;
  client_notes: string | null;
  status: string;
  total_price_pence: number;
  duration_minutes: number;
  created_at: string;
};

export default function ProDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [durationInputs, setDurationInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single();
      if (profile?.user_type !== "pro") { router.push("/account"); return; }
      const { data: bookingsData } = await supabase.from("bookings").select("*").eq("professional_id", user.id).order("created_at", { ascending: false });
      if (!bookingsData) { setLoading(false); return; }
      const clientIds = [...new Set(bookingsData.map(b => b.client_id))];
      const { data: clients } = await supabase.from("profiles").select("id, first_name, last_name").in("id", clientIds);
      const withClients: BookingWithClient[] = bookingsData.map(b => {
        const client = clients?.find(c => c.id === b.client_id);
        return { ...b, client_name: client ? `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client" : "Client" };
      });
      setBookings(withClients);
      setLoading(false);
    }
    init();
  }, [router]);

  async function acceptBooking(bookingId: string) {
    setActionLoading(bookingId);
    const price = parseFloat(priceInputs[bookingId] || "0");
    const duration = parseInt(durationInputs[bookingId] || "60");
    const { error } = await supabase.from("bookings").update({
      status: "accepted",
      total_price_pence: Math.round(price * 100),
      duration_minutes: duration,
      confirmed_at: new Date().toISOString(),
    }).eq("id", bookingId);
    if (!error) setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "accepted", total_price_pence: Math.round(price * 100), duration_minutes: duration } : b));
    setActionLoading(null);
  }

  async function declineBooking(bookingId: string) {
    setActionLoading(bookingId);
    const { error } = await supabase.from("bookings").update({ status: "declined" }).eq("id", bookingId);
    if (!error) setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "declined" } : b));
    setActionLoading(null);
  }

  async function completeBooking(bookingId: string) {
    setActionLoading(bookingId);
    const { error } = await supabase.from("bookings").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", bookingId);
    if (!error) setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "completed" } : b));
    setActionLoading(null);
  }

  if (loading) return (<><Header /><main className="min-h-[calc(100vh-200px)] flex items-center justify-center"><p className="text-[#6B5F58]">Loading...</p></main></>);

  const pending = bookings.filter(b => b.status === "pending");
  const accepted = bookings.filter(b => b.status === "accepted");
  const completed = bookings.filter(b => b.status === "completed").slice(0, 5);

  function formatDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) + " at " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      <Header />
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/account" className="text-sm text-[#B8746E] hover:underline mb-4 inline-block">Back to account</Link>
          <h1 className="font-serif text-4xl font-semibold text-[#2A2521] mb-2">Bookings dashboard</h1>
          <p className="text-sm text-[#6B5F58] mb-8">Manage your incoming requests and upcoming appointments.</p>

          <div className="grid grid-cols-3 gap-3 mb-10">
            <div className="bg-[#F5EDE6] border border-[#DDB4B0] rounded-2xl p-4 text-center">
              <div className="font-serif text-3xl font-semibold text-[#B8746E]">{pending.length}</div>
              <div className="text-xs uppercase tracking-widest text-[#6B5F58] mt-1">Pending</div>
            </div>
            <div className="bg-white border border-[#E8DCD0] rounded-2xl p-4 text-center">
              <div className="font-serif text-3xl font-semibold text-[#2A2521]">{accepted.length}</div>
              <div className="text-xs uppercase tracking-widest text-[#6B5F58] mt-1">Upcoming</div>
            </div>
            <div className="bg-white border border-[#E8DCD0] rounded-2xl p-4 text-center">
              <div className="font-serif text-3xl font-semibold text-[#2A2521]">{bookings.filter(b => b.status === "completed").length}</div>
              <div className="text-xs uppercase tracking-widest text-[#6B5F58] mt-1">Completed</div>
            </div>
          </div>

          {pending.length > 0 && (
            <section className="mb-10">
              <h2 className="font-serif text-2xl font-semibold text-[#2A2521] mb-4">Pending requests</h2>
              <div className="space-y-4">
                {pending.map(b => (
                  <div key={b.id} className="bg-white border-2 border-[#DDB4B0] rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-semibold text-[#2A2521]">{b.client_name}</p>
                        <p className="text-sm text-[#6B5F58]">{formatDateTime(b.requested_datetime)}</p>
                      </div>
                      <span className="text-xs uppercase tracking-wider bg-[#F5EDE6] text-[#B8746E] px-3 py-1 rounded-full font-semibold">Pending</span>
                    </div>
                    <div className="space-y-2 mb-4 text-sm">
                      <p><span className="text-xs uppercase tracking-wider text-[#6B5F58] font-semibold">Service: </span>{b.service_description}</p>
                      <p><span className="text-xs uppercase tracking-wider text-[#6B5F58] font-semibold">Location: </span>{b.location_type === "mobile" ? `Mobile - ${b.client_address}` : `Salon - ${b.salon_address}`}</p>
                      {b.client_notes && <p><span className="text-xs uppercase tracking-wider text-[#6B5F58] font-semibold">Notes: </span>{b.client_notes}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-1">Set price (£)</label>
                        <input type="number" min="0" step="0.01" value={priceInputs[b.id] || ""} onChange={e => setPriceInputs({...priceInputs, [b.id]: e.target.value})} placeholder="0.00" className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521] text-sm"/>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-1">Duration (min)</label>
                        <input type="number" min="15" step="15" value={durationInputs[b.id] || ""} onChange={e => setDurationInputs({...durationInputs, [b.id]: e.target.value})} placeholder="60" className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521] text-sm"/>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptBooking(b.id)} disabled={actionLoading === b.id} className="flex-1 bg-[#3D2F2A] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#5A4640] transition disabled:opacity-50">
                        {actionLoading === b.id ? "..." : "Accept"}
                      </button>
                      <button onClick={() => declineBooking(b.id)} disabled={actionLoading === b.id} className="flex-1 bg-white border border-[#E8DCD0] text-[#6B5F58] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#F5EDE6] transition disabled:opacity-50">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {accepted.length > 0 && (
            <section className="mb-10">
              <h2 className="font-serif text-2xl font-semibold text-[#2A2521] mb-4">Upcoming appointments</h2>
              <div className="space-y-3">
                {accepted.map(b => (
                  <div key={b.id} className="bg-white border border-[#E8DCD0] rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="font-semibold text-[#2A2521]">{b.client_name}</p>
                        <p className="text-sm text-[#6B5F58]">{formatDateTime(b.requested_datetime)}</p>
                      </div>
                      <span className="text-xs uppercase tracking-wider bg-[#F5EDE6] text-[#3D2F2A] px-3 py-1 rounded-full font-semibold">Confirmed</span>
                    </div>
                    <p className="text-sm text-[#3D2F2A] mb-2">{b.service_description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6B5F58]">£{(b.total_price_pence / 100).toFixed(2)} - {b.duration_minutes} min</span>
                      <button onClick={() => completeBooking(b.id)} disabled={actionLoading === b.id} className="text-[#B8746E] hover:underline font-semibold">Mark as done</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl font-semibold text-[#2A2521] mb-4">Recent completed</h2>
              <div className="space-y-2">
                {completed.map(b => (
                  <div key={b.id} className="bg-[#FBF8F5] border border-[#E8DCD0] rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#2A2521] text-sm">{b.client_name}</p>
                      <p className="text-xs text-[#6B5F58]">{b.service_description} - {formatDateTime(b.requested_datetime)}</p>
                    </div>
                    <span className="text-sm text-[#6B5F58] font-semibold">£{(b.total_price_pence / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {pending.length === 0 && accepted.length === 0 && completed.length === 0 && (
            <div className="bg-[#F5EDE6] border border-[#DDB4B0] rounded-2xl p-8 text-center">
              <p className="font-serif text-2xl text-[#2A2521] mb-2">No bookings yet</p>
              <p className="text-sm text-[#6B5F58]">When clients book you, they will appear here.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}