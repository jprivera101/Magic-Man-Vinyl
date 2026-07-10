// One-off utility: chroma-keys the near-white page background out of the brand
// logo exports so they can be used as transparent PNGs on the site.
import sharp from "sharp";

const LOW = 15; // distance from pure white below which a pixel is fully transparent
const HIGH = 45; // distance above which a pixel is fully opaque

async function removeWhiteBackground(inputPath, outputPath) {
  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dist = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2);
    let alpha;
    if (dist <= LOW) alpha = 0;
    else if (dist >= HIGH) alpha = 255;
    else alpha = Math.round(((dist - LOW) / (HIGH - LOW)) * 255);
    data[i + 3] = Math.min(data[i + 3], alpha);
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  console.log(`wrote ${outputPath}`);
}

await removeWhiteBackground("Logos/Main Logo.png", "public/branding/logo.png");
await removeWhiteBackground("Logos/Icon.png", "public/branding/icon-source.png");
