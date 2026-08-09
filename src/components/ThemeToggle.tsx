import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

/* ==========================================================================
   Theme
   The choice persists under kawach.theme — deliberately inside the panic
   prefix, so "Erase everything" returns the device to a clean slate.
   Until the user chooses, the OS preference is followed live.
   ========================================================================== */

const KEY = 'kawach.theme';
const THEME_COLOR = { light: '#F5F3EC', dark: '#131619' } as const;

type Theme = keyof typeof THEME_COLOR;

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage blocked — fall through to the OS preference.
  }
  return 'dark';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[theme]);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // No explicit choice yet → keep following the OS setting.
  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) =>
      setTheme(e.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  function toggle() {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(KEY, next);
      } catch {
        // Storage blocked — the toggle still works for this session.
      }
      return next;
    });
  }

  return { theme, toggle };
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { language } = useLanguage();
  const dark = theme === 'dark';
  const label = language === 'ne'
    ? dark ? 'उज्यालो मोडमा बदल्नुहोस्' : 'अँध्यारो मोडमा बदल्नुहोस्'
    : dark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
