/**
 * The organic splash that sits behind every card.
 *
 * It is a plain div with an eight-value `border-radius`, which is what
 * produces the lopsided, hand-drawn shape — a `border-radius: 50%` would
 * read as a circle, and a circle reads as a loading spinner. Six shapes
 * cycle by index so a grid of cards never repeats the same silhouette in
 * adjacent cells.
 *
 * Purely decorative, so it never takes pointer events and is hidden from
 * assistive technology.
 */
export const BLOB_SHAPES = [
  "42% 58% 63% 37% / 41% 44% 56% 59%",
  "63% 37% 47% 53% / 38% 63% 37% 62%",
  "39% 61% 38% 62% / 58% 39% 61% 42%",
  "58% 42% 64% 36% / 49% 56% 44% 51%",
  "47% 53% 35% 65% / 64% 47% 53% 36%",
  "61% 39% 56% 44% / 36% 58% 42% 64%",
] as const;

/* The palette has one hue, so the blobs are tints and tones of it plus two
   neutrals — enough separation to tell cards apart without introducing a
   colour the token sheet does not contain. */
export const BLOB_TINTS = [
  "bg-[#FFE6AE] dark:bg-[#FEB002]/18",
  "bg-[#FFD37A] dark:bg-[#FEB002]/12",
  "bg-[#E4E4E4] dark:bg-white/[0.07]",
  "bg-[#FFF0CC] dark:bg-[#FEB002]/22",
  "bg-[#D8D8D8] dark:bg-white/[0.05]",
  "bg-[#FFC94D] dark:bg-[#FEB002]/15",
] as const;

export default function Blob({
  index = 0,
  className = "",
}: {
  index?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -right-8 -top-10 h-44 w-44 opacity-80 ${
        BLOB_TINTS[index % BLOB_TINTS.length]
      } ${className}`}
      style={{ borderRadius: BLOB_SHAPES[index % BLOB_SHAPES.length] }}
    />
  );
}
