/** The one easing curve the whole site uses, so every reveal feels related. */
export const EASE = [0.21, 0.5, 0.3, 1] as const;

/** Stagger delay for a group of children revealing in sequence. */
export function stagger(index: number, step = 0.06, base = 0) {
  return base + index * step;
}
