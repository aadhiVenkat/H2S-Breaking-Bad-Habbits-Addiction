"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

const PUBLIC_ROUTES = new Set(["/", "/login"]);

/**
 * Redirects unauthenticated users to /login for all non-public routes.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, session } = useAuth();

  const isPublic = PUBLIC_ROUTES.has(pathname);
  const needsLogin = ready && !isPublic && !session;

  useEffect(() => {
    if (needsLogin) {
      router.replace("/login");
    }
  }, [needsLogin, router]);

  if (!ready && !isPublic) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-foreground-muted">
        Loading…
      </div>
    );
  }

  if (needsLogin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-foreground-muted">
        Redirecting to login…
      </div>
    );
  }

  return <>{children}</>;
}
