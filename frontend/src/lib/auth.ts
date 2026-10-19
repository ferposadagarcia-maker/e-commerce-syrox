export const DEMO_EMAIL = "demo@syrox.com";
export const DEMO_PASSWORD = "demo1234";

const STORAGE_KEY = "syrox.demo.session";

export interface DemoSession {
  email: string;
  loggedInAt: string;
}

export function validateDemoCredentials(
  email: string,
  password: string,
): boolean {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}

function parseSession(raw: string | null): DemoSession | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<DemoSession>;
    if (typeof parsed?.email !== "string") {
      return null;
    }
    return {
      email: parsed.email,
      loggedInAt:
        typeof parsed.loggedInAt === "string"
          ? parsed.loggedInAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function readSession(): DemoSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  return parseSession(window.localStorage.getItem(STORAGE_KEY));
}

export function writeSession(email: string): DemoSession {
  const session: DemoSession = {
    email,
    loggedInAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    notify();
  }
  return session;
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
    notify();
  }
}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeToSession(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

let cachedRaw: string | null = null;
let cachedSession: DemoSession | null = null;

export function getSessionSnapshot(): DemoSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSession = parseSession(raw);
  }
  return cachedSession;
}

export function getServerSnapshot(): DemoSession | null {
  return null;
}
