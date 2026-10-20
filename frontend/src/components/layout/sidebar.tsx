"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MoonLogo } from "@/components/branding/moon-logo";
import { NAV_ITEMS } from "@/components/layout/nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-20 items-center justify-center border-b border-sidebar-border px-6">
        <Link
          href="/dashboard"
          aria-label="Ir al dashboard de MÖÖN"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <MoonLogo dotClassName="fill-brand-deep" />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="px-3 pb-2 text-[0.6875rem] uppercase tracking-[0.28em] text-muted-foreground">
          Navegación
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                isActive && "bg-accent text-accent-foreground font-medium",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border px-6 py-4 text-[0.6875rem] uppercase tracking-[0.28em] text-muted-foreground">
        MÖÖN / Admin
      </div>
    </aside>
  );
}
