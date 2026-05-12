const path = require('path');
const fs = require('fs');
const sharp = require(path.resolve(__dirname, '..', 'backend', 'node_modules', 'sharp'));

const BG = '#0f0f1a';
const ACCENT = '#00e5cc';
const SECONDARY = '#a0a0b0';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'extension', 'store-assets');

const IMAGES = [
  { file: 'screenshot-1.png', width: 1280, height: 800, text: 'Seleção de texto com botão flutuante' },
  { file: 'screenshot-2.png', width: 1280, height: 800, text: 'Menu de ações (Reescrever, Resumir, etc.)' },
  { file: 'screenshot-3.png', width: 1280, height: 800, text: 'Resultado inline após processamento com IA' },
  { file: 'screenshot-4.png', width: 1280, height: 800, text: 'Popup de login e dashboard do usuário' },
  { file: 'screenshot-5.png', width: 1280, height: 800, text: 'Planos e upgrade (Grátis / Pro / Pro+)' },
  { file: 'promo-tile.png', width: 440, height: 280, text: 'TextFlow', subtitle: 'Assistente de IA para texto', isPromo: true },
  { file: 'marquee.png', width: 1400, height: 560, text: 'TextFlow', subtitle: 'Assistente de IA para texto', tagline: 'Selecione. Transforme. Continue.', isMarquee: true },
];

function buildSvg(width, height, text, subtitle, tagline, isPromo, isMarquee) {
  const fontSize = isPromo
    ? Math.min(width, height) * 0.12
    : isMarquee
      ? Math.min(width, height) * 0.14
      : Math.min(width, height) * 0.05;

  const subFontSize = isPromo ? 13 : isMarquee ? 22 : 14;

  const textY = isPromo || isMarquee ? '45%' : '50%';
  const subY = isPromo ? '62%' : isMarquee ? '58%' : (height - 20);
  const subColor = subtitle === 'Assistente de IA para texto' ? ACCENT : SECONDARY;

  let extraElements = '';
  if (isMarquee && tagline) {
    extraElements = `<text x="50%" y="${height - 40}" text-anchor="middle" fill="${SECONDARY}" font-family="system-ui, sans-serif" font-size="16px">${tagline}</text>`;
  }

  const subtitleColor = isPromo || isMarquee ? subColor : SECONDARY;

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${BG}"/>
      <rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="none" stroke="${ACCENT}" stroke-width="2" rx="8"/>
      <text x="50%" y="${textY}" text-anchor="middle" dy=".3em" fill="${ACCENT}" font-family="system-ui, sans-serif" font-size="${fontSize}px" font-weight="bold">${text}</text>
      <text x="50%" y="${subY}" text-anchor="middle" fill="${subtitleColor}" font-family="system-ui, sans-serif" font-size="${subFontSize}px">${subtitle || '[Placeholder — substituir por screenshot real]'}</text>
      ${extraElements}
    </svg>
  `;
}

async function generateImage({ file, width, height, text, subtitle, tagline, isPromo, isMarquee }) {
  const outputPath = path.join(OUTPUT_DIR, file);
  const svg = buildSvg(width, height, text, subtitle, tagline, isPromo, isMarquee);
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`  ✓ ${file}`);
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Criado diretório: ${OUTPUT_DIR}`);
  }

  console.log(`\nGerando ${IMAGES.length} imagens para Chrome Web Store...\n`);

  await Promise.all(IMAGES.map(generateImage));

  console.log(`\n✓ Todas as ${IMAGES.length} imagens geradas em ${OUTPUT_DIR}\n`);
}

main().catch((err) => {
  console.error('Erro ao gerar imagens:', err);
  process.exit(1);
});
