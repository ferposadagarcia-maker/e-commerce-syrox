"use client";

import { Suspense, useEffect, useLayoutEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { DEMO_EMAIL, DEMO_PASSWORD, validateDemoCredentials } from "@/lib/auth";

function LoginForm() {
  const { session, ready, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const nextPath =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("/login")
      ? rawNext
      : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && session) {
      router.replace(nextPath);
    }
  }, [ready, session, router, nextPath]);

  // Al ocultarse la página (p.ej. al navegar al panel por inicio de sesión o
  // cerrar sesión), React <Activity> la conserva en memoria. Limpiamos el
  // estado transitorio para que al volver a /login el formulario esté fresco.
  useLayoutEffect(() => {
    return () => {
      setSubmitting(false);
      setPassword("");
      setError(null);
    };
  }, []);

  if (!ready || session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setError(null);

    if (!email.trim() || !password) {
      setError("Correo y contraseña son obligatorios.");
      return;
    }

    setSubmitting(true);
    if (!validateDemoCredentials(email, password)) {
      setError("Las credenciales no coinciden. Revisa los datos de demostración.");
      setSubmitting(false);
      return;
    }

    login(email.trim().toLowerCase());
    // No dejamos `submitting` en true: la navegación no desmonta este
    // componente (Activity lo conserva), así que un valor pegado aquí
    // haría que al volver a /login el botón siguiera "Entrando...".
    setSubmitting(false);
    router.replace(nextPath);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-6 border rounded-lg p-6 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight font-[family-name:var(--font-space-grotesk)]">
            Iniciar sesión
          </h1>
          <p className="text-muted-foreground text-sm">
            Acceso al panel administrativo
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="login-email">
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className="h-10 w-full rounded-md border px-3 text-sm"
              placeholder="demo@syrox.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="login-password">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="h-10 w-full rounded-md border px-3 pr-10 text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={submitting}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="h-10 w-full rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Credenciales de demostración</p>
          <p>
            Correo: <span className="font-mono">{DEMO_EMAIL}</span>
          </p>
          <p>
            Contraseña: <span className="font-mono">{DEMO_PASSWORD}</span>
          </p>
          <p>
            Acceso simulado en el navegador. No es autenticación real ni protege
            los endpoints del servidor.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
