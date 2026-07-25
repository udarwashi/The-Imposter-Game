/**
 * Rasterizes the المندس logo to the PNGs the app needs.
 *
 *   node scripts/gen-icons.js
 *
 * Same geometry as app/components/Logo.tsx, kept deliberately simple (circles,
 * a rounded rect, two flattened Bezier silhouettes, a stroked question mark) so
 * it can be drawn with no image libraries at all — just Node's built-in zlib for
 * the PNG deflate stream, plus a hand-rolled CRC32 and chunk writer.
 *
 * Edges are anti-aliased by 4x4 supersampling and painter's-algorithm
 * compositing per subsample, which also gets the translucent glow right.
 *
 * Outputs (assets/images/):
 *   icon.png                 1024  full-bleed, for iOS/general app icon
 *   adaptive-foreground.png  1024  art only, inset for Android's mask
 *   adaptive-background.png  1024  flat backdrop for the adaptive icon
 *   splash-icon.png           512  transparent, for the splash
 *   favicon.png                64  web
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUT_DIR = path.join(__dirname, "..", "assets", "images");
const SS = 4; // supersampling factor per axis

// ------------------------------------------------------------------ PNG output

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** Writes 8-bit RGBA pixels as a PNG. */
function writePng(file, width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: truecolour + alpha
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  // One filter byte (0 = None) per scanline.
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);

  fs.writeFileSync(path.join(OUT_DIR, file), png);
  console.log(`  ${file.padEnd(24)} ${width}x${height}  ${(png.length / 1024).toFixed(0)} KB`);
}

// -------------------------------------------------------------------- geometry

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

/** Vertical linear gradient between two hex colours across [y0, y1]. */
function vgrad(c0, c1, y0, y1) {
  const a = hex(c0);
  const b = hex(c1);
  return (x, y) => {
    let t = (y - y0) / (y1 - y0);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, 1];
  };
}

const solid = (h, alpha = 1) => {
  const c = hex(h);
  return () => [c[0], c[1], c[2], alpha];
};

function roundedRectContains(x, y, rx, ry, w, h, r) {
  if (x < rx || x > rx + w || y < ry || y > ry + h) return false;
  const cx = Math.min(Math.max(x, rx + r), rx + w - r);
  const cy = Math.min(Math.max(y, ry + r), ry + h - r);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

const circleContains = (x, y, cx, cy, r) =>
  (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r;

/** Flattens a cubic Bezier into points (excluding p0). */
function cubic(p0, p1, p2, p3, steps = 24) {
  const pts = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    pts.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return pts;
}

/** Even-odd ray casting. */
function polyContains(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function distToSegment(px, py, [x1, y1], [x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / len2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

const nearPolyline = (x, y, pts, halfWidth) => {
  for (let i = 1; i < pts.length; i++) {
    if (distToSegment(x, y, pts[i - 1], pts[i]) <= halfWidth) return true;
  }
  return false;
};

/** The head-and-shoulders outline, matching Logo.tsx's Figure(). */
function figureShapes(cx, headY, headR, halfWidth, shoulderY, bottomY, fillA, fillB, stroke) {
  const rise = (shoulderY - headY) * 0.42;
  const left = [cx - halfWidth, bottomY];
  const right = [cx + halfWidth, bottomY];
  const poly = [left];
  poly.push(
    ...cubic(
      left,
      [cx - halfWidth, shoulderY - rise],
      [cx - halfWidth * 0.5, shoulderY - rise * 1.6],
      [cx, shoulderY - rise * 1.6]
    )
  );
  poly.push(
    ...cubic(
      [cx, shoulderY - rise * 1.6],
      [cx + halfWidth * 0.5, shoulderY - rise * 1.6],
      [cx + halfWidth, shoulderY - rise],
      right
    )
  );

  const grad = vgrad(fillA, fillB, headY - headR, bottomY);
  const strokeC = solid(stroke);
  const sw = 1.5;

  return [
    // Outline first, then the fill inset over it — cheaper than real stroking.
    { contains: (x, y) => polyContains(x, y, poly) || circleContains(x, y, cx, headY, headR + sw), colorAt: strokeC },
    { contains: (x, y) => circleContains(x, y, cx, headY, headR), colorAt: grad },
    {
      contains: (x, y) =>
        polyContains(x, y, poly) &&
        !nearPolyline(x, y, [...poly, left], sw) &&
        !circleContains(x, y, cx, headY, headR + sw * 1.2),
      colorAt: grad,
    },
  ];
}

/**
 * Builds the shape stack for the mark.
 * @param bleed  true = fill the whole canvas (iOS masks it itself);
 *               false = draw the rounded badge with its ring.
 */
function logoShapes({ bleed, withBadge }) {
  const shapes = [];

  if (withBadge) {
    if (bleed) {
      shapes.push({ contains: () => true, colorAt: vgrad("#1C2740", "#0B1220", 0, 120) });
    } else {
      shapes.push({
        contains: (x, y) => roundedRectContains(x, y, 5, 5, 110, 110, 32),
        colorAt: vgrad("#1C2740", "#0B1220", 5, 115),
      });
      // Ring: inside the outer rounded rect but outside an inset one.
      shapes.push({
        contains: (x, y) =>
          roundedRectContains(x, y, 5, 5, 110, 110, 32) &&
          !roundedRectContains(x, y, 7.5, 7.5, 105, 105, 29.5),
        colorAt: (x, y) => {
          // Green at the top-left fading to red at the bottom-right.
          const t = Math.min(1, Math.max(0, (x + y) / 240));
          const g = hex("#6BE39A");
          const r = hex("#FF3B3B");
          return [g[0] + (r[0] - g[0]) * t, g[1] + (r[1] - g[1]) * t, g[2] + (r[2] - g[2]) * t, 0.85];
        },
      });
    }
  }

  // Soft red glow behind the imposter.
  shapes.push({
    contains: (x, y) => {
      const d = Math.hypot((x - 60) / 34, (y - 62) / 30);
      return d <= 1;
    },
    colorAt: (x, y) => {
      const d = Math.hypot((x - 60) / 34, (y - 62) / 30);
      const c = hex("#FF3B3B");
      return [c[0], c[1], c[2], 0.5 * (1 - d) * (1 - d)];
    },
  });

  shapes.push(...figureShapes(27, 55, 8.5, 14, 78, 92, "#46587C", "#2C3A55", "#0B1220"));
  shapes.push(...figureShapes(93, 55, 8.5, 14, 78, 92, "#46587C", "#2C3A55", "#0B1220"));
  shapes.push(...figureShapes(60, 42, 12.5, 19, 72, 95, "#FF6A6A", "#FF3B3B", "#2A0509"));

  // Question mark: an arc hook plus a stem, flattened to a polyline, then a dot.
  const qx = 60;
  const qTop = 40;
  const hook = [];
  for (let i = 0; i <= 26; i++) {
    // Sweep most of a circle, leaving the bottom-right open like a "?".
    const a = Math.PI * 0.86 + (i / 26) * Math.PI * 1.32;
    hook.push([qx + 3.9 * Math.cos(a), qTop + 0.4 + 3.9 * Math.sin(a)]);
  }
  hook.push(
    ...cubic(hook[hook.length - 1], [qx + 3.2, qTop + 4.2], [qx, qTop + 4.4], [qx, qTop + 7.0], 10)
  );
  shapes.push({
    contains: (x, y) => nearPolyline(x, y, hook, 1.35),
    colorAt: solid("#2A0509"),
  });
  shapes.push({
    contains: (x, y) => circleContains(x, y, qx, qTop + 10.4, 1.5),
    colorAt: solid("#2A0509"),
  });

  return shapes;
}

// ------------------------------------------------------------------- rendering

/**
 * @param size    output pixel size
 * @param artBox  the region of the 0..120 design space mapped to the canvas
 * @param base    [r,g,b,a] starting colour
 */
function render(size, shapes, artBox, base) {
  const rgba = Buffer.alloc(size * size * 4);
  const { x0, y0, span } = artBox;
  const step = 1 / (SS * size);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = (px + (sx + 0.5) / SS) / size;
          const v = (py + (sy + 0.5) / SS) / size;
          const dx = x0 + u * span;
          const dy = y0 + v * span;

          let cr = base[0];
          let cg = base[1];
          let cb = base[2];
          let ca = base[3];

          for (const s of shapes) {
            if (!s.contains(dx, dy)) continue;
            const [sr, sg, sb, sa] = s.colorAt(dx, dy);
            if (sa <= 0) continue;
            // Standard source-over.
            const na = sa + ca * (1 - sa);
            if (na <= 0) continue;
            cr = (sr * sa + cr * ca * (1 - sa)) / na;
            cg = (sg * sa + cg * ca * (1 - sa)) / na;
            cb = (sb * sa + cb * ca * (1 - sa)) / na;
            ca = na;
          }

          r += cr * ca;
          g += cg * ca;
          b += cb * ca;
          a += ca;
        }
      }

      const n = SS * SS;
      const i = (py * size + px) * 4;
      // Un-premultiply back to straight alpha for PNG.
      const outA = a / n;
      rgba[i] = outA > 0 ? Math.round(Math.min(255, r / a)) : 0;
      rgba[i + 1] = outA > 0 ? Math.round(Math.min(255, g / a)) : 0;
      rgba[i + 2] = outA > 0 ? Math.round(Math.min(255, b / a)) : 0;
      rgba[i + 3] = Math.round(outA * 255);
    }
  }
  void step;
  return rgba;
}

function build() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log("Generating icons into assets/images/");

  const full = { x0: 0, y0: 0, span: 120 };

  // App icon: full-bleed, no ring (iOS rounds the corners itself and would clip it).
  writePng("icon.png", 1024, 1024, render(1024, logoShapes({ bleed: true, withBadge: true }), full, [0, 0, 0, 0]));

  // Android adaptive icon. The launcher masks roughly the outer quarter, so the
  // art is inset by drawing a wider slice of design space than the art occupies.
  const inset = { x0: -30, y0: -30, span: 180 };
  writePng(
    "adaptive-foreground.png",
    1024,
    1024,
    render(1024, logoShapes({ bleed: false, withBadge: false }), inset, [0, 0, 0, 0])
  );
  writePng(
    "adaptive-background.png",
    1024,
    1024,
    render(1024, [{ contains: () => true, colorAt: vgrad("#111A2C", "#070B14", 0, 120) }], full, [0, 0, 0, 0])
  );

  // Splash: the badge on transparency, so it sits on the splash background colour.
  writePng("splash-icon.png", 512, 512, render(512, logoShapes({ bleed: false, withBadge: true }), full, [0, 0, 0, 0]));

  writePng("favicon.png", 64, 64, render(64, logoShapes({ bleed: false, withBadge: true }), full, [0, 0, 0, 0]));

  console.log("Done.");
}

build();
