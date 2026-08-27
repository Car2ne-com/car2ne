type IconProps = {
  className?: string;
};

/**
 * Satispay non ha un'icona nel set open source "Simple Icons" (a
 * differenza di PayPal/Revolut, vedi react-icons/si), quindi qui
 * disegniamo un monogramma "S" a un solo colore (currentColor, come le
 * altre icone brand) invece di tentare di replicare a mano il loro logo
 * proprietario.
 */
export function SatispayMark({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" strokeWidth="1.6" />

      <text
        x="12"
        y="16.3"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        stroke="none"
        fill="currentColor"
      >
        S
      </text>
    </svg>
  );
}
