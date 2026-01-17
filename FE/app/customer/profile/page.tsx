"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  AlertCircle,
  Mail,
  Shield,
  ShoppingBag,
  MessageSquare,
} from "lucide-react";

export default function CustomerProfilePage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">NV</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <h1 className="text-2xl font-bold">Nguyễn Văn A</h1>
                  <p className="text-muted-foreground">customer@example.com</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Email Verified
                  </Badge>
                  <Badge variant="outline" className="bg-green-50">
                    Trust Level: Basic
                  </Badge>
                  <Badge variant="secondary">Customer</Badge>
                </div>
              </div>
              <Button variant="outline">Chỉnh sửa</Button>
            </div>
          </CardHeader>
        </Card>

        {/* Email Verification Notice */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <CardTitle className="text-base">Xác minh email</CardTitle>
                <CardDescription>
                  Email của bạn đã được xác minh. Điều này giúp tăng độ tin cậy
                  của tài khoản.
                </CardDescription>
              </div>
              <Button size="sm" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Gửi lại email
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Trust Level Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Trust Level & Độ tin cậy
            </CardTitle>
            <CardDescription>
              Hệ thống đánh giá độ tin cậy dựa trên hoạt động của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">Basic</p>
                <p className="text-xs text-muted-foreground">Trust Level</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">12</p>
                <p className="text-xs text-muted-foreground">Đơn hàng</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">$350</p>
                <p className="text-xs text-muted-foreground">Tổng chi</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Tranh chấp</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="font-medium text-sm">Các cấp độ Trust Level:</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">New</Badge>
                  <span className="text-muted-foreground">Tài khoản mới</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50">
                    Basic
                  </Badge>
                  <span className="text-muted-foreground">
                    Email verified + 5+ đơn hàng
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50">
                    Trusted
                  </Badge>
                  <span className="text-muted-foreground">
                    20+ đơn hàng + Không vi phạm
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-50">
                    Verified
                  </Badge>
                  <span className="text-muted-foreground">
                    50+ đơn hàng + Xác minh KYC
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Đơn hàng
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <MessageSquare className="mr-2 h-4 w-4" />
              Ticket hỗ trợ
            </TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Đơn hàng gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chưa có đơn hàng nào
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ticket hỗ trợ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chưa có ticket nào
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Đánh giá của bạn</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chưa có đánh giá nào
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
