"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store, CheckCircle, AlertCircle } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { shopService } from "@/lib/services/shop.service";

export default function BecomeSellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    shopName: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await shopService.createShop({
        shopName: formData.shopName.trim(),
        description: formData.description.trim() || undefined,
      });

      router.push("/customer/seller-application-status");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi đăng ký làm người bán hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Store className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Đăng ký làm người bán hàng</CardTitle>
                  <CardDescription>
                    Điền thông tin để đăng ký làm người bán hàng. Đơn đăng ký của bạn sẽ được
                    moderator xem xét và duyệt.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="shopName">
                    Tên shop <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="shopName"
                    value={formData.shopName}
                    onChange={(e) =>
                      setFormData({ ...formData, shopName: e.target.value })
                    }
                    placeholder="Nhập tên shop của bạn"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                  <p className="text-sm text-muted-foreground">
                    Tên shop phải có từ 2 đến 100 ký tự
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả shop (tùy chọn)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Mô tả về shop của bạn..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.description.length}/500 ký tự
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Quy trình duyệt đơn đăng ký
                      </p>
                      <ul className="text-sm text-blue-800 mt-1 space-y-1 list-disc list-inside">
                        <li>Sau khi gửi đơn, moderator sẽ xem xét thông tin shop của bạn</li>
                        <li>Bạn có thể xem trạng thái đơn đăng ký tại trang "Trạng thái đơn đăng ký"</li>
                        <li>Khi được duyệt, bạn sẽ có quyền bán hàng và quản lý shop</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Gửi đơn đăng ký"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}
