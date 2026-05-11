// TextFlow icon generator — creates 16px, 48px, 128px PNG icons
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.resolve(__dirname, '../extension/icons');

async function generate() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="96" fill="#1a1a2e"/>
    <text x="256" y="340" font-family="Arial,Helvetica,sans-serif" font-size="320" font-weight="bold"
          fill="#00e5cc" text-anchor="middle">TF</text>
  </svg>`;

  const svgBuffer = Buffer.from(svg);

  await sharp(svgBuffer).resize(16, 16).png().toFile(path.join(iconsDir, 'icon16.png'));
  console.log('✓ icon16.png (16x16)');

  await sharp(svgBuffer).resize(48, 48).png().toFile(path.join(iconsDir, 'icon48.png'));
  console.log('✓ icon48.png (48x48)');

  await sharp(svgBuffer).resize(128, 128).png().toFile(path.join(iconsDir, 'icon128.png'));
  console.log('✓ icon128.png (128x128)');

  console.log('\nIcons generated in extension/icons/');
}

generate().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
