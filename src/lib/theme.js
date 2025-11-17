const THEME_STORAGE_KEY = "themePreference";
const DEFAULT_PREFERENCE = "system";
const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

function isBrowserEnvironment() {
  return typeof window !== "undefined";
}

function getSystemMediaQuery() {
  if (!isBrowserEnvironment() || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia(SYSTEM_DARK_QUERY);
}

function sanitizePreference(value) {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return DEFAULT_PREFERENCE;
}

export function loadThemePreference() {
  if (!isBrowserEnvironment()) {
    return DEFAULT_PREFERENCE;
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return sanitizePreference(stored);
}

function persistThemePreference(preference) {
  if (!isBrowserEnvironment()) {
    return;
  }
  window.localStorage.setItem(THEME_STORAGE_KEY, preference);
}

export function resolveTheme(preference) {
  if (preference === "dark" || preference === "light") {
    return preference;
  }

  const mediaQuery = getSystemMediaQuery();
  if (mediaQuery) {
    return mediaQuery.matches ? "dark" : "light";
  }

  return "light";
}

export function applyTheme(preference) {
  if (typeof document === "undefined") {
    return "light";
  }

  const resolvedTheme = resolveTheme(preference);
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.setAttribute("data-theme", resolvedTheme);
  root.setAttribute("data-theme-preference", preference);

  return resolvedTheme;
}

export function setThemePreference(preference) {
  const safePreference = sanitizePreference(preference);
  persistThemePreference(safePreference);
  return applyTheme(safePreference);
}

export function initializeTheme() {
  const preference = loadThemePreference();
  return applyTheme(preference);
}

export function subscribeToSystemTheme(callback) {
  const mediaQuery = getSystemMediaQuery();
  if (!mediaQuery) {
    return () => {};
  }

  const handler = (event) => {
    callback(event.matches ? "dark" : "light");
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }

  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}

export { THEME_STORAGE_KEY };

