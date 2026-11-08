import Link from "next/link";

/**
 * Brand mark: initials set in mono type inside a chamfered tile — the same
 * clipped-corner shape every panel on the site uses — rather than a rounded
 * badge. The wordmark sits in the display face.
 */
export default function Logo({
  name,
  size = 34,
  withText = true,
  textClassName,
  href = "/",
}: {
  name: string;
  size?: number;
  withText?: boolean;
  textClassName?: string;
  href?: string | null;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const content = (
    <span className="inline-flex items-center gap-3">
      <span
        className="flex items-center justify-center border border-signal/50 bg-signal-soft font-mono font-bold text-signal"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.38,
          clipPath:
            "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
        }}
        aria-hidden="true"
      >
        {initials}
      </span>
      {withText ? (
        <span
          className={
            textClassName ?? "font-display text-lg font-semibold tracking-tight text-text"
          }
        >
          {name}
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex items-center" aria-label={`${name}, home`}>
      {content}
    </Link>
  );
}
