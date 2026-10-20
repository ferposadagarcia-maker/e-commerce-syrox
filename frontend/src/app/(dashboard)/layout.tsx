import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RequireAuth } from "@/components/auth/require-auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="grid min-h-screen grid-cols-1 bg-background md:grid-cols-[272px_1fr]">
        <Sidebar />
        <div className="flex min-h-screen min-w-0 flex-col">
          <Header />
          <DashboardShell>{children}</DashboardShell>
        </div>
      </div>
    </RequireAuth>
  );
}
