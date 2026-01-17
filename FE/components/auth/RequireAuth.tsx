"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";

interface RequireAuthProps {
  readonly children: React.ReactNode;
  readonly requiredRole?: "customer" | "seller" | "moderator" | "admin";
  readonly redirectTo?: string;
}

export function RequireAuth({
  children,
  requiredRole,
  redirectTo,
}: RequireAuthProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check token immediately (client-side only)
    if (globalThis.window === undefined) return;

    // First check if we have token in cookie or localStorage
    const hasToken = 
      globalThis.document.cookie.includes("accessToken=") || 
      globalThis.localStorage.getItem("accessToken") !== null;

    // If no token at all, redirect immediately without waiting
    if (!hasToken) {
      const currentPath = globalThis.window.location.pathname;
      router.replace(redirectTo || `/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // If we have token but not authenticated yet, wait a bit for auth check
    if (isLoading || !isAuthenticated) {
      // Give a small delay for auth state to initialize
      const timer = setTimeout(() => {
        // After delay, if still not authenticated, redirect
        const stillNotAuth = !useAuthStore.getState().isAuthenticated;
        if (stillNotAuth) {
          const currentPath = globalThis.window.location.pathname;
          router.replace(redirectTo || `/login?redirect=${encodeURIComponent(currentPath)}`);
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }

    // If authenticated but wrong role, redirect
    if (isAuthenticated && requiredRole && user?.role !== requiredRole) {
      switch (user?.role) {
        case "seller":
          router.replace("/seller");
          break;
        case "moderator":
        case "admin":
          router.replace("/moderator");
          break;
        default:
          router.replace("/customer");
          break;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo]);

  // If still loading, show nothing (will redirect if no auth)
  if (isLoading) {
    return null;
  }

  // Don't render anything if not authenticated or wrong role
  if (isAuthenticated && (!requiredRole || user?.role === requiredRole)) {
    return <>{children}</>;
  }

  return null;
}
