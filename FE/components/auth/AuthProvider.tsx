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
    const checkAuth = async () => {
      try {
        await authService.getMe();
      } catch {
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
  }, []);

  return <>{children}</>;
}
