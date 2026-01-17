"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { CreditCard, Wallet, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { RequireAuth } from "@/components/auth/RequireAuth";

// Mock data
const mockCheckoutData = {
  items: [
    {
      id: "1",
      title: "Netflix Premium - Gói gia đình 3 tháng",
      quantity: 1,
      price: 299000,
    },
    {
      id: "2",
      title: "Spotify Premium - 1 năm",
      quantity: 2,
      price: 49980,
    },
  ],
  subtotal: 399780,
  serviceFee: 7996,
  total: 407776,
  walletBalance: 500000,
};

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "other">("wallet");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (paymentMethod === "other") {
      // Validate payment method fields
      // This is a placeholder - add actual validation
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    if (paymentMethod === "wallet" && mockCheckoutData.total > mockCheckoutData.walletBalance) {
      toast.error("Số dư ví không đủ. Vui lòng nạp thêm tiền.");
      router.push("/customer/wallet");
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Đặt hàng thành công!");
      router.push(`/customer/orders/ORD-${Date.now()}`);
    }, 2000);
  };

  const insufficientBalance =
    paymentMethod === "wallet" &&
    mockCheckoutData.total > mockCheckoutData.walletBalance;

  return (
    <RequireAuth>
      <div className="container py-6 md:py-8 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Thanh toán</h1>
          <p className="text-muted-foreground">
            Kiểm tra thông tin đơn hàng trước khi thanh toán
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Review */}
              <Card>
                <CardHeader>
                  <CardTitle>Đơn hàng của bạn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockCheckoutData.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính:</span>
                      <span>{formatPrice(mockCheckoutData.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí dịch vụ (2%):</span>
                      <span>{formatPrice(mockCheckoutData.serviceFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">
                        {formatPrice(mockCheckoutData.total)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Phương thức thanh toán</CardTitle>
                  <CardDescription>
                    Chọn cách thức thanh toán cho đơn hàng
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Wallet Payment */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === "wallet"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setPaymentMethod("wallet")}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="wallet"
                        checked={paymentMethod === "wallet"}
                        onChange={() => setPaymentMethod("wallet")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className="h-5 w-5" />
                          <span className="font-semibold">Ví điện tử</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Số dư hiện tại:{" "}
                          <span className="font-medium text-primary">
                            {formatPrice(mockCheckoutData.walletBalance)}
                          </span>
                        </p>
                        {insufficientBalance && (
                          <Alert variant="warning" className="mt-2">
                            <AlertIcon.warning className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              Số dư không đủ.{" "}
                              <Link
                                href="/customer/wallet"
                                className="underline font-medium"
                              >
                                Nạp thêm tiền
                              </Link>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Other Payment Methods */}
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === "other"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setPaymentMethod("other")}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="other"
                        checked={paymentMethod === "other"}
                        onChange={() => setPaymentMethod("other")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="h-5 w-5" />
                          <span className="font-semibold">Thẻ tín dụng/ghi nợ</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Thanh toán trực tiếp bằng thẻ ngân hàng
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Alert variant="info">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Thanh toán an toàn:</strong> Tiền được giữ trong Escrow cho đến khi
                  bạn xác nhận nhận hàng và kích hoạt thành công. Nếu có vấn đề, bạn có thể
                  yêu cầu hoàn tiền.
                </AlertDescription>
              </Alert>
            </div>

            {/* Sidebar - Order Summary */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle>Tóm tắt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính:</span>
                      <span>{formatPrice(mockCheckoutData.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí dịch vụ:</span>
                      <span>{formatPrice(mockCheckoutData.serviceFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">
                        {formatPrice(mockCheckoutData.total)}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessing || insufficientBalance}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Xác nhận đặt hàng
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Bằng việc đặt hàng, bạn đồng ý với{" "}
                    <Link href="/terms" className="underline">
                      Điều khoản dịch vụ
                    </Link>{" "}
                    của chúng tôi
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
    </RequireAuth>
  );
}
