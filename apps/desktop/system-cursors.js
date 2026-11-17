/** biome-ignore-all lint/suspicious/noBitwiseOperators: decoding cursor and PNG files, which are bit-level formats */
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import zlib from "node:zlib";

/**
 * The cursors of the computer making the demo: macOS's own on a Mac,
 * Windows' own on a PC, as a screen recording on that computer would show.
 *
 * Castfy draws the cursor over the recording (remotion/pointer.tsx), so it
 * has to supply the images. They are read from the system at run time, never
 * shipped with Castfy: nothing of Apple's or Microsoft's is in the app. Where
 * none can be read (Linux, or an error), the editor draws its own.
 *
 * Each cursor comes back as a PNG data URL with its size and hot spot in
 * logical pixels (points on a Mac), the units the editor sizes it in.
 */

const execFileAsync = promisify(execFile);

/** The shapes the editor draws from the system. */
export const SYSTEM_CURSORS = ["arrow", "hand", "text", "crosshair"];

/** Rendered this many times their logical size, so they stay sharp zoomed in. */
const MAC_SCALE = 4;

let cached;

/**
 * The system's cursors, read once per run of the app: {} when there are none.
 * @returns {Promise<Record<string, {src: string, width: number, height: number, hotX: number, hotY: number}>>}
 */
export function systemCursors() {
  cached ??= readSystemCursors(process.platform).catch((err) => {
    console.warn("[cursors] Using Castfy's own:", err?.message ?? err);
    return {};
  });
  return cached;
}

function readSystemCursors(platform) {
  if (platform === "darwin") {
    return macCursors();
  }
  if (platform === "win32") {
    return windowsCursors();
  }
  return Promise.resolve({});
}

// ---------------------------------------------------------------------------
// macOS: NSCursor's own images, drawn at MAC_SCALE through AppKit (JXA).

/** macOS's own cursor files, the fallback when NSCursor gives no image. */
const MAC_CURSOR_DIR =
  "/System/Library/Frameworks/ApplicationServices.framework/Versions/A/Frameworks/HIServices.framework/Versions/A/Resources/cursors/";

const MAC_SCRIPT = `
ObjC.import('AppKit');
// Cursor images load with the app session; a script outside one has none.
$.NSApplication.sharedApplication;
const scale = ${MAC_SCALE};
const dir = '${MAC_CURSOR_DIR}';
const specs = {
  arrow: ['arrowCursor', []],
  hand: ['pointingHandCursor', ['pointinghand']],
  text: ['IBeamCursor', ['ibeamhorizontal', 'ibeam']],
  crosshair: ['crosshairCursor', ['crosshair', 'cross']],
};
const nil = (o) => !o || (typeof o.isNil === 'function' && o.isNil());
function fromCursor(selector) {
  const cursor = $.NSCursor[selector];
  if (nil(cursor)) return null;
  const image = cursor.image;
  if (nil(image)) return null;
  const hot = cursor.hotSpot;
  return { image, hotX: hot.x, hotY: hot.y };
}
function fromFiles(folders) {
  for (const folder of folders) {
    const image = $.NSImage.alloc.initWithContentsOfFile(dir + folder + '/cursor.pdf');
    if (nil(image)) continue;
    const info = $.NSDictionary.dictionaryWithContentsOfFile(dir + folder + '/info.plist');
    const read = (key) => (nil(info) || nil(info.objectForKey(key)) ? 0 : Number(ObjC.unwrap(info.objectForKey(key))));
    return { image, hotX: read('hotx'), hotY: read('hoty') };
  }
  return null;
}
function draw({ image, hotX, hotY }) {
  const size = image.size;
  const w = Math.round(size.width * scale), h = Math.round(size.height * scale);
  const rep = $.NSBitmapImageRep.alloc.initWithBitmapDataPlanesPixelsWidePixelsHighBitsPerSampleSamplesPerPixelHasAlphaIsPlanarColorSpaceNameBytesPerRowBitsPerPixel(null, w, h, 8, 4, true, false, 'NSDeviceRGBColorSpace', 0, 0);
  rep.setSize(size);
  $.NSGraphicsContext.saveGraphicsState;
  $.NSGraphicsContext.setCurrentContext($.NSGraphicsContext.graphicsContextWithBitmapImageRep(rep));
  image.drawInRectFromRectOperationFraction($.NSMakeRect(0, 0, size.width, size.height), $.NSMakeRect(0, 0, 0, 0), 2, 1);
  $.NSGraphicsContext.restoreGraphicsState;
  const png = rep.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $());
  return { png: ObjC.unwrap(png.base64EncodedStringWithOptions(0)), width: size.width, height: size.height, hotX, hotY };
}
const out = { errors: {} };
for (const name in specs) {
  const [selector, folders] = specs[name];
  try {
    const found = fromCursor(selector) || fromFiles(folders);
    if (found) out[name] = draw(found);
    else out.errors[name] = 'no image from NSCursor or ' + folders.join(', ');
  } catch (e) {
    out.errors[name] = String(e);
  }
}
JSON.stringify(out);
`;

async function macCursors() {
  const { stdout } = await execFileAsync(
    "osascript",
    ["-l", "JavaScript", "-e", MAC_SCRIPT],
    {
      timeout: 15_000,
      maxBuffer: 16 * 1024 * 1024,
    }
  );
  const parsed = JSON.parse(stdout.trim());
  for (const [name, error] of Object.entries(parsed.errors ?? {})) {
    console.warn(`[cursors] macOS ${name}: ${error}`);
  }
  const result = {};
  for (const name of SYSTEM_CURSORS) {
    const c = parsed[name];
    if (!(c?.png && c.width > 0 && c.height > 0)) {
      continue;
    }
    result[name] = {
      src: `data:image/png;base64,${c.png}`,
      width: c.width,
      height: c.height,
      hotX: c.hotX,
      hotY: c.hotY,
    };
  }
  return result;
}

// ---------------------------------------------------------------------------
// Windows: the user's cursor scheme from the registry, else Windows' defaults.

/** The registry value for each shape, and the file Windows uses when it is empty. */
const WINDOWS_CURSORS = {
  arrow: { value: "Arrow", file: "aero_arrow.cur" },
  hand: { value: "Hand", file: "aero_link.cur" },
  text: { value: "IBeam", file: "beam_r.cur" },
  crosshair: { value: "Crosshair", file: "cross_r.cur" },
};

/** %SystemRoot% and the like, in a registry path. */
const ENV_VARIABLE = /%([^%]+)%/g;
const LINE_BREAK = /\r?\n/;
/** A value line of `reg query`: name, type, data. */
const REG_VALUE = /^\s+(\S+)\s+REG_(?:EXPAND_)?SZ\s+(.+?)\s*$/;

async function windowsCursors() {
  const windir = process.env.SystemRoot || process.env.windir || "C:\\Windows";
  const scheme = await readCursorScheme();
  const result = {};
  for (const [name, { value, file }] of Object.entries(WINDOWS_CURSORS)) {
    const chosen = scheme[value]?.replace(
      ENV_VARIABLE,
      (m, v) => process.env[v] ?? m
    );
    const candidates = [chosen, path.join(windir, "Cursors", file)].filter(
      Boolean
    );
    for (const candidate of candidates) {
      // Animated cursors (.ani) are not read; the default is used instead.
      if (!candidate.toLowerCase().endsWith(".cur")) {
        continue;
      }
      try {
        const cursor = decodeCur(await fs.readFile(candidate));
        if (cursor) {
          result[name] = cursor;
          break;
        }
      } catch {
        // Unreadable: try the next.
      }
    }
  }
  return result;
}

async function readCursorScheme() {
  try {
    const { stdout } = await execFileAsync(
      "reg",
      ["query", "HKCU\\Control Panel\\Cursors"],
      { timeout: 5000 }
    );
    const scheme = {};
    for (const line of stdout.split(LINE_BREAK)) {
      const match = line.match(REG_VALUE);
      if (match) {
        scheme[match[1]] = match[2];
      }
    }
    return scheme;
  } catch {
    return {};
  }
}

/**
 * A .cur file's largest image as a PNG data URL, with its logical size (its
 * smallest image's) and hot spot. Exported for tests.
 */
export function decodeCur(buffer) {
  if (
    buffer.length < 6 ||
    buffer.readUInt16LE(0) !== 0 ||
    buffer.readUInt16LE(2) !== 2
  ) {
    return null;
  }
  const count = buffer.readUInt16LE(4);
  const entries = [];
  for (let i = 0; i < count; i++) {
    const at = 6 + i * 16;
    if (at + 16 > buffer.length) {
      break;
    }
    entries.push({
      width: buffer[at] || 256,
      height: buffer[at + 1] || 256,
      hotX: buffer.readUInt16LE(at + 4),
      hotY: buffer.readUInt16LE(at + 6),
      size: buffer.readUInt32LE(at + 8),
      offset: buffer.readUInt32LE(at + 12),
    });
  }
  if (entries.length === 0) {
    return null;
  }
  const largest = entries.reduce((a, b) => (b.width > a.width ? b : a));
  const smallest = entries.reduce((a, b) => (b.width < a.width ? b : a));
  const data = buffer.subarray(largest.offset, largest.offset + largest.size);
  const png = isPng(data) ? data : bmpToPng(data);
  if (!png) {
    return null;
  }
  // Logical size: a 32 px cursor drawn larger on a high-DPI screen is still 32.
  const scale = largest.width / smallest.width;
  return {
    src: `data:image/png;base64,${png.toString("base64")}`,
    width: smallest.width,
    height: smallest.height,
    hotX: largest.hotX / scale,
    hotY: largest.hotY / scale,
  };
}

function isPng(data) {
  return data.length > 8 && data.readUInt32BE(0) === 0x89_50_4e_47;
}

/**
 * A cursor's DIB (a BITMAPINFOHEADER, the colour image, then the 1-bit AND
 * mask) as RGBA PNG. 32-bit images carry their own alpha; paletted ones are
 * transparent where the mask says so. Pixels the mask inverts (the classic
 * text cursor) are drawn black, as on a light page.
 */
function bmpToPng(data) {
  if (data.length < 40 || data.readUInt32LE(0) < 40) {
    return null;
  }
  const headerSize = data.readUInt32LE(0);
  const width = data.readInt32LE(4);
  const height = Math.abs(data.readInt32LE(8)) / 2;
  const bits = data.readUInt16LE(14);
  if (!(width > 0 && height > 0 && [1, 4, 8, 24, 32].includes(bits))) {
    return null;
  }
  const colours = bits <= 8 ? data.readUInt32LE(32) || 1 << bits : 0;
  const palette = headerSize;
  const xorStart = palette + colours * 4;
  const xorStride = Math.ceil((width * bits) / 32) * 4;
  const andStart = xorStart + xorStride * height;
  const andStride = Math.ceil(width / 32) * 4;

  const dib = { data, bits, palette, xorStart, xorStride, andStart, andStride };
  dib.anyAlpha = bits === 32 && hasAlpha(data, xorStart, width * height);
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const row = height - 1 - y; // bottom-up
    for (let x = 0; x < width; x++) {
      rgba.set(dibPixel(dib, row, x), (y * width + x) * 4);
    }
  }
  return encodePng(width, height, rgba);
}

/** Whether a 32-bit DIB uses its alpha channel; old ones leave it 0. */
function hasAlpha(data, start, pixels) {
  for (let i = 0; i < pixels; i++) {
    if (data[start + i * 4 + 3]) {
      return true;
    }
  }
  return false;
}

/** The AND mask's bit for a pixel: 1 where the cursor is see-through. */
function maskBit({ data, andStart, andStride }, row, x) {
  const at = andStart + row * andStride + (x >> 3);
  return at < data.length ? (data[at] >> (7 - (x & 7))) & 1 : 0;
}

/** One pixel of a cursor DIB as [r, g, b, a]. */
function dibPixel(dib, row, x) {
  const { data, bits, palette, xorStart, xorStride } = dib;
  const masked = maskBit(dib, row, x);
  if (bits === 32 || bits === 24) {
    const at = xorStart + row * xorStride + x * (bits / 8);
    const ownAlpha = bits === 32 && dib.anyAlpha;
    const alpha = masked ? 0 : 255;
    return [
      data[at + 2],
      data[at + 1],
      data[at],
      ownAlpha ? data[at + 3] : alpha,
    ];
  }
  const bitAt = x * bits;
  const byte = data[xorStart + row * xorStride + (bitAt >> 3)];
  const index = (byte >> (8 - bits - (bitAt & 7))) & ((1 << bits) - 1);
  const p = palette + index * 4;
  const colour = [data[p + 2], data[p + 1], data[p]];
  if (!masked) {
    return [...colour, 255];
  }
  // Mask set: see-through, unless the colour inverts the screen (drawn black).
  return colour.some(Boolean) ? [0, 0, 0, 255] : [0, 0, 0, 0];
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xed_b8_83_20 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xff_ff_ff_ff;
  for (const byte of buf) {
    c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xff_ff_ff_ff) >>> 0;
}

function chunk(type, body) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(type, 4, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), body])), 0);
  return Buffer.concat([head, body, crc]);
}

/** RGBA pixels as a PNG. Exported for tests. */
export function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // no filter
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
