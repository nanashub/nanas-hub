import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-b from-[#F5EDE6] to-[#DDB4B0] py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#6B5F58] mb-6 font-medium">
              Launching summer 2026
            </p>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold text-[#2A2521] leading-[1.05] mb-6">
              Black beauty + barbering, <span className="text-[#B8746E] italic font-medium">all in one place.</span>
            </h1>
            <p className="text-lg text-[#3D2F2A] mb-10 max-w-xl mx-auto leading-relaxed">
              The UK&apos;s home for Black beauty and grooming professionals. Braids, barbering, lashes, brows, skincare — book with someone who gets you.
            </p>
            <WaitlistForm />
          </div>
        </section>

        <section className="py-20 bg-[#3D2F2A] text-white">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-serif text-4xl font-semibold mb-4">Be the first to know.</h2>
            <p className="text-white/80 mb-8 leading-relaxed">
              Join the waitlist and we&apos;ll email you the day we open in your area.
            </p>
            <WaitlistForm theme="dark" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}