"use client";

import { Suspense, useEffect, useLayoutEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { MoonLogo } from "@/components/branding/moon-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { validateDemoCredentials } from "@/lib/auth";

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
      setError("Las credenciales no son correctas.");
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Panel izquierdo — editorial */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-brand-deep p-12 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full border border-white/10"
        />

        <MoonLogo showTagline className="relative" />

        <div className="relative max-w-md space-y-6">
          <p className="font-heading text-4xl font-medium leading-[1.1] tracking-tight">
            Diseño para moverte a tu manera.
          </p>
          <p className="text-sm leading-relaxed text-white/90">
            Una colección de calzado contemporáneo que combina estilo, comodidad
            y personalidad.
          </p>
        </div>

        <div className="relative flex items-center justify-between text-[0.6875rem] uppercase tracking-[0.28em] text-white/80">
          <span>MÖÖN — CONTEMPORARY FOOTWEAR</span>
        </div>
      </aside>

      {/* Panel derecho — formulario */}
      <section className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="absolute right-6 top-6 sm:right-10 sm:top-10">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden">
            <MoonLogo showTagline dotClassName="fill-brand-deep" />
          </div>

          <div className="space-y-2">
            <p className="text-[0.6875rem] uppercase tracking-[0.32em] text-muted-foreground">
              Acceso
            </p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Iniciar sesión
            </h1>
            <p className="text-sm text-muted-foreground">
              Accede al panel de administración de MÖÖN.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                htmlFor="login-email"
              >
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                placeholder="demo@syrox.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium"
                htmlFor="login-password"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="h-11 w-full rounded-md border border-input bg-card px-3 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
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
              className="h-11 w-full rounded-md bg-primary text-primary-foreground text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </section>
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
