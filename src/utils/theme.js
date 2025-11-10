const THEME_STORAGE_KEY = "theme";

function getSystemPreference() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getStoredTheme() {
  if (typeof window === "undefined") return "system";
  return window.localStorage.getItem(THEME_STORAGE_KEY) || "system";
}

export function applyTheme(theme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const resolved = theme === "system" ? getSystemPreference() : theme;

  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  root.style.colorScheme = resolved;
}

export function setTheme(theme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}

export function initializeTheme() {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  applyTheme(getStoredTheme());

  const handleChange = () => {
    if (getStoredTheme() === "system") {
      applyTheme("system");
    }
  };

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", handleChange);
  } else if (typeof media.addListener === "function") {
    media.addListener(handleChange);
  }

  return () => {
    if (typeof media.removeEventListener === "function") {
      media.removeEventListener("change", handleChange);
    } else if (typeof media.removeListener === "function") {
      media.removeListener(handleChange);
    }
  };
}


