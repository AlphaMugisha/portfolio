/// <reference lib="webworker" />

import { edt } from "./edt";

/**
 * Runs the distance transform away from the main thread.
 *
 * The rasterising half has to stay on the main thread — it needs the live
 * element, its computed style and the loaded font — but the transform is pure
 * arithmetic over a byte array, and it is the half that costs half a second.
 * Leaving it inline froze the page across exactly the window in which the
 * hero's letters animate in, so the one moment the design is built around was
 * the one moment that stuttered.
 *
 * Both the mask in and the field out are transferred rather than copied, so a
 * 1600x700 field crosses the boundary without allocating a second buffer.
 */

export interface EdtRequest {
  binary: Uint8Array;
  width: number;
  height: number;
}

self.onmessage = (event: MessageEvent<EdtRequest>) => {
  const { binary, width, height } = event.data;
  const field = edt(binary, width, height);
  (self as unknown as Worker).postMessage(field, [field.buffer]);
};
