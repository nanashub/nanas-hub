"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";

type ProProfile = {
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
};

export default function ProEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState<ProProfile>({
    business_name: "",
    bio: "",
    years_experience: 0,
    location_type: "mobile",
    salon_address: "",
    service_radius_miles: 5,
    instagram_handle: "",
    external_booking_url: "",
    slot_release_info: "",
    featured_video_url: "",
    portfolio_images: [],
    accepting_bookings: true,
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single();
      if (profile?.user_type !== "pro") { router.push("/account"); return; }
      const { data: p } = await supabase.from("professional_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (p) {
        setForm({
          business_name: p.business_name || "",
          bio: p.bio || "",
          years_experience: p.years_experience || 0,
          location_type: p.location_type || "mobile",
          salon_address: p.salon_address || "",
          service_radius_miles: p.service_radius_miles || 5,
          instagram_handle: p.instagram_handle || "",
          external_booking_url: p.external_booking_url || "",
          slot_release_info: p.slot_release_info || "",
          featured_video_url: p.featured_video_url || "",
          portfolio_images: p.portfolio_images || [],
          accepting_bookings: p.accepting_bookings ?? true,
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !userId) return;
    setUploading(true);
    setError("");
    const files = Array.from(e.target.files);
    const newUrls: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("Only images are allowed");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Images must be under 5MB");
        continue;
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${userId}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("portfolio").upload(fileName, file);
      if (uploadError) {
        setError(uploadError.message);
        continue;
      }
      const { data: urlData } = supabase.storage.from("portfolio").getPublicUrl(fileName);
      newUrls.push(urlData.publicUrl);
    }

    setForm(prev => ({ ...prev, portfolio_images: [...prev.portfolio_images, ...newUrls] }));
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setForm(prev => ({ ...prev, portfolio_images: prev.portfolio_images.filter((_, i) => i !== index) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true); setSaved(false); setError("");
    const { data: existing } = await supabase.from("professional_profiles").select("id").eq("user_id", userId).maybeSingle();
    const result = existing
      ? await supabase.from("professional_profiles").update(form).eq("user_id", userId)
      : await supabase.from("professional_profiles").insert({ ...form, user_id: userId });
    if (result.error) { setError(result.error.message); setSaving(false); return; }
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return (<><Header /><main className="min-h-[calc(100vh-200px)] flex items-center justify-center"><p className="text-[#6B5F58]">Loading...</p></main></>);

  return (
    <>
      <Header />
      <main className="px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <Link href="/account" className="text-sm text-[#B8746E] hover:underline mb-4 inline-block">Back to account</Link>
          <h1 className="font-serif text-4xl font-semibold text-[#2A2521] mb-2">Your professional profile</h1>
          <p className="text-sm text-[#6B5F58] mb-8">This is what clients will see when they find you on Nana&apos;s Hub.</p>
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">Business name</label>
              <input type="text" value={form.business_name} onChange={(e) => setForm({...form, business_name: e.target.value})} placeholder="e.g. Ama Glow Hair" className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"/>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">About you</label>
              <textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} placeholder="Tell clients about your specialties, training, what makes your work different..." rows={5} maxLength={500} className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521] resize-none"/>
              <p className="text-xs text-[#6B5F58] mt-1">{form.bio.length} / 500 characters</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">Years of experience</label>
              <input type="number" min="0" value={form.years_experience} onChange={(e) => setForm({...form, years_experience: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"/>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">Where do you work?</label>
              <div className="grid grid-cols-3 gap-2">
                {(["mobile", "salon", "either"] as const).map((opt) => (
                  <button key={opt} type="button" onClick={() => setForm({...form, location_type: opt})} className={`py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition ${form.location_type === opt ? "bg-[#3D2F2A] text-white" : "bg-white/60 text-[#3D2F2A] border border-[#E8DCD0]"}`}>
                    {opt === "mobile" ? "I travel" : opt === "salon" ? "My salon" : "Either"}
                  </button>
                ))}
              </div>
            </div>
            {(form.location_type === "salon" || form.location_type === "either") && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">Salon address</label>
                <input type="text" value={form.salon_address} onChange={(e) => setForm({...form, salon_address: e.target.value})} placeholder="e.g. 42 Rye Lane, Peckham SE15 4ST" className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"/>
              </div>
            )}
            {(form.location_type === "mobile" || form.location_type === "either") && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">How far will you travel? (miles)</label>
                <input type="number" min="0" max="100" value={form.service_radius_miles} onChange={(e) => setForm({...form, service_radius_miles: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"/>
              </div>
            )}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">Instagram handle (optional)</label>
              <div className="flex">
                <span className="px-4 py-3 rounded-l-xl bg-[#F5EDE6] border border-r-0 border-[#E8DCD0] text-[#6B5F58]">@</span>
                <input type="text" value={form.instagram_handle} onChange={(e) => setForm({...form, instagram_handle: e.target.value.replace("@", "")})} placeholder="amaglowhair" className="flex-1 px-4 py-3 rounded-r-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"/>
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">External booking link (optional)</label>
              <input type="url" value={form.external_booking_url} onChange={(e) => setForm({...form, external_booking_url: e.target.value})} placeholder="https://yourname.acuityscheduling.com" className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"/>
              <p className="text-xs text-[#6B5F58] mt-1">If you already use Acuity, Square, Fresha, or Calendly, paste your booking link here.</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">When do your slots come out?</label>
              <input type="text" value={form.slot_release_info} onChange={(e) => setForm({...form, slot_release_info: e.target.value})} placeholder="e.g. Sundays 8pm, 1st of every month" className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"/>
              <p className="text-xs text-[#6B5F58] mt-1">Let clients know when you release new booking availability.</p>
            </div>
            <div className="pt-4 border-t border-[#E8DCD0]">
              <h2 className="font-serif text-2xl font-semibold text-[#2A2521] mb-1">Pro Highlights</h2>
              <p className="text-sm text-[#6B5F58] mb-4">Show off your best work.</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">Photos</label>
              <label className="block cursor-pointer">
                <div className="w-full px-4 py-6 rounded-xl bg-[#F5EDE6] border-2 border-dashed border-[#DDB4B0] text-center hover:bg-[#EFE4D9] transition">
                  {uploading ? (
                    <p className="text-[#3D2F2A] font-semibold">Uploading...</p>
                  ) : (
                    <>
                      <p className="text-[#3D2F2A] font-semibold">Click to upload photos</p>
                      <p className="text-xs text-[#6B5F58] mt-1">JPG, PNG, or GIF up to 5MB each. You can select multiple.</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" multiple onChange={handleFileUpload} disabled={uploading} className="hidden"/>
              </label>
              {form.portfolio_images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {form.portfolio_images.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[#F5EDE6] border border-[#E8DCD0]">
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover"/>
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white border border-[#E8DCD0] text-[#B8746E] text-xs font-bold hover:bg-[#F5EDE6]">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">Featured video URL (optional)</label>
              <input type="url" value={form.featured_video_url} onChange={(e) => setForm({...form, featured_video_url: e.target.value})} placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"/>
              <p className="text-xs text-[#6B5F58] mt-1">YouTube, TikTok, or Instagram video URL.</p>
            </div>
            <div className="bg-white border border-[#E8DCD0] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#2A2521]">Accepting bookings</p>
                <p className="text-xs text-[#6B5F58] mt-1">Turn off to pause new requests temporarily.</p>
              </div>
              <button type="button" onClick={() => setForm({...form, accepting_bookings: !form.accepting_bookings})} className={`relative w-14 h-7 rounded-full transition ${form.accepting_bookings ? "bg-[#B8746E]" : "bg-[#E8DCD0]"}`}>
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition ${form.accepting_bookings ? "left-8" : "left-1"}`}/>
              </button>
            </div>
            {error && <p className="text-sm text-[#B8746E] text-center">{error}</p>}
            <div className="flex items-center gap-4">
              <button type="submit" disabled={saving} className="bg-[#3D2F2A] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#5A4640] transition disabled:opacity-50">
                {saving ? "Saving..." : "Save profile"}
              </button>
              {saved && <p className="text-sm text-[#3D2F2A]">Saved successfully</p>}
            </div>
          </form>
        </div>
      </main>
    </>
  );
}