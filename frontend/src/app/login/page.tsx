export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-4 border rounded-lg p-6 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
          <p className="text-muted-foreground text-sm">Acceso al panel administrativo</p>
        </div>
        <div className="space-y-3">
          <input placeholder="Email" className="h-10 w-full rounded-md border px-3 text-sm" />
          <input placeholder="Contraseña" type="password" className="h-10 w-full rounded-md border px-3 text-sm" />
          <button className="h-10 w-full rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90">
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
