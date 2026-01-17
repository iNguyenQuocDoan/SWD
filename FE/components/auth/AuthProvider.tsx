"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth";
import { authService } from "@/lib/services/auth.service";

/**
 * Auth Provider - Checks authentication on app load
 * This ensures auth state is initialized before pages render
 */
export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        // Try to get current user info
        await authService.getMe();
        // User is authenticated, state is already set by getMe
      } catch {
        // Not authenticated or error - clear state
        useAuthStore.getState().setUser(null);
      }
    };

    // Only check if we have a token
    const hasToken = 
      typeof globalThis.window !== "undefined" && 
      (globalThis.document.cookie.includes("accessToken=") || 
       globalThis.localStorage.getItem("accessToken"));

    if (hasToken) {
      checkAuth();
    } else {
      // No token, set loading to false immediately
      useAuthStore.getState().setUser(null);
    }
  }, []);

  return <>{children}</>;
}
