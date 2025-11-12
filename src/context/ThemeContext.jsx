import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { applyTheme, getStoredTheme } from "@/utils/theme";

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = "theme";

function getSystemPreference() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme) {
  return theme === "system" ? getSystemPreference() : theme;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => getStoredTheme());
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(getStoredTheme()));

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    applyTheme(theme);
    setResolvedTheme(resolveTheme(theme));
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return undefined;
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setResolvedTheme(resolveTheme("system"));

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
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark: resolvedTheme === "dark",
      setTheme: setThemeState
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
