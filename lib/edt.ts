/**
 * Exact Euclidean distance transform (8SSEDT).
 *
 * A chamfer approximation is cheaper and is what most implementations reach
 * for, but its error is directional — it bulges along the diagonals. On a
 * letterform this size the chamfer bevel is only a few pixels wide, so that
 * anisotropy would show up as the bevel visibly thickening on the diagonal
 * strokes of a W or an A. Exact is worth the extra pass.
 *
 * Kept in its own module, free of any DOM reference, for one reason: it is the
 * expensive half of building the field — measured at 450-620ms on a 1600x700
 * hero — and it therefore has to be able to run inside a Worker. `lib/sdf.ts`
 * rasterises (which needs the DOM) and this runs the transform (which must
 * not need it).
 */
export function edt(binary: Uint8Array, w: number, h: number): Float32Array {
  const n = w * h;
  // Two grids: distance to the nearest "inside" pixel and to the nearest
  // "outside" one. Subtracting them at the end gives the sign for free.
  const gx = new Float32Array(n * 2);
  const gy = new Float32Array(n * 2);
  const INF = 1e9;

  const init = (offset: number, want: number) => {
    for (let i = 0; i < n; i++) {
      const inside = binary[i] === want;
      gx[offset + i] = inside ? 0 : INF;
      gy[offset + i] = inside ? 0 : INF;
    }
  };
  init(0, 1);
  init(n, 0);

  const pass = (offset: number) => {
    const dist = (i: number) => gx[offset + i] ** 2 + gy[offset + i] ** 2;

    const compare = (i: number, oi: number, dx: number, dy: number) => {
      if (oi < 0 || oi >= n) return;
      const ox = gx[offset + oi] + dx;
      const oy = gy[offset + oi] + dy;
      if (ox * ox + oy * oy < dist(i)) {
        gx[offset + i] = ox;
        gy[offset + i] = oy;
      }
    };

    // Forward: up-left neighbours, then a left-to-right sweep.
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (y > 0) compare(i, i - w, 0, 1);
        if (x > 0) compare(i, i - 1, 1, 0);
        if (x > 0 && y > 0) compare(i, i - w - 1, 1, 1);
        if (x < w - 1 && y > 0) compare(i, i - w + 1, 1, 1);
      }
      for (let x = w - 1; x >= 0; x--) {
        const i = y * w + x;
        if (x < w - 1) compare(i, i + 1, 1, 0);
      }
    }

    // Backward: the mirror image of the above.
    for (let y = h - 1; y >= 0; y--) {
      for (let x = w - 1; x >= 0; x--) {
        const i = y * w + x;
        if (y < h - 1) compare(i, i + w, 0, 1);
        if (x < w - 1) compare(i, i + 1, 1, 0);
        if (x < w - 1 && y < h - 1) compare(i, i + w + 1, 1, 1);
        if (x > 0 && y < h - 1) compare(i, i + w - 1, 1, 1);
      }
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (x > 0) compare(i, i - 1, 1, 0);
      }
    }
  };

  pass(0);
  pass(n);

  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const inside = Math.hypot(gx[i], gy[i]);
    const outside = Math.hypot(gx[n + i], gy[n + i]);
    // Positive inside the glyph, negative outside, in pixels.
    out[i] = outside - inside;
  }
  return out;
}
