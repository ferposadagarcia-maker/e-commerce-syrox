export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "moon.theme";

export function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(): Theme {
  return readStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function writeTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  notify();
}

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMediaChange = () => {
    // Solo reaccionamos a cambios del sistema si no hay preferencia guardada.
    if (!readStoredTheme()) {
      applyTheme(getSystemTheme());
      listener();
    }
  };
  media.addEventListener("change", onMediaChange);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
    media.removeEventListener("change", onMediaChange);
  };
}

let cachedRaw: string | null = null;
let cachedTheme: Theme = "light";

export function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return "light";
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedTheme = resolveTheme();
  }
  return cachedTheme;
}

export function getServerThemeSnapshot(): Theme {
  return "light";
}
