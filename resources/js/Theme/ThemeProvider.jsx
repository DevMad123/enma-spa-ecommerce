import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import useCustomizations from '@/Hooks/useCustomizations';

const ThemeContext = createContext({ themeColor: '#23ad94' });

export const useTheme = () => useContext(ThemeContext);

function hexToRgb(hex) {
  if (!hex) return null;
  const h = hex.replace('#', '');
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return `${r} ${g} ${b}`;
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `${r} ${g} ${b}`;
  }
  return null;
}

export default function ThemeProvider({ children }) {
  const { customizations } = useCustomizations();
  const [themeColor, setThemeColor] = useState('#23ad94');

  useEffect(() => {
    const c = customizations?.theme_color || null;
    if (c && typeof c === 'string') {
      setThemeColor(c);
    }
  }, [customizations?.theme_color]);

  useEffect(() => {
    const root = document.documentElement;
    const rgb = hexToRgb(themeColor) || '35 173 148';
    root.style.setProperty('--theme-color', rgb);
    root.style.setProperty('--theme-color-hex', themeColor);
  }, [themeColor]);

  const value = useMemo(() => ({ themeColor }), [themeColor]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

