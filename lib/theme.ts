/**
 * Theme selection.
 *
 * Two stored states — "light" and "dark" — and an unset default of light.
 *
 * The site is a white page. Following the OS preference meant anyone with
 * dark mode switched on at the system level met a dark site without ever
 * asking for one, which is not what this design is. Dark is now something
 * you opt into with the toggle, and the choice is remembered; unset always
 * means white.
 */
export type Theme = "light" | "dark";

export const THEME_KEY = "theme";

/**
 * Runs before first paint, inlined in <head>.
 *
 * This has to be blocking and synchronous. Anything deferred — a useEffect,
 * a module import — paints the default theme first and then corrects it,
 * which is the white flash every dark-mode implementation is judged on.
 * Wrapped in try/catch because localStorage throws outright in a blocked
 * third-party context, and a theme preference is not worth a blank page.
 */
export const THEME_SCRIPT = `(function(){try{
var s=localStorage.getItem(${JSON.stringify(THEME_KEY)});
document.documentElement.setAttribute("data-theme",s==="dark"?"dark":"light");
}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode, blocked storage — the theme still applies for this page.
  }
}
