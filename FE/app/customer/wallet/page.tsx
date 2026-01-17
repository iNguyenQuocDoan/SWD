"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const mockWalletData = {
  balance: 500000,
  pendingBalance: 100000,
  transactions: [
    {
      id: "TXN-001",
      type: "deposit" as const,
      amount: 500000,
      status: "completed" as const,
      description: "Nạp tiền vào ví",
      method: "Chuyển khoản ngân hàng",
      createdAt: "2026-01-07 10:00",
      completedAt: "2026-01-07 10:05",
    },
    {
      id: "TXN-002",
      type: "withdrawal" as const,
      amount: 200000,
      status: "completed" as const,
      description: "Rút tiền về tài khoản",
      method: "Chuyển khoản ngân hàng",
      createdAt: "2026-01-06 14:30",
      completedAt: "2026-01-06 15:00",
    },
    {
      id: "TXN-003",
      type: "payment" as const,
      amount: 299000,
      status: "completed" as const,
      description: "Thanh toán đơn hàng ORD-202601061234",
      method: "Ví điện tử",
      createdAt: "2026-01-05 16:20",
    },
    {
      id: "TXN-004",
      type: "deposit" as const,
      amount: 100000,
      status: "pending" as const,
      description: "Nạp tiền vào ví",
      method: "Chuyển khoản ngân hàng",
      createdAt: "2026-01-07 15:00",
    },
  ],
};

const quickAmounts = [100000, 200000, 500000, 1000000, 2000000];

export default function WalletPage() {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions] = useState(mockWalletData.transactions);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    const depositAmount = parseInt(amount);
    if (!depositAmount || depositAmount < 50000) {
      toast.error("Số tiền nạp tối thiểu là 50,000 VND");
      return;
    }

    setIsProcessing(true);
    toast.info("Đang xử lý nạp tiền...");

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`Đã gửi yêu cầu nạp ${formatPrice(depositAmount)}. Vui lòng chờ xử lý.`);
      setAmount("");
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Đang xử lý";
      case "failed":
        return "Thất bại";
      default:
        return status;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default" as const;
      case "pending":
        return "secondary" as const;
      case "failed":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <RequireAuth>
      <div className="container py-6 md:py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Ví điện tử</h1>
          <p className="text-muted-foreground">
            Quản lý số dư và giao dịch của bạn
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Số dư hiện tại</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {formatPrice(mockWalletData.balance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sẵn sàng sử dụng ngay
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {formatPrice(mockWalletData.pendingBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Chờ xác nhận giao dịch
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng số dư</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatPrice(mockWalletData.balance + mockWalletData.pendingBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Bao gồm đang xử lý
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Nạp tiền
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Lịch sử giao dịch
            </TabsTrigger>
          </TabsList>

          {/* Deposit Tab */}
          <TabsContent value="deposit" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Nạp tiền vào ví</CardTitle>
                <CardDescription>
                  Nạp tiền để thanh toán đơn hàng nhanh chóng và an toàn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDeposit} className="space-y-6">
                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Số tiền nạp (VND)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Nhập số tiền"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="50000"
                      step="10000"
                      required
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Số tiền tối thiểu: 50,000 VND
                    </p>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="space-y-2">
                    <Label>Chọn nhanh:</Label>
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((value) => (
                        <Button
                          key={value}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAmount(value)}
                        >
                          {formatPrice(value)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Phương thức thanh toán</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <SelectTrigger id="payment-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Chuyển khoản ngân hàng
                          </div>
                        </SelectItem>
                        <SelectItem value="momo">Ví MoMo</SelectItem>
                        <SelectItem value="zalopay">Ví ZaloPay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Summary */}
                  {amount && parseInt(amount) >= 50000 && (
                    <Alert variant="info">
                      <AlertIcon.info className="h-4 w-4" />
                      <AlertDescription>
                        Bạn sẽ nạp:{" "}
                        <strong className="text-lg">
                          {formatPrice(parseInt(amount))}
                        </strong>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessing || !amount || parseInt(amount) < 50000}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <ArrowDownCircle className="mr-2 h-4 w-4" />
                        Nạp tiền
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Alert variant="info">
              <AlertIcon.info className="h-4 w-4" />
              <AlertDescription>
                <strong>Lưu ý:</strong> Giao dịch nạp tiền có thể mất 5-15 phút để xử lý.
                Chúng tôi sẽ thông báo khi giao dịch hoàn tất.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4 mt-6">
            {transactions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có giao dịch</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Lịch sử giao dịch sẽ hiển thị tại đây
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <Card key={txn.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {txn.type === "deposit" ? (
                              <ArrowDownCircle className="h-5 w-5 text-green-600" />
                            ) : txn.type === "withdrawal" ? (
                              <ArrowUpCircle className="h-5 w-5 text-blue-600" />
                            ) : (
                              <CreditCard className="h-5 w-5 text-orange-600" />
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{txn.description}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{txn.method}</span>
                              <span>•</span>
                              <span>{txn.createdAt}</span>
                            </div>
                            {txn.status === "pending" && (
                              <p className="text-xs text-orange-600">
                                Giao dịch đang được xử lý...
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p
                            className={`font-bold text-lg ${
                              txn.type === "deposit"
                                ? "text-green-600"
                                : txn.type === "payment"
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          >
                            {txn.type === "deposit" ? "+" : txn.type === "payment" ? "-" : "-"}
                            {formatPrice(txn.amount)}
                          </p>
                          <Badge variant={getStatusBadgeVariant(txn.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(txn.status)}
                              {getStatusLabel(txn.status)}
                            </div>
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </RequireAuth>
  );
}
