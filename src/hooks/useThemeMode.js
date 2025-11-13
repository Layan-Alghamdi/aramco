import { useEffect, useState } from "react";

export default function useThemeMode() {
  const getIsDark = () =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false;

  const [isDark, setIsDark] = useState(getIsDark);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const observer = new MutationObserver(() => {
      setIsDark(getIsDark());
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return isDark ? "dark" : "light";
}


