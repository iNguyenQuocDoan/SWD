"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Shield,
  Star,
  CheckCircle,
  AlertCircle,
  Copy,
  Lock,
  Clock,
  Package,
  User,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

// Mock data - sẽ thay thế bằng API call
// Product structure theo context mới
const mockProduct = {
  id: "1",
  title: "Netflix Premium - Gói gia đình",
  platform: "Netflix",
  planType: "Gia đình",
  durationDays: 90,
  durationLabel: "3 tháng",
  price: 299000,
  description: `Gói Netflix Premium gia đình cho phép xem đồng thời trên 4 thiết bị với độ phân giải 4K Ultra HD. Phù hợp cho gia đình có nhiều thành viên.

Tính năng:
- Xem không giới hạn trên TV, điện thoại, máy tính
- Tải xuống để xem offline
- 4K Ultra HD & HDR
- Xem đồng thời trên 4 thiết bị
- Không quảng cáo`,
  warranty: "Bảo hành 7 ngày - Hoàn tiền 100% nếu không sử dụng được hoặc bị thu hồi sớm",
  howToUse: `Hướng dẫn sử dụng:
1. Sau khi nhận thông tin đăng nhập (account/link/code/QR), truy cập netflix.com
2. Đăng nhập với thông tin đã nhận hoặc quét QR code
3. Thay đổi mật khẩu nếu cần (khuyến nghị)
4. Bắt đầu xem phim yêu thích của bạn

Lưu ý: Không chia sẻ thông tin đăng nhập với người khác để tránh bị thu hồi.`,
  soldCount: 1234,
  inventoryCount: 50,
  inStock: true,
  status: "approved",
  shopId: "1",
  shop: {
    id: "1",
    name: "NetflixStore Official",
    avatar: null,
    rating: 4.9,
    listingCount: 156,
    soldCount: 5234,
    responseRate: 98,
    joinedDate: "2023-01-15",
    isVerified: true,
    trustLevel: "Trusted",
    status: "active", // pending | active | suspended | closed
  },
};

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thêm vào giỏ hàng", {
        action: {
          label: "Đăng nhập",
          onClick: () => router.push(`/login?redirect=/products/${params.id}`),
        },
      });
      return;
    }
    // TODO: Implement add to cart
    toast.success("Đã thêm vào giỏ hàng");
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${params.id}`);
      return;
    }
    if (!mockProduct.inStock) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }
    router.push(`/checkout?product=${params.id}&quantity=${quantity}`);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
      <div className="grid lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Product Header */}
          <div className="space-y-5 md:space-y-6">
            {/* Platform & Badges */}
            <div className="flex gap-2 md:gap-3 flex-wrap items-center">
              <Badge variant="default" className="text-base px-3 py-1.5">
                {mockProduct.platform}
              </Badge>
              <Badge variant="secondary" className="text-base px-3 py-1.5">{mockProduct.planType}</Badge>
              <Badge variant="outline" className="text-base px-3 py-1.5">{mockProduct.durationLabel}</Badge>
              {mockProduct.inStock ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-base px-3 py-1.5">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Còn hàng
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-base px-3 py-1.5">Hết hàng</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {mockProduct.title}
            </h1>

            {/* Stats */}
            <div className="flex items-center gap-3 md:gap-4 flex-wrap text-base">
              <span className="text-muted-foreground">
                Đã bán: <span className="font-semibold text-foreground">{mockProduct.soldCount.toLocaleString()}</span>
              </span>
              {mockProduct.inventoryCount > 0 && (
                <>
                  <Separator orientation="vertical" className="h-5" />
                  <span className="text-muted-foreground">
                    Còn lại: <span className="font-semibold text-foreground">{mockProduct.inventoryCount}</span> gói trong kho
                  </span>
                </>
              )}
              <Separator orientation="vertical" className="h-5" />
              <span className="text-muted-foreground">
                Thời hạn: <span className="font-semibold text-foreground">{mockProduct.durationLabel}</span> ({mockProduct.durationDays} ngày)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
                {formatPrice(mockProduct.price)}
              </span>
            </div>

            {/* Delivery Info */}
            <Alert variant="info" className="mt-4">
              <AlertIcon.info className="h-5 w-5" />
              <AlertDescription className="text-base">
                <strong>Giao hàng số tức thì</strong> - Nhận thông tin đăng nhập (account/link/code/QR) ngay sau khi thanh toán thành công
              </AlertDescription>
            </Alert>
          </div>

          {/* Variant Selection */}
          {!selectedVariant && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">Chọn biến thể</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-14 text-base"
                    onClick={() => setSelectedVariant("3months")}
                  >
                    <Package className="h-5 w-5 mr-3" />
                    3 tháng - {formatPrice(299000)}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-14 text-base"
                    onClick={() => setSelectedVariant("1year")}
                  >
                    <Package className="h-5 w-5 mr-3" />
                    1 năm - {formatPrice(999000)}
                    <Badge variant="secondary" className="ml-auto text-sm">
                      Tiết kiệm 25%
                    </Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-12 md:h-14">
              <TabsTrigger value="description" className="text-sm md:text-base">Mô tả</TabsTrigger>
              <TabsTrigger value="warranty" className="text-sm md:text-base">Bảo hành</TabsTrigger>
              <TabsTrigger value="howToUse" className="text-sm md:text-base">Hướng dẫn sử dụng</TabsTrigger>
              <TabsTrigger value="reviews" className="text-sm md:text-base">Đánh giá shop</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4 mt-6 md:mt-8">
              <div className="prose max-w-none">
                <p className="text-base md:text-lg text-muted-foreground whitespace-pre-line leading-relaxed">
                  {mockProduct.description}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="warranty" className="space-y-4 mt-6 md:mt-8">
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 md:h-7 md:w-7 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-lg md:text-xl mb-2">Chính sách bảo hành</p>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      {mockProduct.warranty}
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground mt-3 leading-relaxed">
                      Nếu gặp vấn đề (sai gói, không dùng được, bị thu hồi sớm), bạn có thể tạo Support Ticket để được xử lý đổi hàng/hoàn tiền.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <HelpCircle className="h-6 w-6 md:h-7 md:w-7 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-lg md:text-xl mb-2">Khiếu nại & hỗ trợ</p>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      Tạo Support Ticket gắn với OrderItem ngay trong đơn hàng nếu gặp vấn đề. Moderator/Admin sẽ xử lý dựa trên bằng chứng giao hàng.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="howToUse" className="space-y-4 mt-6 md:mt-8">
              <div className="prose max-w-none">
                <p className="text-base md:text-lg text-muted-foreground whitespace-pre-line leading-relaxed">
                  {mockProduct.howToUse}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có đánh giá</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Sẽ hiển thị đánh giá từ khách hàng sau khi họ mua và sử dụng sản phẩm
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Shop Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-3">
                <User className="h-6 w-6 md:h-7 md:w-7" />
                Thông tin Shop
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 md:space-y-6">
              <Link
                href={`/shops/${mockProduct.shop.id}`}
                className="flex items-center gap-4 hover:bg-muted/50 p-3 md:p-4 rounded-lg transition-colors"
              >
                <Avatar className="h-12 w-12 md:h-14 md:w-14">
                  <AvatarFallback className="text-lg md:text-xl">
                    {mockProduct.shop.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <p className="font-semibold text-base md:text-lg">{mockProduct.shop.name}</p>
                    {mockProduct.shop.isVerified && (
                      <Badge variant="secondary" className="text-sm px-2.5 py-1">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Đã xác minh
                      </Badge>
                    )}
                    <Badge 
                      variant={mockProduct.shop.status === "active" ? "default" : "secondary"}
                      className="text-sm px-2.5 py-1"
                    >
                      {mockProduct.shop.status === "active" ? "Hoạt động" : mockProduct.shop.status}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-sm bg-green-50 mt-2 px-2.5 py-1">
                    {mockProduct.shop.trustLevel}
                  </Badge>
                </div>
              </Link>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-base">
                <div>
                  <p className="text-muted-foreground mb-2">Sản phẩm</p>
                  <p className="font-semibold text-lg md:text-xl">{mockProduct.shop.listingCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Đã bán</p>
                  <p className="font-semibold text-lg md:text-xl">
                    {mockProduct.shop.soldCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Đánh giá</p>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 md:h-6 md:w-6 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-lg md:text-xl">{mockProduct.shop.rating}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Phản hồi</p>
                  <p className="font-semibold text-lg md:text-xl">{mockProduct.shop.responseRate}%</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-11 md:h-12 text-base" asChild>
                  <Link href={`/shops/${mockProduct.shop.id}`}>
                    Xem shop
                  </Link>
                </Button>
                <Button variant="outline" size="icon" className="h-11 w-11 md:h-12 md:w-12" asChild>
                  <Link href={`/shops/${mockProduct.shop.id}/chat`}>
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Purchase Card */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Mua ngay</CardTitle>
              <CardDescription className="text-base">
                Thanh toán an toàn với escrow - Tiền được giữ đến khi bạn nhận hàng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 md:space-y-6">
              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-base md:text-lg font-medium">Số lượng</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <span className="text-xl">-</span>
                  </Button>
                  <span className="w-16 text-center font-semibold text-lg md:text-xl">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={
                      mockProduct.inventoryCount
                        ? quantity >= mockProduct.inventoryCount
                        : false
                    }
                  >
                    <span className="text-xl">+</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Price Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-base md:text-lg">
                  <span className="text-muted-foreground">Đơn giá:</span>
                  <span className="font-semibold">
                    {formatPrice(mockProduct.price)}
                  </span>
                </div>
                <div className="flex justify-between text-base md:text-lg">
                  <span className="text-muted-foreground">Số lượng:</span>
                  <span className="font-semibold">{quantity}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg md:text-xl font-bold pt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-primary text-2xl md:text-3xl">
                    {formatPrice(mockProduct.price * quantity)}
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full h-12 md:h-14 text-base md:text-lg"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={!mockProduct.inStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {mockProduct.inStock ? "Mua ngay" : "Hết hàng"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 md:h-14 text-base md:text-lg"
                  onClick={handleAddToCart}
                  disabled={!mockProduct.inStock}
                >
                  Thêm vào giỏ hàng
                </Button>
              </div>

              {!mockProduct.inStock && (
                <Alert variant="warning">
                  <AlertIcon.warning className="h-5 w-5" />
                  <AlertDescription className="text-base">
                    Sản phẩm tạm thời hết hàng. Vui lòng quay lại sau.
                  </AlertDescription>
                </Alert>
              )}

              {/* Security Info */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm md:text-base">
                <p className="flex items-center gap-3">
                  <Shield className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
                  Thanh toán an toàn với escrow
                </p>
                <p className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                  Giao hàng tức thì sau thanh toán
                </p>
                <p className="flex items-center gap-3">
                  <Lock className="h-4 w-4 md:h-5 md:w-5 text-orange-500 flex-shrink-0" />
                  Bảo mật thông tin đăng nhập
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

