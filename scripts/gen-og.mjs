// Generates the social-preview (Open Graph) image: public/og/default.jpg (1200x630).
// Orange brand field + walky wordmark + tagline + walky's own walk illustration.
// Run: node scripts/gen-og.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "og");
mkdirSync(outDir, { recursive: true });

const W = 1200, H = 630;
const BRAND = "#fa9b27", DARK = "#0e0f1e";

const bg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffb24d"/>
      <stop offset="1" stop-color="${BRAND}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <!-- white paw watermark -->
  <g fill="#ffffff" opacity="0.12" transform="translate(980 470) scale(1.1)">
    <ellipse cx="0" cy="40" rx="70" ry="58"/>
    <circle cx="-66" cy="-20" r="30"/><circle cx="-28" cy="-56" r="31"/>
    <circle cx="28" cy="-56" r="31"/><circle cx="66" cy="-20" r="30"/>
  </g>
  <text x="90" y="250" font-family="Helvetica, Arial, sans-serif" font-size="140" font-weight="800" fill="#ffffff">walky</text>
  <text x="92" y="330" font-family="Helvetica, Arial, sans-serif" font-size="46" font-weight="700" fill="${DARK}">Выгул, няня и передержка собак</text>
  <text x="92" y="392" font-family="Helvetica, Arial, sans-serif" font-size="46" font-weight="700" fill="${DARK}">в Ростове-на-Дону</text>
  <text x="92" y="470" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="600" fill="#ffffff">Проверенные выгульщики · фотоотчёт · от 199 ₽</text>
  <text x="92" y="560" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="#ffffff">walky.su</text>
</svg>`);

const illo = await sharp(join(root, "public", "illustrations", "svc-walk.png"))
  .resize({ height: 430 })
  .toBuffer();
const illoMeta = await sharp(illo).metadata();

await sharp(bg)
  .composite([{ input: illo, top: H - (illoMeta.height ?? 430) - 20, left: W - (illoMeta.width ?? 430) - 40 }])
  .jpeg({ quality: 88 })
  .toFile(join(outDir, "default.jpg"));

console.log("wrote public/og/default.jpg");
