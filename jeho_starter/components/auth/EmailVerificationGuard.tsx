"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/contexts/auth-context";

const ALLOWED_PATHS = [
  "/auth/verify-email",
  "/auth/accept-terms",
  "/auth/login",
  "/auth/signup",
];

export function EmailVerificationGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isLoggedIn || !user) return;
    if (user.is_verified || user.isVerified) return;
    if (ALLOWED_PATHS.some((p) => pathname?.startsWith(p))) return;
    router.replace("/auth/verify-email");
  }, [isLoading, isLoggedIn, user, pathname, router]);

  return <>{children}</>;
}
