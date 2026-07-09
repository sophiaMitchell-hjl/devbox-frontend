// 从 public/favicon.svg 生成多格式站点图标(Google 对 .ico/.png 比 SVG 更稳)。
// 产物:favicon.ico(16/32/48 多尺寸)、favicon-96x96.png、apple-touch-icon.png(180)。
// 运行:node scripts/gen-favicon.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = (f) => resolve(__dirname, '../public', f);

const svg = await readFile(pub('favicon.svg'));
const png = (size) => sharp(svg, { density: 384 }).resize(size, size, { fit: 'contain' }).png().toBuffer();

// 把若干 PNG buffer 打包成一个 .ico(ICO = PNG 容器,现代浏览器/Google 均支持)。
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  const blobs = [];
  let offset = 6 + images.length * 16;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 = 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2);                      // palette
    e.writeUInt8(0, 3);                      // reserved
    e.writeUInt16LE(1, 4);                   // color planes
    e.writeUInt16LE(32, 6);                  // bits per pixel
    e.writeUInt32LE(data.length, 8);         // size of PNG data
    e.writeUInt32LE(offset, 12);             // offset
    entries.push(e);
    blobs.push(data);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...blobs]);
}

// favicon.ico —— 16/32/48
const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(icoSizes.map(async (size) => ({ size, data: await png(size) })));
await writeFile(pub('favicon.ico'), buildIco(icoImages));
console.log('✓ favicon.ico (16/32/48)');

// favicon-96x96.png —— Google 偏好 48 的倍数
await writeFile(pub('favicon-96x96.png'), await png(96));
console.log('✓ favicon-96x96.png');

// apple-touch-icon.png —— iOS 添加到主屏(180×180,通常带底色)
await writeFile(pub('apple-touch-icon.png'), await png(180));
console.log('✓ apple-touch-icon.png');

console.log('完成。已写入 public/。');
