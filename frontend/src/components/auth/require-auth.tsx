"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!session) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [session, router, pathname]);

  const allowed = session !== null;

  return (
    <>
      <div
        aria-hidden={!allowed}
        className={allowed ? undefined : "pointer-events-none select-none invisible"}
      >
        {children}
      </div>
      {!allowed ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Comprobando acceso...</p>
        </div>
      ) : null}
    </>
  );
}
