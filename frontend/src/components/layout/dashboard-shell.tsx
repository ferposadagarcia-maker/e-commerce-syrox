import type { ReactNode } from "react";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-w-0 flex-1 overflow-x-hidden p-5 md:p-8">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </main>
  );
}
