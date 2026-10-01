"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

/* The class on <html> is the single source of truth — the pre-paint script in
   layout.tsx sets it, and this subscribes to it with a MutationObserver
   rather than keeping a second copy in React state. The server snapshot is
   deliberately `null` so the button renders empty on the server and the
   markup matches on hydration whichever theme the visitor has stored. */
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}
const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => null;

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = !getSnapshot();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/60 text-ink transition-colors hover:border-accent dark:border-white/15 dark:bg-white/5 dark:text-ink-invert dark:hover:border-accent ${className}`}
    >
      {dark === null ? null : dark ? (
        <Sun size={18} className="text-accent" />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}
