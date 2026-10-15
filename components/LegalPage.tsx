import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const CONTACT_EMAIL = "hello@nanashub.co.uk";

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: React.ReactNode;
  sections: { id: string; heading: string; body: React.ReactNode }[];
}) {
  return (
    <>
      <Header />
      <main className="px-6 py-14">
        <article className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-[#6B5F58] mb-3">Last updated {updated}</p>
          <h1 className="font-serif text-5xl font-semibold text-[#2A2521] mb-6 leading-tight">{title}</h1>
          <div className="legal-body text-[#3D2F2A] leading-relaxed space-y-4 mb-10">{intro}</div>

          <nav aria-label="Contents" className="bg-white border border-[#E8DCD0] rounded-2xl p-5 mb-12">
            <p className="text-xs uppercase tracking-widest text-[#B8746E] font-semibold mb-3">Contents</p>
            <ol className="grid gap-1.5 text-sm list-decimal list-inside text-[#3D2F2A]">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:text-[#B8746E] hover:underline">{s.heading}</a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="space-y-10">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-6">
                <h2 className="font-serif text-2xl font-semibold text-[#2A2521] mb-3">
                  {i + 1}. {s.heading}
                </h2>
                <div className="legal-body text-[#3D2F2A] leading-relaxed space-y-3">{s.body}</div>
              </section>
            ))}
          </div>

          <p className="mt-14 pt-6 border-t border-[#E8DCD0] text-sm text-[#6B5F58]">
            Questions? Email <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#B8746E] font-semibold hover:underline">{CONTACT_EMAIL}</a>.
            {" "}See also our <Link href="/privacy" className="text-[#B8746E] hover:underline">Privacy Policy</Link> and{" "}
            <Link href="/terms" className="text-[#B8746E] hover:underline">Terms of Use</Link>.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
