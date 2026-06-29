import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wordmarkPath = join(root, "public/brand/lineamode-wordmark.png");
const squarePath = join(root, "public/brand/logo-square.png");

const STONE = "#E1E1DC";
const INK = "#201C1D";

async function ensureParent(path) {
  await mkdir(dirname(path), { recursive: true });
}

/**
 * Nav/footer wordmark on stone — matches BrandLogo `brightness-0` on light surfaces.
 * The source PNG is bi-tonal; flattening to black keeps LINEA + MODE legible at small sizes.
 */
async function buildWordmarkOnStoneSquare(size) {
  const padding = Math.round(size * 0.1);
  const maxW = size - padding * 2;
  const maxH = size - padding * 2;

  const { data, info } = await sharp(wordmarkPath)
    .resize({ width: maxW, height: maxH, fit: "inside", withoutEnlargement: false })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
    }
  }

  const wordmarkBlack = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const top = Math.round((size - info.height) / 2);
  const left = Math.round((size - info.width) / 2);
  const frame = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${STONE}"/>
    </svg>`,
  );

  return sharp(frame)
    .composite([{ input: wordmarkBlack, top, left }])
    .png()
    .toBuffer();
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

  await ensureParent(outputPath);
  await sharp(await buildWordmarkOnStoneSquare(size))
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

/** 1200×630 JPEG from square logo — reliable for WhatsApp / Facebook crawlers. */
async function createOgSocialJpeg() {
  const width = 1200;
  const height = 630;
  const outputPath = join(root, "public/brand/og-social.jpg");
  const logo = await sharp(squarePath)
    .resize({
      width: Math.round(width * 0.72),
      height: Math.round(height * 0.72),
      fit: "inside",
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const top = Math.round((height - (logoMeta.height ?? 0)) / 2);
  const left = Math.round((width - (logoMeta.width ?? 0)) / 2);
  const frame = Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${STONE}"/>
    </svg>`,
  );

  await ensureParent(outputPath);
  await sharp(frame)
    .composite([{ input: logo, top, left }])
    .jpeg({
      quality: 82,
      mozjpeg: true,
      progressive: false,
      chromaSubsampling: "4:2:0",
    })
    .toFile(outputPath);

  const { size } = await stat(outputPath);
  if (size > 600 * 1024) {
    throw new Error(`og-social.jpg is ${size} bytes; must be <= 600KB`);
  }
}

/** Tab favicon — nav wordmark (`lineamode-wordmark.png`) on stone. */
async function createPublicFaviconAssets() {
  const faviconIcoPath = join(root, "public/favicon.ico");
  const iconPngPath = join(root, "public/icon.png");
  const sizes = [16, 32, 48];

  const pngBuffers = await Promise.all(
    sizes.map((size) => buildWordmarkOnStoneSquare(size)),
  );

  await writeFile(faviconIcoPath, await toIco(pngBuffers));

  await sharp(pngBuffers[1])
    .png({ compressionLevel: 9 })
    .toFile(iconPngPath);
}

/** iOS home-screen icon — same nav wordmark treatment as the favicon. */
async function createPublicAppleTouchIcon() {
  const size = 180;
  const outputPath = join(root, "public/apple-touch-icon.png");

  await ensureParent(outputPath);
  await sharp(await buildWordmarkOnStoneSquare(size))
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

await createOgImage();
await createSquareLogo();
await createOgSocialJpeg();
await createPublicFaviconAssets();
await createPublicAppleTouchIcon();

console.log(
  "Generated share assets in public/brand, public/favicon.ico, public/icon.png, and public/apple-touch-icon.png",
);
