// One-off generator for PWA / touch icons.
// Uses walky's own mascot (extracted from public/walky-logo.svg) on a white
// rounded field, matching the logo. Run: node scripts/gen-icons.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public");

// Render the logo large, then crop + trim to just the mascot (left square).
const logo = readFileSync(join(outDir, "walky-logo.svg"));
const logoPng = await sharp(logo, { density: 2400 }).resize({ width: 2050 }).png().toBuffer(); // 2050x550
const mascot = await sharp(logoPng)
  .extract({ left: 6, top: 36, width: 496, height: 496 })
  .toBuffer();

async function iconBuffer(size, { maskable = false } = {}) {
  const inner = Math.round(size * (maskable ? 0.64 : 0.78)); // mascot box
  const m = await sharp(mascot).resize({ height: inner, fit: "inside" }).toBuffer();
  const meta = await sharp(m).metadata();
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
       <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#ffffff"/>
     </svg>`
  );
  return sharp(bg)
    .composite([{ input: m, top: Math.round((size - (meta.height ?? inner)) / 2), left: Math.round((size - (meta.width ?? inner)) / 2) }])
    .png()
    .toBuffer();
}

const jobs = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-maskable-512.png", size: 512, maskable: true },
  { file: "apple-touch-icon.png", size: 180 },
];

for (const job of jobs) {
  const buf = await iconBuffer(job.size, { maskable: job.maskable });
  await sharp(buf).toFile(join(outDir, job.file));
  console.log("wrote", job.file);
}
