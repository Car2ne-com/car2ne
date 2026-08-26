// Script una tantum per generare le icone PWA a partire dal mark SVG
// di components/layout/Logo.tsx (arco + pallino), invertito in bianco
// su sfondo emerald-600. Non fa parte della build — va rieseguito a
// mano solo se il logo cambia: `node scripts/generate-icons.mjs`.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const outDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public"
);

const BRAND = "#059669";

// Path/cerchio identici a components/layout/Logo.tsx, nel loro
// viewBox originale "8 8 84 84" (coordinate 8..92, contenuto non
// centrato: si estende soprattutto sulla metà destra).
function markGroup(scale, offsetX, offsetY) {
  return `
    <g transform="translate(${offsetX} ${offsetY}) scale(${scale}) translate(-8 -8)">
      <path
        d="M74 28 A32 32 0 1 0 74 72"
        fill="none"
        stroke="#ffffff"
        stroke-width="14"
        stroke-linecap="round"
      />
      <circle cx="74" cy="50" r="9" fill="#ffffff" />
    </g>
  `;
}

function iconSvg(canvas, contentFraction) {
  const contentSize = canvas * contentFraction;
  const scale = contentSize / 84;
  const margin = (canvas - contentSize) / 2;

  return `
    <svg width="${canvas}" height="${canvas}" viewBox="0 0 ${canvas} ${canvas}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${canvas}" height="${canvas}" fill="${BRAND}" />
      ${markGroup(scale, margin, margin)}
    </svg>
  `;
}

const targets = [
  { file: "icon-192.png", canvas: 192, contentFraction: 0.72 },
  { file: "icon-512.png", canvas: 512, contentFraction: 0.72 },
  // Maskable: OS applica una maschera che può ritagliare fino al
  // ~20% dai bordi, quindi il contenuto resta nella "safe zone"
  // centrale.
  { file: "icon-maskable-512.png", canvas: 512, contentFraction: 0.55 },
];

for (const { file, canvas, contentFraction } of targets) {
  const svg = iconSvg(canvas, contentFraction);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(path.join(outDir, file), png);
  console.log(`Generato ${file}`);
}
