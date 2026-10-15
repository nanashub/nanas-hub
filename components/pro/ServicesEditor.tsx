"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { CATEGORIES, OTHER, categoryLabel, formatDuration, formatPrice, getCategory, isCategory, isStyle, styleLabel } from "@/lib/categories";

type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  style: string | null;
  price_pence: number | null;
  duration_minutes: number | null;
};

type Draft = {
  name: string;
  description: string;
  category: string;
  style: string;
  price: string;
  hours: string;
  minutes: string;
};

const emptyDraft: Draft = { name: "", description: "", category: "", style: "", price: "", hours: "", minutes: "" };

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]";
const labelClass = "block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2";

// Stops Enter in these fields from submitting the main profile form.
function noEnter(e: React.KeyboardEvent) {
  if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") e.preventDefault();
}

export default function ServicesEditor({
  userId,
  onCategoryUsed,
}: {
  userId: string;
  onCategoryUsed: (slug: string) => void;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("services")
        .select("id, name, description, category, style, price_pence, duration_minutes")
        .eq("professional_id", userId)
        .order("created_at", { ascending: true });
      setServices(data || []);
      setLoading(false);
    }
    load();
  }, [userId]);

  function startAdd() {
    setDraft(emptyDraft);
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function startEdit(s: Service) {
    setDraft({
      name: s.name,
      description: s.description || "",
      category: isCategory(s.category) ? s.category : "",
      style: isStyle(s.category, s.style) ? s.style : "",
      price: s.price_pence != null ? String(s.price_pence / 100) : "",
      hours: s.duration_minutes ? String(Math.floor(s.duration_minutes / 60)) : "",
      minutes: s.duration_minutes ? String(s.duration_minutes % 60) : "",
    });
    setEditingId(s.id);
    setError("");
    setShowForm(true);
  }

  function cancel() {
    setShowForm(false);
    setEditingId(null);
    setDraft(emptyDraft);
    setError("");
  }

  async function save() {
    const name = draft.name.trim();
    const price = parseFloat(draft.price);
    const duration = (parseInt(draft.hours) || 0) * 60 + (parseInt(draft.minutes) || 0);
    if (!name) return setError("Add a name for the service, for example Knotless braids, mid-back.");
    if (!draft.category) return setError("Pick a category for this service.");
    if (draft.category === OTHER && !name) return setError("Describe what this service is in the name box.");
    if (!draft.price || isNaN(price) || price < 0) return setError("Add a starting price in pounds, for example 85.");

    setBusy(true);
    setError("");
    const row = {
      name,
      description: draft.description.trim() || null,
      category: draft.category,
      style: isStyle(draft.category, draft.style) ? draft.style : null,
      price_pence: Math.round(price * 100),
      duration_minutes: duration || null,
    };
    const result = editingId
      ? await supabase.from("services").update(row).eq("id", editingId).select("id, name, description, category, style, price_pence, duration_minutes").single()
      : await supabase
          .from("services")
          .insert({ ...row, professional_id: userId, is_active: true })
          .select("id, name, description, category, style, price_pence, duration_minutes")
          .single();
    setBusy(false);
    if (result.error || !result.data) {
      setError(result.error?.message || "Couldn't save this service. Please try again.");
      return;
    }
    const saved = result.data as Service;
    setServices((prev) => (editingId ? prev.map((s) => (s.id === editingId ? saved : s)) : [...prev, saved]));
    onCategoryUsed(draft.category);
    cancel();
  }

  async function remove(id: string) {
    setBusy(true);
    const { error: delError } = await supabase.from("services").delete().eq("id", id);
    setBusy(false);
    if (delError) return setError(delError.message);
    setServices((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) cancel();
  }

  return (
    <div className="pt-4 border-t border-[#E8DCD0] space-y-4">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-[#2A2521] mb-1">Services &amp; prices</h2>
        <p className="text-sm text-[#6B5F58]">
          List what you offer and your starting prices. Services save straight away.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[#6B5F58]">Loading services…</p>
      ) : services.length === 0 && !showForm ? (
        <p className="text-sm text-[#6B5F58] bg-[#F5EDE6] rounded-xl px-4 py-3">No services yet. Add your first one below.</p>
      ) : (
        <ul className="divide-y divide-[#E8DCD0] bg-white border border-[#E8DCD0] rounded-xl">
          {services.map((s) => (
            <li key={s.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="font-semibold text-[#2A2521]">{s.name}</p>
                <p className="text-xs text-[#6B5F58] mt-0.5">
                  {[categoryLabel(s.category), styleLabel(s.category, s.style), formatDuration(s.duration_minutes)].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold text-[#2A2521] tabular-nums">from {formatPrice(s.price_pence)}</span>
                <button type="button" onClick={() => startEdit(s)} disabled={busy} className="text-xs font-semibold text-[#B8746E] hover:underline">
                  Edit
                </button>
                <button type="button" onClick={() => remove(s.id)} disabled={busy} className="text-xs font-semibold text-[#6B5F58] hover:underline">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <div className="bg-[#FBF8F5] border border-[#DDB4B0] rounded-xl p-4 space-y-4" onKeyDown={noEnter}>
          <p className="font-semibold text-[#2A2521]">{editingId ? "Edit service" : "New service"}</p>
          <div>
            <label htmlFor="svc-name" className={labelClass}>Service name</label>
            <input id="svc-name" type="text" maxLength={80} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Knotless braids, mid-back" className={inputClass} />
          </div>
          <div>
            <label htmlFor="svc-category" className={labelClass}>Category</label>
            <select id="svc-category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value, style: "" })} className={inputClass}>
              <option value="">Choose a category</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
          </div>
          {(getCategory(draft.category)?.styles.length ?? 0) > 0 && (
            <div>
              <label htmlFor="svc-style" className={labelClass}>Style</label>
              <select id="svc-style" value={draft.style} onChange={(e) => setDraft({ ...draft, style: e.target.value })} className={inputClass}>
                <option value="">Choose a style (optional)</option>
                {getCategory(draft.category)?.styles.map((st) => (
                  <option key={st.slug} value={st.slug}>{st.label}</option>
                ))}
              </select>
              <p className="text-xs text-[#6B5F58] mt-1">Clients can filter by style, so picking one helps them find you.</p>
            </div>
          )}
          {draft.category === OTHER && (
            <p className="text-xs text-[#6B5F58] -mt-2">Use the service name to say exactly what it is, for example &quot;Scalp massage&quot;.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="svc-price" className={labelClass}>Price from (£)</label>
              <input id="svc-price" type="number" min="0" step="0.01" inputMode="decimal" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="85" className={inputClass} />
            </div>
            <div>
              <label htmlFor="svc-hours" className={labelClass}>Hours</label>
              <input id="svc-hours" type="number" min="0" max="24" value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} placeholder="5" className={inputClass} />
            </div>
            <div>
              <label htmlFor="svc-minutes" className={labelClass}>Minutes</label>
              <input id="svc-minutes" type="number" min="0" max="59" step="5" value={draft.minutes} onChange={(e) => setDraft({ ...draft, minutes: e.target.value })} placeholder="30" className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="svc-desc" className={labelClass}>Details (optional)</label>
            <textarea id="svc-desc" rows={2} maxLength={200} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="e.g. Hair included. Wash and blow-dry extra." className={`${inputClass} resize-none`} />
          </div>
          {error && <p className="text-sm text-[#B8746E]">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={save} disabled={busy} className="bg-[#3D2F2A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#5A4640] transition disabled:opacity-50">
              {busy ? "Saving…" : editingId ? "Save changes" : "Add service"}
            </button>
            <button type="button" onClick={cancel} disabled={busy} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#6B5F58] hover:text-[#2A2521]">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {error && <p className="text-sm text-[#B8746E]">{error}</p>}
          <button type="button" onClick={startAdd} className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-[#DDB4B0] text-sm font-semibold text-[#3D2F2A] hover:bg-[#F5EDE6] transition">
            + Add a service
          </button>
        </>
      )}
    </div>
  );
}
