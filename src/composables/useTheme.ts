import { ref } from 'vue';

export type ThemeMode = 'light' | 'dark';

// Shared state — singleton
const currentTheme = ref<ThemeMode>(
  (localStorage.getItem('theme') as ThemeMode) ||
  ((window.matchMedia?.('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light')
);

// Apply theme class to <html> element
function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Initialize on load
applyTheme(currentTheme.value);

export function useTheme() {
  const theme = currentTheme;
  const isDark = () => currentTheme.value === 'dark';
  const isLight = () => currentTheme.value === 'light';

  const setTheme = (newTheme: ThemeMode) => {
    currentTheme.value = newTheme;
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme(currentTheme.value === 'light' ? 'dark' : 'light');
  };

  // Sync across tabs
  if (typeof window !== 'undefined') {
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-switch if user hasn't explicitly set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  return {
    theme,
    isDark,
    isLight,
    setTheme,
    toggleTheme
  };
}

export default useTheme;
