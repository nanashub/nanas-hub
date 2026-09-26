import Link from "next/link";
import FeaturedPros from "./FeaturedPros";

const categories = [
  "Braids & twists",
  "Locs",
  "Silk press & natural hair",
  "Wigs & installs",
  "Barbering",
  "Lashes & brows",
  "Makeup",
  "Skin & aesthetics",
  "Nails",
];

const steps = [
  {
    title: "Search near you",
    body: "Filter by location and whether you want a salon or a mobile pro. Every pro has a profile with their work, prices and specialisms.",
  },
  {
    title: "Book with them directly",
    body: "Tap Book now to go straight to the pro's own booking page, like Acuity or Fresha, and pick a time that works for you.",
  },
  {
    title: "Leave a review",
    body: "Share how it went. Honest reviews help the next person find someone they can trust.",
  },
];

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`text-xs uppercase tracking-[0.25em] font-medium mb-3 ${light ? "text-white/70" : "text-[#6B5F58]"}`}>
      {children}
    </p>
  );
}

export function Monogram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden="true">
      <rect x="16" y="4" width="88" height="124" rx="44" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="23" y="11" width="74" height="110" rx="37" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <text x="60" y="80" textAnchor="middle" fontFamily="Georgia, serif" fontSize="34" fill="currentColor">
        NH
      </text>
      <path
        d="M18 140h84M18 140l-8-5 8-5 8 5zM102 140l8-5-8-5-8 5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ServicesSection() {
  return (
    <section id="services" className="py-20 border-b border-[#E8DCD0]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <Eyebrow>Services</Eyebrow>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#2A2521]">Everything, in one place</h2>
          </div>
          <p className="max-w-md text-[#6B5F58] leading-relaxed">
            Specialists in Afro-textured hair, protective styles, barbering and treatments for deeper skin tones. No more
            scrolling Instagram for hours hoping someone is nearby.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c}
              href="/pros"
              className="border border-[#E8DCD0] bg-white/60 rounded-full px-5 py-2.5 text-sm text-[#2A2521] hover:border-[#3D2F2A] hover:bg-white transition"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how" className="py-20 border-b border-[#E8DCD0]">
      <div className="max-w-6xl mx-auto px-6">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#2A2521] mb-10">Booked in three steps</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="border-t border-[#2A2521] pt-5 flex flex-col gap-2">
              <span className="font-serif text-5xl text-[#B8746E] leading-none">{i + 1}</span>
              <h3 className="font-serif text-2xl font-semibold text-[#2A2521]">{s.title}</h3>
              <p className="text-[#6B5F58] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProfilesSection() {
  return (
    <section className="py-20 border-b border-[#E8DCD0]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <Eyebrow>Professionals</Eyebrow>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#2A2521]">Meet the pros</h2>
          </div>
          <Link href="/pros" className="text-sm font-semibold text-[#B8746E] hover:underline">
            Browse all professionals →
          </Link>
        </div>
        <FeaturedPros />
      </div>
    </section>
  );
}

export function PlansSection() {
  return (
    <section id="for-pros" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-[#3D2F2A] text-white rounded-[28px] p-8 md:p-14 grid gap-10 md:grid-cols-2">
          <div>
            <Eyebrow light>For beauty professionals</Eyebrow>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold leading-[1.05]">
              Let new clients find you
            </h2>
            <p className="text-white/80 mt-5 leading-relaxed max-w-md">
              Set up a profile, show off your work, link your booking page and collect reviews. Mainstream booking apps
              weren&apos;t built with you in mind. This one is.
            </p>
            <Link
              href="/signup"
              className="inline-block mt-8 bg-white text-[#3D2F2A] px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-white/90 transition"
            >
              Join as a pro
            </Link>
          </div>
          <div className="grid gap-4 content-start">
            <div className="border border-white/25 rounded-2xl p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-3xl font-semibold">Starter</h3>
                <span className="font-serif text-3xl">Free</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-white/85">
                <li>✦&nbsp;&nbsp;Professional profile and Pro Highlights</li>
                                <li>✦&nbsp;&nbsp;Link to your Acuity, Fresha or Booksy page</li>
                <li>✦&nbsp;&nbsp;Client reviews</li>
              </ul>
            </div>
            <div className="border border-white/50 bg-white/10 rounded-2xl p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-3xl font-semibold">Pro</h3>
                <span className="font-serif text-3xl">
                  £10<span className="font-sans text-sm text-white/70"> /month</span>
                </span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-white/85">
                <li>✦&nbsp;&nbsp;Everything in Starter</li>
                <li>✦&nbsp;&nbsp;Analytics dashboard</li>
                <li>✦&nbsp;&nbsp;Client management tools</li>
                <li>✦&nbsp;&nbsp;Promotions and boosted visibility</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="py-20 border-t border-[#E8DCD0]">
      <div className="max-w-5xl mx-auto px-6 grid gap-8 md:grid-cols-[auto_1fr] items-start">
        <Monogram className="w-20 md:w-28 text-[#B8746E]" />
        <div>
          <Eyebrow>Why Nana&apos;s Hub</Eyebrow>
          <blockquote className="font-serif text-3xl md:text-4xl leading-snug text-[#2A2521]">
            There is a clear struggle for people who look like me to find quality, reliable beauty services nearby. Nana&apos;s
            Hub is here to make sure we are catered for.
          </blockquote>
          <p className="mt-6 text-sm text-[#6B5F58]">
            <span className="font-semibold text-[#2A2521]">Bethany Boatin</span> · Founder
          </p>
        </div>
      </div>
    </section>
  );
}
