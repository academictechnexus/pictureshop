// src/contexts/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem("ff_theme") === "dark");

  useEffect(() => {
    localStorage.setItem("ff_theme", dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const toggle = () => setDark((d) => !d);
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

// CSS variables injected globally — dark mode overrides
export const themeStyles = `
  :root {
    --bg: #faf7f2;
    --surface: #ffffff;
    --border: #e5ddd5;
    --ink: #1a1410;
    --muted: #8a7e75;
    --rose: #c4715a;
    --rose-light: #fde9d4;
    --sage: #7a9e87;
    --gold: #c9a84c;
    --nav: #1a1410;
  }
  [data-theme="dark"] {
    --bg: #0f0d0b;
    --surface: #1c1814;
    --border: #2e2820;
    --ink: #f0ebe4;
    --muted: #7a6e65;
    --rose: #d4836a;
    --rose-light: #2a1a14;
    --sage: #8ab09a;
    --gold: #d4b86a;
    --nav: #0f0d0b;
  }
  body { background: var(--bg); color: var(--ink); transition: background 0.2s, color 0.2s; }
`;
