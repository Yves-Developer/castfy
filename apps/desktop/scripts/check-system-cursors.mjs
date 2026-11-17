/**
 * Checks system-cursors.js: decodes .cur files made the way Windows stores
 * them, then, on macOS and Windows, reads the real system cursors and saves
 * them as PNGs (argv[2], default ./cursors-out) for a person to look at.
 * Runs in CI on all three systems (desktop-cursors-check.yml).
 */
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";
import { decodeCur, encodePng, systemCursors } from "../system-cursors.js";

const outDir = path.resolve(process.argv[2] ?? "cursors-out");
await fs.mkdir(outDir, { recursive: true });

/** Reads back a PNG made by encodePng: [width, height, rgba]. */
function readPng(buffer) {
  assert.equal(buffer.readUInt32BE(0), 0x89_50_4e_47, "PNG signature");
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const idat = buffer.indexOf("IDAT");
  const length = buffer.readUInt32BE(idat - 4);
  const raw = zlib.inflateSync(buffer.subarray(idat + 4, idat + 4 + length));
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    raw.copy(rgba, y * width * 4, y * (width * 4 + 1) + 1, (y + 1) * (width * 4 + 1));
  }
  return [width, height, rgba];
}

/** A .cur file holding one DIB image, hot spot (hx, hy). */
function curFile(width, dib, hx, hy) {
  const header = Buffer.alloc(6 + 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(2, 2);
  header.writeUInt16LE(1, 4);
  header[6] = width;
  header[7] = width;
  header.writeUInt16LE(hx, 10);
  header.writeUInt16LE(hy, 12);
  header.writeUInt32LE(dib.length, 14);
  header.writeUInt32LE(header.length, 18);
  return Buffer.concat([header, dib]);
}

function dibHeader(width, bits, colours) {
  const h = Buffer.alloc(40);
  h.writeUInt32LE(40, 0);
  h.writeInt32LE(width, 4);
  h.writeInt32LE(width * 2, 8);
  h.writeUInt16LE(1, 12);
  h.writeUInt16LE(bits, 14);
  h.writeUInt32LE(colours, 32);
  return h;
}

const pixel = (rgba, width, x, y) => [...rgba.subarray((y * width + x) * 4, (y * width + x) * 4 + 4)];

// --- 1-bit, the classic text cursor: black, white, see-through, inverting.
{
  const w = 32;
  const palette = Buffer.from([0, 0, 0, 0, 255, 255, 255, 0]);
  const xor = Buffer.alloc(4 * w); // rows bottom-up, 4 bytes each
  const and = Buffer.alloc(4 * w, 0xff); // see-through everywhere...
  const set = (buf, x, yTop, bit) => {
    const row = w - 1 - yTop;
    const at = row * 4 + (x >> 3);
    buf[at] = bit ? buf[at] | (0x80 >> (x & 7)) : buf[at] & ~(0x80 >> (x & 7));
  };
  set(and, 0, 0, 0); // (0,0) black: AND 0, XOR 0
  set(and, 1, 0, 0); set(xor, 1, 0, 1); // (1,0) white
  set(xor, 2, 0, 1); // (2,0) inverts: AND 1, XOR 1
  const cur = curFile(w, Buffer.concat([dibHeader(w, 1, 2), palette, xor, and]), 3, 4);
  const decoded = decodeCur(cur);
  assert.equal(decoded.width, 32);
  assert.equal(decoded.hotX, 3);
  assert.equal(decoded.hotY, 4);
  const [pw, , rgba] = readPng(Buffer.from(decoded.src.split(",")[1], "base64"));
  assert.deepEqual(pixel(rgba, pw, 0, 0), [0, 0, 0, 255], "black");
  assert.deepEqual(pixel(rgba, pw, 1, 0), [255, 255, 255, 255], "white");
  assert.deepEqual(pixel(rgba, pw, 2, 0), [0, 0, 0, 255], "inverting drawn black");
  assert.deepEqual(pixel(rgba, pw, 5, 5), [0, 0, 0, 0], "see-through");
  console.log("1-bit cursor: ok");
}

// --- 32-bit with alpha, two sizes: the largest is used, sized as the smallest.
{
  const make = (w, colour) => {
    const pixels = Buffer.alloc(w * w * 4);
    for (let i = 0; i < w * w; i++) pixels.set(colour, i * 4);
    return Buffer.concat([dibHeader(w, 32, 0), pixels, Buffer.alloc(Math.ceil(w / 32) * 4 * w)]);
  };
  const small = make(32, [0, 0, 255, 128]); // BGRA: red, half see-through
  const large = make(64, [255, 0, 0, 200]); // blue
  const header = Buffer.alloc(6 + 32);
  header.writeUInt16LE(2, 2);
  header.writeUInt16LE(2, 4);
  const entry = (i, w, hx, hy, size, offset) => {
    const at = 6 + i * 16;
    header[at] = w;
    header[at + 1] = w;
    header.writeUInt16LE(hx, at + 4);
    header.writeUInt16LE(hy, at + 6);
    header.writeUInt32LE(size, at + 8);
    header.writeUInt32LE(offset, at + 12);
  };
  entry(0, 32, 5, 6, small.length, header.length);
  entry(1, 64, 10, 12, large.length, header.length + small.length);
  const decoded = decodeCur(Buffer.concat([header, small, large]));
  assert.equal(decoded.width, 32, "logical size is the smallest");
  assert.equal(decoded.hotX, 5);
  assert.equal(decoded.hotY, 6);
  const [pw, ph, rgba] = readPng(Buffer.from(decoded.src.split(",")[1], "base64"));
  assert.equal(pw, 64, "pixels come from the largest");
  assert.equal(ph, 64);
  assert.deepEqual(pixel(rgba, pw, 3, 3), [0, 0, 255, 200]);
  console.log("32-bit cursor: ok");
}

// --- not a cursor
assert.equal(decodeCur(Buffer.from("not a cursor")), null);
assert.ok(encodePng(1, 1, Buffer.from([1, 2, 3, 4])).length > 40);

// --- this system's own
const cursors = await systemCursors();
const names = Object.keys(cursors);
console.log(`${process.platform}: ${names.length ? names.join(", ") : "none (Castfy's own are drawn)"}`);
for (const [name, c] of Object.entries(cursors)) {
  const png = Buffer.from(c.src.split(",")[1], "base64");
  const [pw, ph] = readPng(png);
  console.log(`  ${name}: ${c.width}x${c.height}, hot spot ${c.hotX},${c.hotY}, ${pw}x${ph} px${c.source ? `, from ${c.source}` : ""}`);
  assert.ok(pw > 0 && ph > 0, `${name} is a PNG`);
  assert.ok(c.hotX >= 0 && c.hotX <= c.width && c.hotY >= 0 && c.hotY <= c.height, `${name} hot spot inside`);
  await fs.writeFile(path.join(outDir, `${process.platform}-${name}.png`), png);
}
if (process.platform === "darwin" || process.platform === "win32") {
  assert.deepEqual(names.sort(), ["crosshair", "hand", "text"], "all three read from the system");
}
console.log("check-system-cursors: all passed");
