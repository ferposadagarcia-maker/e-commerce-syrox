import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { RequireAuth } from "@/components/auth/require-auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen grid md:grid-cols-[280px_1fr] grid-cols-1 bg-background">
        <Sidebar />
        <div className="flex flex-col min-h-screen">
          <Header />
          <DashboardShell>{children}</DashboardShell>
        </div>
      </div>
    </RequireAuth>
  );
}
