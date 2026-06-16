'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem('httppilot-theme') as Theme) ?? 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--bg-base', '#0a0a0a');
      root.style.setProperty('--bg-panel', '#111111');
      root.style.setProperty('--bg-elevated', '#1a1a1a');
      root.style.setProperty('--bg-hover', '#222222');
      root.style.setProperty('--border', '#2a2a2a');
      root.style.setProperty('--border-subtle', '#1f1f1f');
      root.style.setProperty('--text-primary', '#ededed');
      root.style.setProperty('--text-secondary', '#888888');
      root.style.setProperty('--text-muted', '#555555');
      root.style.setProperty('--accent', '#0070f3');
      root.style.setProperty('--accent-hover', '#0060d3');
      root.style.setProperty('--accent-glow', 'rgba(0,112,243,0.15)');
      root.style.setProperty('--success', '#22c55e');
      root.style.setProperty('--error', '#ef4444');
      root.style.setProperty('--warning', '#f59e0b');
      root.style.setProperty('--canvas', '#111111');
      root.style.setProperty('--canvas-soft', '#0a0a0a');
      root.style.setProperty('--hairline', '#2a2a2a');
      root.style.setProperty('--ink', '#ededed');
      root.style.setProperty('--body', '#888888');
      root.style.setProperty('--mute', '#555555');
    } else {
      root.style.setProperty('--bg-base', '#fafafa');
      root.style.setProperty('--bg-panel', '#ffffff');
      root.style.setProperty('--bg-elevated', '#f5f5f5');
      root.style.setProperty('--bg-hover', '#fafafa');
      root.style.setProperty('--border', '#ebebeb');
      root.style.setProperty('--border-subtle', '#f5f5f5');
      root.style.setProperty('--text-primary', '#171717');
      root.style.setProperty('--text-secondary', '#4d4d4d');
      root.style.setProperty('--text-muted', '#888888');
      root.style.setProperty('--accent', '#0070f3');
      root.style.setProperty('--accent-hover', '#0761d1');
      root.style.setProperty('--accent-glow', 'rgba(0,112,243,0.1)');
      root.style.setProperty('--success', '#0070f3');
      root.style.setProperty('--error', '#ee0000');
      root.style.setProperty('--warning', '#f5a623');
      root.style.setProperty('--canvas', '#ffffff');
      root.style.setProperty('--canvas-soft', '#fafafa');
      root.style.setProperty('--hairline', '#ebebeb');
      root.style.setProperty('--ink', '#171717');
      root.style.setProperty('--body', '#4d4d4d');
      root.style.setProperty('--mute', '#888888');
    }
    localStorage.setItem('httppilot-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);