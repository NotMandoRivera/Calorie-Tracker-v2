const sharp = require("sharp");
const path = require("path");

const BG_COLOR = "#E8C7C8";
const SIZES = [192, 512];
const SOURCE = path.join(__dirname, "icon-source.png");
const PADDING = 0.12; // 12% padding around the calculator

async function main() {
  const meta = await sharp(SOURCE).metadata();
  const w = meta.width || 512;
  const h = meta.height || 512;

  for (const size of SIZES) {
    const padding = Math.round(size * PADDING);
    const maxIcon = size - 2 * padding;
    const scale = Math.min(maxIcon / w, maxIcon / h, 1);
    const iconW = Math.round(w * scale);
    const iconH = Math.round(h * scale);
    const left = Math.round((size - iconW) / 2);
    const top = Math.round((size - iconH) / 2);

    const resized = await sharp(SOURCE)
      .resize(iconW, iconH)
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BG_COLOR,
      },
    })
      .composite([{ input: resized, left, top }])
      .png()
      .toFile(path.join(__dirname, `icon-${size}.png`));

    console.log(`Created icon-${size}.png`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
