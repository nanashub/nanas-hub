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
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Nana's Hub home">
          <svg
            width="210"
            height="42"
            viewBox="0 0 280 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="13"
              y="36"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="32"
              fontWeight="500"
              fill="#DDB4B0"
              letterSpacing="-2"
            >
              NH
            </text>
            <text
              x="11"
              y="34"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="32"
              fontWeight="500"
              fill="#B8746E"
              letterSpacing="-2"
            >
              NH
            </text>
            <line x1="58" y1="14" x2="58" y2="36" stroke="#B5A89A" strokeWidth="0.8" />
            <text
              x="70"
              y="32"
              fontFamily="Georgia, serif"
              fontSize="13"
              fill="#B8746E"
              letterSpacing="5"
            >
              NANA&apos;S HUB
            </text>
          </svg>
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