"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  const { logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="flex h-20 items-center gap-3 border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground md:px-6">
      <MobileNav />
      <div className="flex-1" />
      <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
        Admin
      </span>
      <ThemeToggle />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon-lg"
              aria-label="Cerrar sesión"
              onClick={handleLogout}
            />
          }
        >
          <LogOut className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>Cerrar sesión</TooltipContent>
      </Tooltip>
    </header>
  );
}
