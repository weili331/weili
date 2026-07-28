// 使用 sharp 从 SVG 渲染 weili App 图标
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function makeSvg(size) {
  // 计算文字大小：让 "We" 占背景的 55% 宽度
  const fontSize = Math.round(size * 0.42);
  const radius = Math.round(size * 0.22);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#FFF383"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial Black, Arial, Helvetica, sans-serif"
        font-weight="900"
        font-size="${fontSize}"
        fill="white">We</text>
</svg>`;
}

const outputDir = path.join(__dirname, 'public');
const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32.png' },
];

(async () => {
  for (const { size, name } of sizes) {
    const svg = Buffer.from(makeSvg(size));
    await sharp(svg)
      .png({ compressionLevel: 9 })
      .toFile(path.join(outputDir, name));
    console.log(`Generated ${name}`);
  }
  console.log('All icons generated successfully!');
})().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
