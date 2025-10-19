// Script to create PNG icons for PWA
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Create a simple colored square with a bullet point
const createIcon = async (size) => {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size/10}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size/3.5}" fill="white" opacity="0.9"/>
      <text
        x="${size/2}"
        y="${size/2 + size/8}"
        font-family="Arial, sans-serif"
        font-size="${size/2.2}"
        fill="#2563eb"
        text-anchor="middle"
        font-weight="bold"
      >•</text>
    </svg>
  `;

  const buffer = Buffer.from(svg);

  await sharp(buffer)
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, `icon-${size}.png`));
};

async function main() {
  try {
    await createIcon(192);
    await createIcon(512);
    console.log('✓ PNG icons created successfully!');

    // Clean up SVG files if they exist
    const svgFiles = ['icon-192.svg', 'icon-512.svg'];
    svgFiles.forEach(file => {
      const filePath = path.join(publicDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    console.log('✓ Temporary SVG files cleaned up');
  } catch (error) {
    console.error('Error creating icons:', error);
    process.exit(1);
  }
}

main();
