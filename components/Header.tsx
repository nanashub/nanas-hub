"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setLoaded(true);
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="border-b border-[#E8DCD0] bg-[#FBF8F5]">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl sm:text-2xl font-medium text-[#B8746E]"
          style={{ letterSpacing: "0.32em" }}
        >
          NANA&apos;S HUB
        </Link>
        {loaded && (
          <nav className="flex items-center gap-3 sm:gap-4">
            {isLoggedIn ? (
              <Link
                href="/account"
                className="text-xs uppercase tracking-widest text-[#3D2F2A] font-semibold hover:text-[#B8746E] transition"
              >
                My account
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs uppercase tracking-widest text-[#3D2F2A] hover:text-[#B8746E] transition"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="text-xs uppercase tracking-widest bg-[#3D2F2A] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#5A4640] transition"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}