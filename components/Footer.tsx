export default function Footer() {
  return (
    <footer className="border-t border-[#E8DCD0] bg-[#FBF8F5] mt-0">
      <div className="max-w-6xl mx-auto px-6 py-10 text-center">
        <div className="font-serif text-2xl font-semibold text-[#B8746E] tracking-[0.2em] mb-2">
          NANA&apos;S HUB
        </div>
        <p className="text-sm text-[#6B5F58] mb-6">
          The UK&apos;s home for Black beauty professionals.
        </p>
        <p className="text-xs text-[#B5A89A]">
          © {new Date().getFullYear()} Nana&apos;s Hub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}