const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const combined = Buffer.concat([t, data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(combined));
  return Buffer.concat([len, t, data, c]);
}

function makePNG(w, h, r, g, b, a = 255) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0); ihdrData.writeUInt32BE(h, 4);
  ihdrData[8] = 8; ihdrData[9] = 6; // RGBA
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0;
    for (let x = 0; x < w; x++) {
      const o = y * (1 + w * 4) + 1 + x * 4;
      raw[o] = r; raw[o+1] = g; raw[o+2] = b; raw[o+3] = a;
    }
  }
  return Buffer.concat([sig, chunk('IHDR', ihdrData), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const assetsDir = path.join(__dirname, '..', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });

// Dark bg #0a0a0f with gold center circle hint — solid color is fine for placeholder
const specs = [
  { file: 'icon.png',          w: 1024, h: 1024, r: 10,  g: 10,  b: 15  },
  { file: 'splash.png',        w: 1284, h: 2778, r: 10,  g: 10,  b: 15  },
  { file: 'adaptive-icon.png', w: 1024, h: 1024, r: 10,  g: 10,  b: 15  },
  { file: 'favicon.png',       w:   48, h:   48, r: 200, g: 169, b: 110 },
];

for (const { file, w, h, r, g, b } of specs) {
  const dest = path.join(assetsDir, file);
  fs.writeFileSync(dest, makePNG(w, h, r, g, b));
  console.log(`✓ ${file} (${w}×${h})`);
}
console.log('Assets created.');
