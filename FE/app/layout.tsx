import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RoleRedirect } from "@/components/auth/RoleRedirect";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digital Marketplace - Sàn thương mại sản phẩm số",
  description:
    "Nền tảng mua bán license key, subscription và sản phẩm số uy tín",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <RoleRedirect publicRoutes={["/products", "/categories", "/sellers", "/login", "/register"]}>
            <ConditionalLayout>{children}</ConditionalLayout>
          </RoleRedirect>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
