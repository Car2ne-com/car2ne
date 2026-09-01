import Image from "next/image";

export default function HeroIllustration() {
  return (
    <div className="relative hidden items-center justify-center lg:flex">
      {/* Glow */}
      <div className="absolute h-[520px] w-[520px] rounded-full bg-primary/15 blur-[110px]" />

      <Image
        src="/images/hero.webp"
        alt="Car2ne Hero"
        width={1536}
        height={1024}
        priority
        sizes="(min-width: 1024px) 620px, 100vw"
        className="relative z-10 w-full max-w-[620px] object-contain drop-shadow-[0_40px_80px_rgba(16,185,129,0.18)] transition duration-500 hover:scale-[1.02]"
      />
    </div>
  );
}
