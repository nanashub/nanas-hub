export default function Header() {
  return (
    <header className="border-b border-[#E8DCD0] bg-[#FBF8F5]">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="font-serif text-2xl font-semibold text-[#B8746E] tracking-[0.2em]">
          NANA&apos;S HUB
        </div>
        <div className="text-xs uppercase tracking-widest text-[#6B5F58] hidden sm:block">
          Coming soon
        </div>
      </div>
    </header>
  );
}