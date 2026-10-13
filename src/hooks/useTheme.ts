import { useCallback, useEffect, useState } from "react";

const KEY = "spectra.theme";

/** Dark/light theme with a persisted preference and an in-sync <html> class. */
export function useTheme() {
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", dark ? "#0a0a12" : "#f9f9fc");
    try {
      localStorage.setItem(KEY, dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [dark]);

  const toggle = useCallback(() => setDark((d) => !d), []);
  return { dark, toggle };
}
