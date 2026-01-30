"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSellerSchema, createShopSchema, type RegisterSellerInput, type CreateShopInput } from "@/lib/validations";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Store, User, Clock, CheckCircle, XCircle, AlertCircle, Calendar, MessageSquare, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { authService } from "@/lib/services/auth.service";
import { shopService, Shop } from "@/lib/services/shop.service";
import { Textarea } from "@/components/ui/textarea";

function RegisterSellerContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingShop, setIsCheckingShop] = useState(true);
  const [existingShop, setExistingShop] = useState<Shop | null>(null);
  const [showReregisterForm, setShowReregisterForm] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if coming from reregister link
  const isReregisterMode = searchParams.get("reregister") === "true";

  // Nếu đã đăng nhập, chỉ cần form tạo shop đơn giản
  const isLoggedIn = isAuthenticated && user;

  // Kiểm tra xem user đã có shop chưa
  useEffect(() => {
    const checkExistingShop = async () => {
      if (isLoggedIn) {
        try {
          setIsCheckingShop(true);
          const shop = await shopService.getMyShop();
          setExistingShop(shop);

          // Auto show form if reregister mode and shop is Closed
          if (isReregisterMode && shop?.status === "Closed") {
            setShowReregisterForm(true);
          }
        } catch (error) {
          console.error("Error checking existing shop:", error);
          setExistingShop(null);
        } finally {
          setIsCheckingShop(false);
        }
      } else {
        setIsCheckingShop(false);
      }
    };

    checkExistingShop();
  }, [isLoggedIn, isReregisterMode]);

  // Dùng schema khác nhau tùy vào trạng thái đăng nhập
  const sellerForm = useForm<RegisterSellerInput>({
    resolver: zodResolver(registerSellerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      shopName: "",
      description: "",
    },
  });

  const shopForm = useForm<CreateShopInput>({
    resolver: zodResolver(createShopSchema),
    defaultValues: {
      shopName: "",
      description: "",
    },
  });

  // Pre-fill form with old shop data when reregistering
  useEffect(() => {
    if (showReregisterForm && existingShop && existingShop.status === "Closed") {
      shopForm.setValue("shopName", existingShop.shopName);
      shopForm.setValue("description", existingShop.description || "");
    }
  }, [showReregisterForm, existingShop, shopForm]);

  // Type assertion để TypeScript hiểu
  const form = (isLoggedIn ? shopForm : sellerForm) as typeof sellerForm;

  const onSubmit = async (data: RegisterSellerInput | CreateShopInput) => {
    setIsLoading(true);
    try {
      if (isLoggedIn && user) {
        // Trường hợp 1: User đã đăng nhập → Chỉ tạo Shop mới (hoặc đăng ký lại)
        const shopData = data as CreateShopInput;

        await shopService.createShop({
          shopName: shopData.shopName,
          description: shopData.description || undefined,
        });

        const message = existingShop?.status === "Closed"
          ? "Đăng ký lại thành công! Shop đang chờ phê duyệt."
          : "Tạo shop thành công! Shop đang chờ phê duyệt.";

        toast.success(message);

        // Reset state and reload to show pending status
        setShowReregisterForm(false);
        window.location.href = "/seller/register";
      } else {
        // Trường hợp 2: Chưa đăng nhập → Tạo User + Shop cùng lúc
        const sellerData = data as RegisterSellerInput;

        await authService.registerSeller({
          email: sellerData.email,
          password: sellerData.password,
          fullName: sellerData.name,
          shopName: sellerData.shopName,
          description: sellerData.description || null,
        });

        toast.success(
          "Đăng ký seller thành công! Shop của bạn đang chờ phê duyệt. Vui lòng đăng nhập để tiếp tục."
        );
        router.push("/login");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error?.message || "Đăng ký thất bại. Vui lòng thử lại.";

      if (errorMessage.includes("already has a shop") || errorMessage.includes("đã có shop")) {
        toast.error(
          "Bạn đã có shop. Vui lòng kiểm tra trạng thái shop của bạn.",
          {
            action: {
              label: "Xem trạng thái",
              onClick: () => router.push("/seller/register"),
            },
          }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getShopStatusBadge = (status: Shop["status"]) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="secondary" className="text-sm">
            <Clock className="mr-1 h-3 w-3" />
            Chờ duyệt
          </Badge>
        );
      case "Active":
        return (
          <Badge variant="default" className="text-sm bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Hoạt động
          </Badge>
        );
      case "Suspended":
        return (
          <Badge variant="destructive" className="text-sm">
            <AlertCircle className="mr-1 h-3 w-3" />
            Tạm ngưng
          </Badge>
        );
      case "Closed":
        return (
          <Badge variant="outline" className="text-sm border-red-300 text-red-600">
            <XCircle className="mr-1 h-3 w-3" />
            Bị từ chối
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Loading state khi đang kiểm tra shop
  if (isLoggedIn && isCheckingShop) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-200px)] py-10 md:py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2">
            <Skeleton className="h-10 w-10 rounded-full mx-auto" />
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========== TRƯỜNG HỢP: Shop bị từ chối (Closed) - Hiển thị trạng thái và option đăng ký lại ==========
  if (isLoggedIn && existingShop && existingShop.status === "Closed" && !showReregisterForm) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-200px)] py-10 md:py-16">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-3 justify-center">
              <XCircle className="h-8 w-8 md:h-10 md:w-10 text-red-500" />
              <CardTitle className="text-2xl md:text-3xl text-center">
                Đơn đăng ký bị từ chối
              </CardTitle>
            </div>
            <CardDescription className="text-center text-base">
              Đơn đăng ký bán hàng của bạn đã bị từ chối. Vui lòng xem chi tiết bên dưới.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Shop Info cũ */}
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{existingShop.shopName}</h3>
                {getShopStatusBadge(existingShop.status)}
              </div>
              {existingShop.description && (
                <p className="text-sm text-muted-foreground">{existingShop.description}</p>
              )}
            </div>

            {/* Lý do từ chối - Nổi bật */}
            {existingShop.moderatorNote && (
              <Alert variant="destructive" className="border-2">
                <MessageSquare className="h-5 w-5" />
                <AlertDescription className="ml-2">
                  <p className="font-semibold text-base mb-2">Lý do từ chối:</p>
                  <p className="text-sm">{existingShop.moderatorNote}</p>
                </AlertDescription>
              </Alert>
            )}

            {/* Thông tin thời gian */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Ngày đăng ký
                </Label>
                <p className="text-sm">{formatDate(existingShop.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Ngày từ chối
                </Label>
                <p className="text-sm">{formatDate(existingShop.updatedAt)}</p>
              </div>
            </div>

            {/* Hướng dẫn đăng ký lại */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-200">
                    Bạn có thể đăng ký lại
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Hãy xem xét lý do từ chối và điều chỉnh thông tin shop phù hợp trước khi đăng ký lại.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                size="lg"
                className="w-full h-12 text-base"
                onClick={() => setShowReregisterForm(true)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Đăng ký lại bán hàng
              </Button>

              <Button variant="ghost" asChild className="w-full">
                <Link href="/">
                  Quay về trang chủ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========== TRƯỜNG HỢP: Shop đang Pending/Active/Suspended - Hiển thị trạng thái ==========
  if (isLoggedIn && existingShop && existingShop.status !== "Closed") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-200px)] py-10 md:py-16">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-3 justify-center">
              <Store className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              <CardTitle className="text-2xl md:text-3xl text-center">
                Trạng thái đăng ký
              </CardTitle>
            </div>
            <CardDescription className="text-center text-base">
              Bạn đã đăng ký bán hàng. Dưới đây là trạng thái đơn đăng ký của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Shop Info */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{existingShop.shopName}</h3>
                {getShopStatusBadge(existingShop.status)}
              </div>
              {existingShop.description && (
                <p className="text-sm text-muted-foreground">{existingShop.description}</p>
              )}
            </div>

            {/* Status Details */}
            <div className="space-y-4">
              {/* Status Message */}
              {existingShop.status === "Pending" && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-3">
                    <Clock className="h-6 w-6 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-900 dark:text-orange-200">
                        Đang chờ duyệt
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        Đơn đăng ký của bạn đang được moderator xem xét. Chúng tôi sẽ thông báo khi có kết quả.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {existingShop.status === "Active" && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-200">
                        Shop đã được duyệt!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Chúc mừng! Bạn có thể bắt đầu thêm sản phẩm và bán hàng ngay bây giờ.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {existingShop.status === "Suspended" && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-900 dark:text-yellow-200">
                        Shop bị tạm ngưng
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Shop của bạn đã bị tạm ngưng hoạt động. Vui lòng liên hệ admin để biết thêm chi tiết.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Registration Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Ngày đăng ký
                  </Label>
                  <p className="text-sm">{formatDate(existingShop.createdAt)}</p>
                </div>
                {existingShop.approvedAt && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Ngày được duyệt
                    </Label>
                    <p className="text-sm">{formatDate(existingShop.approvedAt)}</p>
                  </div>
                )}
              </div>

              {/* Moderator Note */}
              {existingShop.moderatorNote && (
                <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Ghi chú từ Moderator
                  </Label>
                  <p className="text-sm">{existingShop.moderatorNote}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {existingShop.status === "Active" && (
                <Button asChild className="w-full h-12 text-base">
                  <Link href="/seller">
                    Đi đến Shop của tôi
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}

              <Button variant="ghost" asChild className="w-full">
                <Link href="/">
                  Quay về trang chủ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========== TRƯỜNG HỢP: Form đăng ký (chưa có shop HOẶC đang đăng ký lại) ==========
  const isReregistering = showReregisterForm && existingShop?.status === "Closed";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-200px)] py-10 md:py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          {/* Back button khi đang reregister */}
          {isReregistering && (
            <Button
              variant="ghost"
              size="sm"
              className="w-fit -ml-2 mb-2"
              onClick={() => {
                setShowReregisterForm(false);
                router.replace("/seller/register");
              }}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Quay lại
            </Button>
          )}

          <div className="flex items-center gap-3 justify-center">
            {isReregistering ? (
              <RefreshCw className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            ) : (
              <Store className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            )}
            <CardTitle className="text-2xl md:text-3xl text-center">
              {isReregistering
                ? "Đăng ký lại"
                : isLoggedIn
                  ? "Tạo Shop"
                  : "Đăng ký bán hàng"
              }
            </CardTitle>
          </div>
          <CardDescription className="text-center text-base">
            {isReregistering
              ? "Điều chỉnh thông tin và gửi đơn đăng ký mới"
              : isLoggedIn
                ? `Xin chào ${user?.name}! Tạo shop của bạn để bắt đầu bán sản phẩm số`
                : "Tạo tài khoản và shop của bạn để bắt đầu bán sản phẩm số"
            }
          </CardDescription>

          {/* Nhắc nhở lý do từ chối khi đăng ký lại */}
          {isReregistering && existingShop?.moderatorNote && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Lưu ý:</span> Đơn trước bị từ chối vì: {existingShop.moderatorNote}
              </AlertDescription>
            </Alert>
          )}

          {isLoggedIn && !isReregistering && (
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <User className="h-4 w-4" />
              <span>Shop sẽ được liên kết với tài khoản: <strong>{user?.email}</strong></span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {!isLoggedIn && (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Tên hiển thị</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nguyễn Văn A"
                            className="h-11 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="example@email.com"
                            type="email"
                            className="h-11 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Email này dùng cho tài khoản User. Shop sẽ được liên kết với tài khoản này.
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Mật khẩu</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            className="h-11 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Xác nhận mật khẩu</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            className="h-11 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={shopForm.control}
                name="shopName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Tên Shop {isReregistering && <span className="text-muted-foreground">(có thể đổi)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Shop của tôi"
                        className="h-11 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={shopForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Mô tả Shop {isReregistering && <span className="text-muted-foreground">(có thể sửa)</span>}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả về shop của bạn..."
                        className="min-h-[100px] text-base resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Mô tả về shop của bạn (tùy chọn, tối đa 500 ký tự)
                    </p>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-base md:text-lg"
                disabled={isLoading || !!(isLoggedIn && isCheckingShop)}
              >
                {isLoading
                  ? (isReregistering ? "Đang gửi đơn..." : isLoggedIn ? "Đang tạo shop..." : "Đang đăng ký...")
                  : (isLoggedIn && isCheckingShop)
                  ? "Đang kiểm tra..."
                  : isReregistering
                    ? "Gửi đơn đăng ký lại"
                    : (isLoggedIn ? "Tạo Shop" : "Đăng ký bán hàng")
                }
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function RegisterSellerLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-200px)] py-10 md:py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <Skeleton className="h-10 w-10 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterSellerPage() {
  return (
    <Suspense fallback={<RegisterSellerLoading />}>
      <RegisterSellerContent />
    </Suspense>
  );
}
