/**
 * Скрипт для генерации favicon.ico и apple-touch-icon.png из favicon.svg
 * 
 * Запуск: node scripts/generate-icons.js
 * 
 * Требования: npm install sharp --save-dev
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'favicon.svg');

// SVG содержимое (если файл недоступен)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF385C;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E31C5F;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#grad)"/>
  <text x="50" y="68" font-family="Arial, sans-serif" font-size="50" font-weight="bold" fill="white" text-anchor="middle">T</text>
</svg>`;

async function generateIcons() {
  console.log('🎨 Генерация иконок из favicon.svg...\n');
  
  // Читаем SVG или используем встроенный
  let svg;
  try {
    svg = fs.readFileSync(svgPath);
    console.log('✅ SVG файл найден');
  } catch {
    svg = Buffer.from(svgContent);
    console.log('⚠️  SVG файл не найден, используем встроенный');
  }

  try {
    // Генерируем apple-touch-icon.png (180x180)
    await sharp(svg)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✅ apple-touch-icon.png (180x180) создан');

    // Генерируем favicon-32x32.png
    await sharp(svg)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('✅ favicon-32x32.png создан');

    // Генерируем favicon-16x16.png
    await sharp(svg)
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    console.log('✅ favicon-16x16.png создан');

    // Генерируем favicon.ico (мульти-размерный ICO)
    // Sharp не поддерживает ICO напрямую, создаём 32x32 PNG как fallback
    const favicon32 = await sharp(svg)
      .resize(32, 32)
      .png()
      .toBuffer();
    
    // Создаём простой ICO файл (32x32 PNG в ICO контейнере)
    const icoBuffer = createICO([
      { size: 16, buffer: await sharp(svg).resize(16, 16).png().toBuffer() },
      { size: 32, buffer: favicon32 }
    ]);
    
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('✅ favicon.ico (16x16, 32x32) создан');

    // Генерируем дополнительные размеры для PWA
    await sharp(svg)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✅ icon-192.png создан');

    await sharp(svg)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✅ icon-512.png создан');

    console.log('\n🎉 Все иконки успешно созданы!');
    
  } catch (error) {
    console.error('❌ Ошибка при генерации иконок:', error.message);
    process.exit(1);
  }
}

/**
 * Создаёт ICO файл из PNG буферов
 * Формат ICO: Header + Directory Entries + Image Data
 */
function createICO(images) {
  // ICO Header (6 bytes)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // Reserved
  header.writeUInt16LE(1, 2);      // Type: 1 = ICO
  header.writeUInt16LE(images.length, 4); // Number of images

  // Directory entries (16 bytes each)
  const directoryEntries = [];
  let imageDataOffset = 6 + (16 * images.length);

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 0);  // Width
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 1);  // Height
    entry.writeUInt8(0, 2);                                 // Color palette
    entry.writeUInt8(0, 3);                                 // Reserved
    entry.writeUInt16LE(1, 4);                              // Color planes
    entry.writeUInt16LE(32, 6);                             // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8);              // Size of image data
    entry.writeUInt32LE(imageDataOffset, 12);               // Offset to image data
    
    directoryEntries.push(entry);
    imageDataOffset += img.buffer.length;
  }

  // Combine all parts
  return Buffer.concat([
    header,
    ...directoryEntries,
    ...images.map(img => img.buffer)
  ]);
}

generateIcons();






















