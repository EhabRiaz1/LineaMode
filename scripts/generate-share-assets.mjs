import { mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wordmarkPath = join(root, "public/brand/lineamode-wordmark.png");

const STONE = "#E1E1DC";
const INK = "#201C1D";

async function ensureParent(path) {
  await mkdir(dirname(path), { recursive: true });
}

async function createOgImage() {
  const width = 800;
  const height = 418;
  const outputPath = join(root, "public/brand/og-default.jpg");
  const wordmark = await sharp(wordmarkPath)
    .resize({ width: 560, withoutEnlargement: true })
    .png()
    .toBuffer();
  const wordmarkMeta = await sharp(wordmark).metadata();
  const wordmarkTop = Math.round((height - (wordmarkMeta.height ?? 0)) * 0.34);
  const wordmarkLeft = Math.round((width - (wordmarkMeta.width ?? 0)) / 2);
  const frame = Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${STONE}"/>
      <text x="50%" y="78%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="16" letter-spacing="0.28em" fill="${INK}" opacity="0.62">FROM IDEA TO EXECUTION</text>
      <text x="50%" y="88%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="${INK}" opacity="0.45">www.lineamode.com</text>
    </svg>`,
  );

  await ensureParent(outputPath);
  await sharp(frame)
    .composite([{ input: wordmark, top: wordmarkTop, left: wordmarkLeft }])
    .jpeg({
      quality: 58,
      mozjpeg: true,
      progressive: false,
      chromaSubsampling: "4:2:0",
    })
    .toFile(outputPath);

  const { size } = await stat(outputPath);
  const aspectRatio = width / height;
  if (size > 600 * 1024) {
    throw new Error(`og-default.jpg is ${size} bytes; WhatsApp requires <= 600KB`);
  }
  if (width < 300 || aspectRatio > 4) {
    throw new Error(`og-default.jpg is ${width}x${height}; WhatsApp requires width >= 300px and aspect ratio <= 4:1`);
  }
}

async function createSquareLogo() {
  const size = 512;
  const outputPath = join(root, "public/brand/logo-square.png");
  const wordmark = await sharp(wordmarkPath)
    .resize({ width: 420, withoutEnlargement: true })
    .png()
    .toBuffer();
  const wordmarkMeta = await sharp(wordmark).metadata();
  const top = Math.round((size - (wordmarkMeta.height ?? 0)) / 2);
  const left = Math.round((size - (wordmarkMeta.width ?? 0)) / 2);
  const frame = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${STONE}"/>
    </svg>`,
  );

  await ensureParent(outputPath);
  await sharp(frame)
    .composite([{ input: wordmark, top, left }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

async function createAppleIcon() {
  const size = 180;
  const outputPath = join(root, "app/apple-icon.png");
  const svg = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${INK}"/>
      <text x="50%" y="58%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="56" fill="${STONE}">LM</text>
    </svg>`,
  );

  await ensureParent(outputPath);
  await sharp(svg).png().toFile(outputPath);
}

await createOgImage();
await createSquareLogo();
await createAppleIcon();

console.log("Generated share assets in public/brand and app/");
