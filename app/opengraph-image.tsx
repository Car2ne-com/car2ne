import { ImageResponse } from "next/og";

/*
 * Immagine di anteprima per le condivisioni social (WhatsApp,
 * Telegram, Facebook, X, LinkedIn...). Next la espone come
 * `og:image` per l'intero sito; le pagine che vogliono un'immagine
 * propria (es. la scheda evento) possono definire un loro
 * `opengraph-image` che ha la precedenza.
 *
 * Testo in italiano (locale di default): l'OG image è un asset unico
 * condiviso, non varia per lingua.
 */

export const alt =
  "Car2ne — Trova o offri un passaggio per il tuo prossimo evento";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

const EMERALD = "#059669";
const INK = "#0f172a";
const SLATE = "#475569";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 84,
          backgroundColor: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 12% 14%, rgba(5,150,105,0.14), transparent 42%), radial-gradient(circle at 92% 96%, rgba(5,150,105,0.12), transparent 44%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Lockup del marchio — SVG inline (Satori lo renderizza
            nativamente; un data-URI via <img> qui va in 500). */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg
            width={132}
            height={132}
            viewBox="8 8 84 84"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M74 28 A32 32 0 1 0 74 72"
              fill="none"
              stroke={EMERALD}
              strokeWidth={14}
              strokeLinecap="round"
            />
            <circle cx={74} cy={50} r={9} fill={EMERALD} />
          </svg>
          <span
            style={{
              fontSize: 108,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: INK,
            }}
          >
            ar2ne
          </span>
        </div>

        {/* Claim */}
        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 600,
            lineHeight: 1.25,
            color: INK,
            maxWidth: 900,
          }}
        >
          Trova o offri un passaggio per il tuo prossimo evento.
        </div>

        {/* Riga finale */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 30, fontWeight: 600, color: SLATE }}>
            Concerti · Festival · Spettacoli dal vivo
          </span>
          <span
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: EMERALD,
              letterSpacing: "0.02em",
            }}
          >
            car2ne.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
