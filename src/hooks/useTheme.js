import { useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { ACCENT_COLORS, STORAGE_KEYS, THEME_MODES } from '../utils/constants.js';

function getSystemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.THEME, THEME_MODES.AUTO);
  const [accentId, setAccentId] = useLocalStorage(STORAGE_KEYS.ACCENT, ACCENT_COLORS[0].id);
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);

  const accent = ACCENT_COLORS.find((option) => option.id === accentId) ?? ACCENT_COLORS[0];
  const resolvedTheme = theme === THEME_MODES.AUTO ? (systemPrefersDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => setSystemPrefersDark(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const themedAccent = resolvedTheme === 'dark' ? accent.dark : accent.light;
    document.documentElement.style.setProperty('--color-primary', themedAccent.value);
    document.documentElement.style.setProperty('--color-primary-hover', themedAccent.hover);
  }, [accent, resolvedTheme]);

  return {
    theme,
    setTheme,
    resolvedTheme,
    accent,
    setAccentId,
    accentOptions: ACCENT_COLORS,
  };
}
