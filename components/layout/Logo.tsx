import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-0.5 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
    >
      <svg
        viewBox="8 8 84 84"
        className="h-[1.3em] w-[1.3em]"
        role="img"
        aria-label="Car2ne"
      >
        <path
          d="M74 28 A32 32 0 1 0 74 72"
          fill="none"
          stroke="#059669"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <circle cx="74" cy="50" r="9" fill="#059669" />
      </svg>

      <span>ar2ne</span>
    </Link>
  );
}
