"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CustomerOrdersPage() {
  return (
    <RequireAuth>
      <div className="container py-6 md:py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-7 w-7" />
            Lịch sử đơn hàng
          </h1>
          <p className="text-muted-foreground mt-1">
            Xem và theo dõi các đơn hàng của bạn
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng của bạn</CardTitle>
            <CardDescription>Danh sách đơn hàng đã mua</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">Chưa có đơn hàng nào</p>
            <p className="text-sm text-muted-foreground mb-6">
              Khi bạn mua sản phẩm, đơn hàng sẽ hiển thị tại đây.
            </p>
            <Button asChild>
              <Link href="/products" className="inline-flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Mua sản phẩm
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
