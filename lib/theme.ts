/**
 * Theme selection.
 *
 * Three states, not two: "light", "dark", or no stored choice at all, in
 * which case the system preference wins and keeps winning if the user
 * changes it at the OS level. Storing "light" the first time someone lands
 * in light mode would silently pin them there forever.
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
var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.setAttribute("data-theme",d?"dark":"light");
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
