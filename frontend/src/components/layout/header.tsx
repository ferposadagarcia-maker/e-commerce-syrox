import { Menu } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <button className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground">
        <Menu className="h-4 w-4" />
      </button>
      <div className="flex-1" />
      <div className="text-sm text-muted-foreground">Administración</div>
    </header>
  );
}
