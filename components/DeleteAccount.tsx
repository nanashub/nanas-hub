"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function DeleteAccount({ userId, isPro }: { userId: string; isPro: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (confirmText.trim().toUpperCase() !== "DELETE") return;
    setDeleting(true);
    setError("");

    // Photos are removed first, through Storage, because the database can't delete files.
    if (isPro) {
      const { data: files } = await supabase.storage.from("portfolio").list(userId, { limit: 1000 });
      if (files && files.length > 0) {
        await supabase.storage.from("portfolio").remove(files.map((f) => `${userId}/${f.name}`));
      }
    }

    const { error: rpcError } = await supabase.rpc("delete_my_account");
    if (rpcError) {
      setError("We couldn't delete your account. Please try again, or email us and we'll do it for you.");
      setDeleting(false);
      return;
    }

    await supabase.auth.signOut().catch(() => {});
    router.push("/");
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-[#6B5F58] hover:text-[#2A2521] hover:underline">
        Delete my account
      </button>
    );
  }

  return (
    <div className="bg-white border border-[#DDB4B0] rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="font-serif text-2xl font-semibold text-[#2A2521] mb-2">Delete your account?</h3>
        <p className="text-sm text-[#3D2F2A]">
          This permanently deletes your login and everything linked to it
          {isPro ? ", including your professional profile, services and photos" : ""}. It can&apos;t be undone.
        </p>
      </div>
      <div>
        <label htmlFor="delete-confirm" className="block text-xs uppercase tracking-wider text-[#3D2F2A] font-semibold mb-2">
          Type DELETE to confirm
        </label>
        <input
          id="delete-confirm"
          type="text"
          autoComplete="off"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"
        />
      </div>
      {error && <p className="text-sm text-[#B8746E]">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || confirmText.trim().toUpperCase() !== "DELETE"}
          className="bg-[#9C3B35] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#7F2F2A] transition disabled:opacity-40"
        >
          {deleting ? "Deleting…" : "Delete my account"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setConfirmText(""); setError(""); }}
          disabled={deleting}
          className="px-4 py-3 rounded-xl text-sm font-semibold text-[#6B5F58] hover:text-[#2A2521]"
        >
          Keep my account
        </button>
      </div>
    </div>
  );
}
