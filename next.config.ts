import type { NextConfig } from "next";

/*
 * Il browser parla direttamente con Supabase (REST, Auth, Realtime via
 * WebSocket) da client component: serve in connect-src. Le immagini remote
 * (themusicuniverse/supabase storage/ticketmaster) passano invece sempre
 * dal proxy same-origin di next/image, quindi non servono in img-src.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseOrigin = supabaseUrl.replace(/\/$/, "");
const supabaseWsOrigin = supabaseOrigin.replace(/^https:/, "wss:");

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  // Next.js inietta il payload RSC/hydration inline nell'HTML: senza
  // plumbing per i nonce servirebbe 'unsafe-inline'. Approccio più
  // permissivo di una CSP a nonce, ma comunque copre il resto (connect,
  // frame, object).
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWsOrigin}`,
  "worker-src 'self'",
  "manifest-src 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "themusicuniverse.com",
      },
      {
        protocol: "https",
        hostname: "mtqqvkbpulvbxjtezcqy.supabase.co",
      },
      {
        protocol: "https",
        hostname: "s1.ticketm.net",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          /*
           * Report-Only per ora: raccoglie violazioni (visibili in
           * console) senza bloccare nulla, finché non verifichiamo che
           * non spezzi realtime/upload/immagini in produzione. Va
           * promossa a Content-Security-Policy quando confermata pulita.
           */
          { key: "Content-Security-Policy-Report-Only", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;