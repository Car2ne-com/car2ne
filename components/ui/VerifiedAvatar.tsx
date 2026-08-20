import Image from "next/image";

import { BadgeCheck } from "lucide-react";

type Size = "sm" | "lg";

type Props = {
  src: string | null;
  alt: string;
  initials: string;
  isVerified: boolean;
  verifiedLabel: string;
  size?: Size;
};

const SIZE_CONFIG: Record<
  Size,
  {
    px: number;
    box: string;
    text: string;
    badgeBox: string;
    badgeIcon: string;
    ring: string;
  }
> = {
  sm: {
    px: 56,
    box: "h-14 w-14",
    text: "text-lg",
    badgeBox: "h-5 w-5",
    badgeIcon: "h-3.5 w-3.5",
    ring: "ring-2",
  },
  lg: {
    px: 112,
    box: "h-28 w-28",
    text: "text-3xl",
    badgeBox: "h-9 w-9",
    badgeIcon: "h-5 w-5",
    ring: "ring-4",
  },
};

/*
 * Avatar con "verified ring" (cornice verde piena) + spunta
 * sovrapposta in basso a destra quando il conducente è verificato.
 * Componente condiviso cosi' il trattamento resta identico ovunque
 * appaia un avatar (ride card, profilo pubblico, ...), non solo dove
 * e' stato aggiunto per primo.
 */
export default function VerifiedAvatar({
  src,
  alt,
  initials,
  isVerified,
  verifiedLabel,
  size = "sm",
}: Props) {
  const config = SIZE_CONFIG[size];

  const ringClass = isVerified
    ? `${config.ring} ring-primary`
    : `${config.ring} ring-accent`;

  return (
    <div className="relative shrink-0">
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={config.px}
          height={config.px}
          className={`${config.box} rounded-full object-cover ${ringClass}`}
        />
      ) : (
        <div
          className={`flex ${config.box} items-center justify-center rounded-full bg-accent font-black text-accent-foreground ${config.text} ${
            isVerified ? ringClass : ""
          }`}
        >
          {initials}
        </div>
      )}

      {isVerified && (
        <span
          title={verifiedLabel}
          aria-label={verifiedLabel}
          className={`absolute -bottom-0.5 -right-0.5 flex ${config.badgeBox} items-center justify-center rounded-full bg-primary ring-2 ring-background`}
        >
          <BadgeCheck className={`${config.badgeIcon} text-primary-foreground`} />
        </span>
      )}
    </div>
  );
}
