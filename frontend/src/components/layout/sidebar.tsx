"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Package, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoonLogo } from "@/components/branding/moon-logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/categories", label: "Categorías", icon: List },
  { href: "/products", label: "Productos", icon: Package },
  { href: "/sales", label: "Ventas", icon: ShoppingCart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col border-r bg-background">
      <div className="flex h-16 items-center px-6 border-b">
        <MoonLogo dotClassName="fill-brand-deep" />
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground font-medium"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
