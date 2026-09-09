"use client";

/**
 * Rotating stamp.
 *
 * The reference parks one of these in the bottom-right of its opening screen —
 * circular set type turning slowly around a fixed glyph. It is the one purely
 * decorative mark on the page, and it earns its place by carrying a real fact
 * (where the work is made, what the card does) rather than a swirl.
 *
 * The ring rotates; the arrow at the centre does not, so it reads as a seal
 * being turned rather than the whole mark spinning.
 *
 * Each character is placed individually rather than run along a `<textPath>`.
 * Two reasons, both practical:
 *
 *   - a textPath needs a document-unique id, and the id has to survive
 *     hydration; eight of these render on the case-study stack alone, and an
 *     id that disagrees between server and client leaves the ring blank.
 *   - placing the glyphs means the angular step is computed from the string
 *     length, so the ring always closes exactly once however long the text
 *     is — no overlap at the seam, no gap.
 */
export default function RotatingSeal({
  text,
  className = "h-28 w-28",
  tone = "dark",
}: {
  /** Set around the ring. Repeated twice, so the mark reads from any angle. */
  text: string;
  className?: string;
  /** Which ground it sits on — decides the ink colour. */
  tone?: "dark" | "light" | "panel";
}) {
  const ring = Array.from(`${text} • ${text} • `.toUpperCase());
  const step = 360 / ring.length;
  const radius = 38;

  const ink =
    tone === "light"
      ? "var(--color-on-band)"
      : tone === "panel"
        ? "var(--color-on-panel)"
        : "var(--color-text-primary)";
  // Shrink the type as the string grows so a long ring never collides with
  // itself. 7.4 units suits roughly 30 characters; below that it holds.
  const fontSize = Math.min(7.4, (2 * Math.PI * radius) / (ring.length * 0.78));

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 100 100"
        className="animate-seal absolute inset-0 h-full w-full"
        focusable="false"
      >
        <g fill={ink} fontWeight="500">
          {ring.map((char, i) => (
            <text
              key={i}
              x="50"
              y={50 - radius}
              fontSize={fontSize}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${(i * step).toFixed(2)} 50 50)`}
            >
              {char === " " ? " " : char}
            </text>
          ))}
        </g>
        <circle
          cx="50"
          cy="50"
          r="45.5"
          fill="none"
          stroke={ink}
          strokeOpacity="0.2"
          strokeWidth="0.5"
        />
      </svg>

      {/* Fixed centre glyph — the arrow the ring turns around. */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        focusable="false"
      >
        <g
          stroke="var(--color-primary)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <line x1="43" y1="57" x2="57" y2="43" />
          <polyline points="46,43 57,43 57,54" />
        </g>
      </svg>
    </div>
  );
}
