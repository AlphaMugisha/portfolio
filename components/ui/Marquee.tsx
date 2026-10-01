/**
 * An endless horizontal ticker.
 *
 * The track holds the list TWICE and translates by exactly -50%, which is
 * what makes the loop seamless: at the end of the animation the second copy
 * sits precisely where the first began, so the jump back to 0 is invisible.
 * It pauses on hover, and the duplicate copy is hidden from screen readers
 * so the words are not announced twice.
 */
export default function Marquee({
  items,
  duration = 42,
  className = "",
  itemClassName = "",
}: {
  items: readonly string[];
  duration?: number;
  className?: string;
  itemClassName?: string;
}) {
  const run = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className={`flex items-center ${itemClassName}`}>
          {item}
          <span className="px-6 opacity-40" aria-hidden="true">
            &bull;
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <div className="marquee-track" style={{ ["--marquee-duration" as string]: `${duration}s` }}>
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
