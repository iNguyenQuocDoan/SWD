"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth";
import { authService } from "@/lib/services/auth.service";
import { apiClient } from "@/lib/api";
import type { User } from "@/types";

/**
 * Decode JWT payload (không verify, chỉ lấy payload).
 * BE access token: { userId, email, roleKey }.
 */
function decodeJwtPayload(token: string): { userId?: string; email?: string; roleKey?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    ) as { userId?: string; email?: string; roleKey?: string };
    return payload;
  } catch {
    return null;
  }
}

function mapRoleKey(roleKey: string): "customer" | "seller" | "moderator" | "admin" {
  const m: Record<string, "customer" | "seller" | "moderator" | "admin"> = {
    CUSTOMER: "customer",
    SELLER: "seller",
    MODERATOR: "moderator",
    ADMIN: "admin",
  };
  return m[roleKey] ?? "customer";
}

/**
 * Tạo user tối thiểu từ JWT khi getMe thất bại.
 * Giúp không bị redirect về /login khi chuyển trang (token vẫn hợp lệ).
 */
function minimalUserFromJwt(payload: { userId: string; email: string; roleKey?: string }): User {
  const now = new Date();
  return {
    id: payload.userId,
    roleId: payload.userId,
    email: payload.email,
    name: payload.email,
    role: mapRoleKey(payload.roleKey ?? "CUSTOMER"),
    emailVerified: false,
    trustLevel: "new",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Auth Provider - Kiểm tra đăng nhập khi load app.
 * Nếu getMe lỗi nhưng có token hợp lệ: dùng JWT decode để set user tối thiểu,
 * tránh bị đẩy về /login khi ấn sang trang khác.
 */
export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  useEffect(() => {
    const checkAuth = async (retryCount = 0) => {
      try {
        await authService.getMe();
      } catch (error: any) {
        // Kiểm tra cookie trước khi quyết định
        const hasCookie = typeof globalThis.window !== "undefined" && 
                         globalThis.document.cookie.includes("accessToken=");
        const hasLocalStorage = !!globalThis.localStorage?.getItem("accessToken");
        
        // Nếu không còn cookie và localStorage, clear auth state
        if (!hasCookie && !hasLocalStorage) {
          apiClient.clearToken();
          useAuthStore.getState().setUser(null);
          return;
        }
        
        // Nếu lỗi là 304 Not Modified và chưa retry, retry với timestamp mới
        const is304 = error?.response?.status === 304 || 
                     error?.message?.includes("304 Not Modified");
        
        if (is304 && retryCount < 2 && (hasCookie || hasLocalStorage)) {
          // Retry với timestamp mới để bypass cache
          setTimeout(() => {
            checkAuth(retryCount + 1);
          }, 100);
          return;
        }
        
        // Nếu đã retry hoặc không phải 304, dùng JWT fallback
        const token = globalThis.localStorage?.getItem("accessToken");
        const payload = token ? decodeJwtPayload(token) : null;
        if (payload?.userId && payload?.email) {
          useAuthStore.getState().setUser(
            minimalUserFromJwt({ userId: payload.userId, email: payload.email, roleKey: payload.roleKey })
          );
        } else {
          apiClient.clearToken();
          useAuthStore.getState().setUser(null);
        }
      }
    };

    const hasToken =
      typeof globalThis.window !== "undefined" &&
      (globalThis.document.cookie.includes("accessToken=") ||
        !!globalThis.localStorage?.getItem("accessToken"));

    if (hasToken) {
      checkAuth();
    } else {
      useAuthStore.getState().setUser(null);
    }

    // Kiểm tra cookie định kỳ để phát hiện khi cookie bị xóa
    const checkCookieInterval = setInterval(() => {
      if (typeof globalThis.window === "undefined") return;
      
      const hasCookie = globalThis.document.cookie.includes("accessToken=");
      const hasLocalStorage = !!globalThis.localStorage?.getItem("accessToken");
      const { isAuthenticated } = useAuthStore.getState();
      
      // Nếu đang authenticated nhưng không còn cookie và localStorage
      if (isAuthenticated && !hasCookie && !hasLocalStorage) {
        // Cookie đã bị xóa - đăng xuất ngay
        apiClient.clearToken();
        useAuthStore.getState().setUser(null);
      }
    }, 1000); // Kiểm tra mỗi giây

    return () => {
      clearInterval(checkCookieInterval);
    };
  }, []);

  return <>{children}</>;
}
