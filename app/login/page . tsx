"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="font-serif text-4xl font-semibold text-[#2A2521] mb-2 text-center">
            Welcome back
          </h1>
          <p className="text-sm text-[#6B5F58] mb-8 text-center">
            Log in to your Nana&apos;s Hub account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"
            />

            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"
            />

            {error && (
              <p className="text-sm text-[#B8746E] text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3D2F2A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#5A4640] transition disabled:opacity-50"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="text-sm text-[#6B5F58] mt-6 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#B8746E] hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
