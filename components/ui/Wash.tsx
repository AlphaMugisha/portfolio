/**
 * The soft colour field from the hero, reusable.
 *
 * The hero reads as lit rather than blank because two very wide, very faint
 * washes sit behind it. Every other section was plain white, so the page
 * changed character the moment you scrolled past the fold — this puts the
 * same light under all of them.
 *
 * `side` alternates the composition down the page so consecutive sections do
 * not look like the same image repeated. Purely decorative, so it is
 * `aria-hidden` and never takes pointer events.
 */
export default function Wash({ side = "left" }: { side?: "left" | "right" }) {
  const accent =
    side === "left"
      ? "ellipse 55% 45% at 12% 18%"
      : "ellipse 50% 44% at 88% 22%";
  const ink =
    side === "left"
      ? "ellipse 48% 42% at 82% 82%"
      : "ellipse 52% 46% at 16% 78%";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            `radial-gradient(${accent}, var(--grid-wash-accent), transparent 66%),` +
            `radial-gradient(${ink}, var(--grid-wash-ink), transparent 64%)`,
        }}
      />
    </div>
  );
}
