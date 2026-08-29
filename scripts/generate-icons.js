import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Base regular SVG (Full bleed icon with rounded corners & shadow)
const regularSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E7B3D" />
      <stop offset="50%" stop-color="#176B35" />
      <stop offset="100%" stop-color="#0E4822" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE57F" />
      <stop offset="50%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#AA820A" />
    </linearGradient>
    <linearGradient id="pageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F3EFE0" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Background rounded rect -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Subtle Islamic Geometric Ring -->
  <circle cx="256" cy="256" r="210" stroke="url(#goldGrad)" stroke-width="3" stroke-dasharray="8 8" opacity="0.4" />
  <circle cx="256" cy="256" r="198" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.3" />

  <!-- Main Center Group with Drop Shadow -->
  <g filter="url(#shadow)">
    <!-- Quran Book Stand / Rehal Base -->
    <path d="M160 380 L256 330 L352 380 L320 400 L256 365 L192 400 Z" fill="url(#goldGrad)" />
    
    <!-- Open Quran Pages Left -->
    <path d="M252 145 C210 142 140 156 100 178 C92 182 88 190 88 200 L88 320 C88 328 94 335 102 332 C142 312 210 300 252 305 Z" fill="url(#pageGrad)" />
    
    <!-- Open Quran Pages Right -->
    <path d="M260 145 C302 142 372 156 412 178 C420 182 424 190 424 200 L424 320 C424 328 418 335 410 332 C370 312 302 300 260 305 Z" fill="url(#pageGrad)" />
    
    <!-- Quran Spine & Ribbon Bookmark -->
    <path d="M250 140 L262 140 L262 315 L250 315 Z" fill="#8D1B1B" />
    <path d="M256 310 L256 370 L248 360 L240 370 L240 310 Z" fill="#C62828" />

    <!-- Quran Gilded Border on Left Page -->
    <path d="M120 195 C150 180 205 170 240 172 L240 285 C205 282 150 292 120 308 Z" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" />
    
    <!-- Quran Gilded Border on Right Page -->
    <path d="M392 195 C362 180 307 170 272 172 L272 285 C307 282 362 292 392 308 Z" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" />

    <!-- Quranic Calligraphic Text Lines Representation -->
    <path d="M140 210 Q180 200 224 202 M140 230 Q180 220 224 222 M140 250 Q180 240 224 242 M140 270 Q180 260 224 262" stroke="#2E7D32" stroke-width="3.5" stroke-linecap="round" opacity="0.75" />
    <path d="M288 202 Q332 200 372 210 M288 222 Q332 220 372 230 M288 242 Q332 240 372 250 M288 262 Q332 260 372 270" stroke="#2E7D32" stroke-width="3.5" stroke-linecap="round" opacity="0.75" />

    <!-- Golden Surah Medallion / Center Emblem -->
    <circle cx="256" cy="115" r="38" fill="url(#goldGrad)" />
    <circle cx="256" cy="115" r="32" fill="#176B35" stroke="#FFE57F" stroke-width="2" />
    
    <!-- Star of David / 8-pointed Islamic Star in medallion -->
    <g transform="translate(256, 115) scale(0.65)">
      <rect x="-16" y="-16" width="32" height="32" fill="url(#goldGrad)" />
      <rect x="-16" y="-16" width="32" height="32" fill="url(#goldGrad)" transform="rotate(45)" />
      <circle cx="0" cy="0" r="8" fill="#176B35" />
    </g>
  </g>
</svg>
`;

// 2. Maskable SVG: Full-bleed background with artwork scaled inside the 80% safe zone (center diameter <= 410px out of 512px)
const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="maskBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E7B3D" />
      <stop offset="50%" stop-color="#176B35" />
      <stop offset="100%" stop-color="#0E4822" />
    </linearGradient>
    <linearGradient id="maskGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE57F" />
      <stop offset="50%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#AA820A" />
    </linearGradient>
    <linearGradient id="maskPageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F3EFE0" />
    </linearGradient>
    <filter id="maskShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Solid full-bleed background for maskable adaptive clipping -->
  <rect width="512" height="512" fill="url(#maskBgGrad)" />

  <!-- Decorative geometric border within safe area -->
  <circle cx="256" cy="256" r="185" stroke="url(#maskGoldGrad)" stroke-width="2.5" stroke-dasharray="6 6" opacity="0.35" />

  <!-- Center Group scaled down to 0.78 and centered at (256, 256) -->
  <g transform="translate(256, 256) scale(0.78) translate(-256, -256)" filter="url(#maskShadow)">
    <!-- Quran Book Stand Base -->
    <path d="M160 380 L256 330 L352 380 L320 400 L256 365 L192 400 Z" fill="url(#maskGoldGrad)" />
    
    <!-- Open Quran Pages Left -->
    <path d="M252 145 C210 142 140 156 100 178 C92 182 88 190 88 200 L88 320 C88 328 94 335 102 332 C142 312 210 300 252 305 Z" fill="url(#maskPageGrad)" />
    
    <!-- Open Quran Pages Right -->
    <path d="M260 145 C302 142 372 156 412 178 C420 182 424 190 424 200 L424 320 C424 328 418 335 410 332 C370 312 302 300 260 305 Z" fill="url(#maskPageGrad)" />
    
    <!-- Quran Spine & Ribbon -->
    <path d="M250 140 L262 140 L262 315 L250 315 Z" fill="#8D1B1B" />
    <path d="M256 310 L256 370 L248 360 L240 370 L240 310 Z" fill="#C62828" />

    <!-- Quran Gilded Border Left -->
    <path d="M120 195 C150 180 205 170 240 172 L240 285 C205 282 150 292 120 308 Z" fill="none" stroke="url(#maskGoldGrad)" stroke-width="2.5" />
    
    <!-- Quran Gilded Border Right -->
    <path d="M392 195 C362 180 307 170 272 172 L272 285 C307 282 362 292 392 308 Z" fill="none" stroke="url(#maskGoldGrad)" stroke-width="2.5" />

    <!-- Quranic Calligraphic Text Lines -->
    <path d="M140 210 Q180 200 224 202 M140 230 Q180 220 224 222 M140 250 Q180 240 224 242 M140 270 Q180 260 224 262" stroke="#2E7D32" stroke-width="3.5" stroke-linecap="round" opacity="0.75" />
    <path d="M288 202 Q332 200 372 210 M288 222 Q332 220 372 230 M288 242 Q332 240 372 250 M288 262 Q332 260 372 270" stroke="#2E7D32" stroke-width="3.5" stroke-linecap="round" opacity="0.75" />

    <!-- Golden Surah Medallion -->
    <circle cx="256" cy="115" r="38" fill="url(#maskGoldGrad)" />
    <circle cx="256" cy="115" r="32" fill="#176B35" stroke="#FFE57F" stroke-width="2" />
    
    <g transform="translate(256, 115) scale(0.65)">
      <rect x="-16" y="-16" width="32" height="32" fill="url(#maskGoldGrad)" />
      <rect x="-16" y="-16" width="32" height="32" fill="url(#maskGoldGrad)" transform="rotate(45)" />
      <circle cx="0" cy="0" r="8" fill="#176B35" />
    </g>
  </g>
</svg>
`;

async function generate() {
  console.log('Generating PNG icons...');

  // Save SVG favicon
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), regularSvg);

  // 1. pwa-192x192.png
  await sharp(Buffer.from(regularSvg))
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 2. pwa-512x512.png
  await sharp(Buffer.from(regularSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 3. pwa-maskable-192x192.png
  await sharp(Buffer.from(maskableSvg))
    .resize(192, 192)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-192x192.png'));

  // 4. pwa-maskable-512x512.png
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // 5. apple-touch-icon.png
  await sharp(Buffer.from(regularSvg))
    .resize(180, 180)
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 6. favicon.ico (64x64 PNG format commonly accepted as ico or saved directly)
  await sharp(Buffer.from(regularSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Successfully generated all PWA icons in /public!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
