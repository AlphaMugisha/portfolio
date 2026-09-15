/**
 * A signed distance field for the opening word.
 *
 * The hero's WebGL treatment shades the word as an aperture cut through the
 * light band, which means the shader needs to know, for every pixel, how far it
 * is from the nearest letter edge and on which side. That is a distance field,
 * and it has to be generated from the REAL rendered type — same face, same
 * size, same horizontal compression — or the cut will not sit exactly on the
 * word and the whole illusion collapses into a misregistered smear.
 *
 * So the mask is rasterised from the live element's own computed style rather
 * than from constants. If the clamp resolves differently, or the font falls
 * back, or the schedule changes, the field follows automatically.
 *
 * The transform is the part worth care: the word is drawn with `scaleX(0.408)`,
 * and canvas2d has no text-transform, so both the compression and the
 * uppercasing are applied by hand here.
 *
 * The work is split in two because only one half needs the DOM. Rasterising
 * does — it reads the live element, its computed style and the resolved font —
 * so it runs here on the main thread and costs almost nothing. The distance
 * transform does not, and it costs half a second, so it goes to a Worker
 * (`lib/sdf.worker.ts`). That is why `fieldFromElement` is async.
 */

import { edt } from "./edt";

export interface Field {
  /** Signed distance in device pixels. Positive inside the glyph. */
  data: Float32Array;
  width: number;
  height: number;
  /** Device pixels per CSS pixel, so the shader can talk in CSS units. */
  scale: number;
}

/** The rasterised word, before the distance transform. */
interface Mask {
  binary: Uint8Array;
  width: number;
  height: number;
  scale: number;
}

/** Above this the field costs more than it is worth; the shader interpolates.
    Sized so a 1512px-wide hero is sampled at roughly 1:1 rather than upscaled,
    which is what kept the cut edge visibly softer than the type beside it. */
const MAX_DIM = 1600;

/**
 * Draw the word exactly as the DOM renders it, and return it as a bitmask.
 *
 * `el` is the live heading. Everything about how it looks is read back off it,
 * so this cannot drift from what the reader sees.
 */
function rasterise(el: HTMLElement, hostRect: DOMRect): Mask | null {
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height || !hostRect.width || !hostRect.height) return null;

  // The field covers the whole hero, not just the word, because the shader
  // shades the entire sheet and needs distances out into the paper.
  const scale = Math.min(
    MAX_DIM / hostRect.width,
    (MAX_DIM * 0.6) / hostRect.height,
    1
  );
  const w = Math.max(2, Math.round(hostRect.width * scale));
  const h = Math.max(2, Math.round(hostRect.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";

  // canvas2d has no text-transform, so uppercasing is applied here to match
  // the `text-mega` utility.
  const text = (el.textContent ?? "").toUpperCase();
  const fontSize = parseFloat(cs.fontSize);
  const family = cs.fontFamily;
  const tracking = parseFloat(cs.letterSpacing) || 0;

  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${fontSize}px ${family}`;
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      `${tracking}px`;
  }

  // The element's own horizontal compression, read from its matrix rather than
  // assumed — this is the number that makes the word the word.
  const m = new DOMMatrixReadOnly(cs.transform === "none" ? undefined : cs.transform);
  const scaleX = m.a || 1;

  // Where the word's baseline sits inside the host, in field pixels.
  const metrics = ctx.measureText(text);
  const cx = (rect.left + rect.width / 2 - hostRect.left) * scale;
  const baseline =
    (rect.top - hostRect.top) * scale +
    metrics.actualBoundingBoxAscent * scale +
    ((rect.height * scale) - (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * scale) / 2;

  ctx.save();
  ctx.translate(cx, baseline);
  ctx.scale(scaleX * scale, scale);
  ctx.fillText(text, -metrics.width / 2, 0);
  ctx.restore();

  const img = ctx.getImageData(0, 0, w, h).data;
  const binary = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) binary[i] = img[i * 4 + 3] > 127 ? 1 : 0;

  // Nothing was drawn — a missing font, or the element is not laid out yet.
  let any = 0;
  for (let i = 0; i < binary.length; i++) any |= binary[i];
  if (!any) return null;

  canvas.width = canvas.height = 0;
  return { binary, width: w, height: h, scale };
}

/**
 * Run the transform in a Worker, falling back to running it here.
 *
 * The fallback is not a formality. A Worker can fail to construct — a strict
 * CSP, a browser that will not take a module worker — and the cut is the only
 * thing drawing the word by the time it is wanted. Better half a second of
 * jank than a hero with no word in it.
 */
function transform(mask: Mask): Promise<Float32Array> {
  return new Promise((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("./sdf.worker.ts", import.meta.url));
    } catch {
      resolve(edt(mask.binary, mask.width, mask.height));
      return;
    }

    // Whichever of these fires first wins; the rest are torn down with it.
    const settle = (data: Float32Array) => {
      worker.terminate();
      resolve(data);
    };

    worker.onmessage = (event: MessageEvent<Float32Array>) => settle(event.data);
    worker.onerror = () => settle(edt(mask.binary, mask.width, mask.height));

    // The mask is copied rather than transferred, deliberately. Transferring
    // detaches `mask.binary` here, and the error path above still needs to be
    // able to read it — a fallback that runs against a detached buffer is not
    // a fallback. A megabyte of structured clone is nothing beside the half
    // second this is buying back. The field coming the other way IS
    // transferred, which is the copy that would actually have cost something.
    const { binary, width, height } = mask;
    try {
      worker.postMessage({ binary, width, height });
    } catch {
      settle(edt(binary, width, height));
    }
  });
}

/**
 * Measure the live heading and build its distance field.
 *
 * Resolves to `null` when there is nothing to measure — no layout, no font, an
 * empty heading — which the caller treats as "do not mount the scene".
 */
export async function fieldFromElement(
  el: HTMLElement,
  hostRect: DOMRect
): Promise<Field | null> {
  const mask = rasterise(el, hostRect);
  if (!mask) return null;

  const { width, height, scale } = mask;
  return { data: await transform(mask), width, height, scale };
}
