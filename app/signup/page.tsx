"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<"client" | "pro">("client");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (signUpData.user) {
      await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          user_type: userType,
        })
        .eq("id", signUpData.user.id);
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
            Create your account
          </h1>
          <p className="text-sm text-[#6B5F58] mb-8 text-center">
            Join Nana&apos;s Hub — for clients and pros.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUserType("client")}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition ${
                  userType === "client"
                    ? "bg-[#3D2F2A] text-white"
                    : "bg-white/60 text-[#3D2F2A] border border-[#E8DCD0]"
                }`}
              >
                I&apos;m a client
              </button>
              <button
                type="button"
                onClick={() => setUserType("pro")}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition ${
                  userType === "pro"
                    ? "bg-[#3D2F2A] text-white"
                    : "bg-white/60 text-[#3D2F2A] border border-[#E8DCD0]"
                }`}
              >
                I&apos;m a pro
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"
              />
              <input
                type="text"
                required
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white border border-[#E8DCD0] outline-none focus:border-[#B8746E] text-[#2A2521]"
              />
            </div>

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
              minLength={6}
              placeholder="Password (min 6 characters)"
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
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-sm text-[#6B5F58] mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-[#B8746E] hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}