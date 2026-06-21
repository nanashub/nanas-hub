"use client";

import { useState } from "react";
import { joinWaitlist } from "@/app/actions";

export default function WaitlistForm({ theme = "light" }: { theme?: "light" | "dark" }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState("client");

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    formData.set("userType", userType);
    const result = await joinWaitlist(formData);
    if (result.success) {
      setStatus("success");
      setMessage("You're on the list. We'll be in touch soon.");
    } else {
      setStatus("error");
      setMessage(result.error);
    }
  }

  const isDark = theme === "dark";

  if (status === "success") {
    return (
      <div className={`${isDark ? "bg-white/10 border-white/30 text-white" : "bg-white border-[#B8746E] text-[#3D2F2A]"} border-2 rounded-2xl px-6 py-8 max-w-md mx-auto`}>
        <p className={`font-serif text-3xl mb-2 ${isDark ? "text-white" : "text-[#B8746E]"}`}>Welcome.</p>
        <p className="text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex gap-2 mb-4 justify-center">
        <button type="button" onClick={() => setUserType("client")} className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider ${userType === "client" ? (isDark ? "bg-white text-[#3D2F2A]" : "bg-[#3D2F2A] text-white") : (isDark ? "bg-white/10 text-white/80" : "bg-white/60 text-[#3D2F2A]")}`}>
          I&apos;m a client
        </button>
        <button type="button" onClick={() => setUserType("pro")} className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider ${userType === "pro" ? (isDark ? "bg-white text-[#3D2F2A]" : "bg-[#3D2F2A] text-white") : (isDark ? "bg-white/10 text-white/80" : "bg-white/60 text-[#3D2F2A]")}`}>
          I&apos;m a beauty pro
        </button>
      </div>
      <form action={handleSubmit} className={`flex flex-col sm:flex-row gap-2 p-2 rounded-2xl shadow-lg ${isDark ? "bg-white/10 border border-white/20" : "bg-white"}`}>
        <input type="email" name="email" required placeholder="your@email.com" className={`flex-1 px-4 py-3 outline-none bg-transparent ${isDark ? "text-white placeholder-white/50" : "text-[#2A2521] placeholder-[#B5A89A]"}`} disabled={status === "loading"} />
        <button type="submit" disabled={status === "loading"} className={`px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 ${isDark ? "bg-white text-[#3D2F2A] hover:bg-white/90" : "bg-[#3D2F2A] text-white hover:bg-[#5A4640]"}`}>
          {status === "loading" ? "Joining…" : "Join waitlist"}
        </button>
      </form>
      {status === "error" && <p className={`text-sm mt-3 text-center ${isDark ? "text-rose-200" : "text-[#B8746E]"}`}>{message}</p>}
      <p className={`text-xs mt-3 text-center ${isDark ? "text-white/60" : "text-[#6B5F58]"}`}>
        Be the first to know when we launch in your area.
      </p>
    </div>
  );
}