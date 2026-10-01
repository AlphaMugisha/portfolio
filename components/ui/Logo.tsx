import Link from "next/link";
import { site } from "@/lib/site";

/** Brand mark: an amber rounded square carrying the initials, plus the name. */
export default function Logo({
  size = 36,
  withText = true,
  textClassName,
  href = "/",
}: {
  size?: number;
  withText?: boolean;
  textClassName?: string;
  href?: string | null;
}) {
  const initials = site.name
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();

  const content = (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="flex items-center justify-center rounded-xl bg-accent font-display font-bold text-accent-ink shadow-[0_10px_24px_-8px_rgba(254,176,2,0.7)]"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
        aria-hidden="true"
      >
        {initials}
      </span>
      {withText ? (
        <span
          className={
            textClassName ??
            "font-display text-xl font-semibold tracking-tight text-ink dark:text-ink-invert"
          }
        >
          {site.name}
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex items-center" aria-label={`${site.name}, home`}>
      {content}
    </Link>
  );
}
