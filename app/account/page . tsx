"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";

type Profile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: "client" | "pro" | "admin";
};

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
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

  if (!profile) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-200px)] px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-4xl font-semibold text-[#2A2521] mb-2">
            Hi {profile.first_name || "there"}.
          </h1>
          <p className="text-sm text-[#6B5F58] mb-10">
            You&apos;re signed in as{" "}
            <span className="font-semibold text-[#B8746E] uppercase tracking-wider">
              {profile.user_type === "pro" ? "a professional" : "a client"}
            </span>
            .
          </p>

          <div className="bg-white border border-[#E8DCD0] rounded-2xl p-6 mb-6">
            <h2 className="font-serif text-2xl font-semibold text-[#2A2521] mb-4">
              Your account
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs uppercase tracking-wider text-[#6B5F58] mb-1">Name</dt>
                <dd className="text-[#2A2521]">{profile.first_name} {profile.last_name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[#6B5F58] mb-1">Email</dt>
                <dd className="text-[#2A2521]">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[#6B5F58] mb-1">Account type</dt>
                <dd className="text-[#2A2521] capitalize">{profile.user_type}</dd>
              </div>
            </dl>
          </div>

          {profile.user_type === "pro" && (
            <div className="bg-[#F5EDE6] border border-[#DDB4B0] rounded-2xl p-6 mb-6">
              <h3 className="font-serif text-xl font-semibold text-[#2A2521] mb-2">
                Coming next
              </h3>
              <p className="text-sm text-[#3D2F2A]">
                Your pro profile editor and dashboard are next on the build list. You&apos;ll be able to add your services, photos, and pricing, and start receiving booking requests soon.
              </p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="text-sm text-[#B8746E] hover:underline font-semibold"
          >
            Log out
          </button>
        </div>
      </main>
    </>
  );
}