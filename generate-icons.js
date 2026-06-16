/**
 * Generate PWA icons from SVG source
 * Run: npm install sharp && node generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SVG_SOURCE = path.join(__dirname, 'public/schooldiary-icon.svg');
const ICONS_DIR = path.join(__dirname, 'public/icons');

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Convert SVG to PNG for each size
async function generateIcons() {
  console.log('🎨 Generating PWA icons from SVG...\n');

  try {
    for (const size of SIZES) {
      const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);

      await sharp(SVG_SOURCE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated icon-${size}x${size}.png`);
    }

    console.log('\n🎉 All icons generated successfully!');
    console.log('📦 Icons are ready for PWA installation.');
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();
