import Image from "next/image";

export default function HeroIllustration() {
  return (
    <div className="relative flex h-full items-center justify-center lg:translate-x-10 lg:translate-y-6">

      {/* Glow */}
      <div className="absolute h-[720px] w-[720px] rounded-full bg-emerald-300/20 blur-[110px]" />

      <Image
        src="/images/hero.png"
        alt="Car2ne Hero"
        width={1400}
        height={900}
        priority
        sizes="(min-width: 1024px) 650px, 100vw"
        className="
          relative
          z-10
          w-full
          max-w-[1250px]
          object-contain
          transition-all
          duration-500
          hover:scale-[1.02]
          drop-shadow-[0_45px_90px_rgba(16,185,129,.20)]
        "
      />

    </div>
  );
}