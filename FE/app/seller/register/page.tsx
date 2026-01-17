"use client";

import { useState, useEffect } from "react";
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
  CardFooter,
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Store, User } from "lucide-react";

export default function RegisterSellerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Nếu đã đăng nhập, chỉ cần form tạo shop đơn giản
  const isLoggedIn = isAuthenticated && user;

  // Dùng schema khác nhau tùy vào trạng thái đăng nhập
  const sellerForm = useForm<RegisterSellerInput>({
    resolver: zodResolver(registerSellerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      shopName: "",
    },
  });

  const shopForm = useForm<CreateShopInput>({
    resolver: zodResolver(createShopSchema),
    defaultValues: {
      shopName: "",
    },
  });

  // Type assertion để TypeScript hiểu
  const form = (isLoggedIn ? shopForm : sellerForm) as typeof sellerForm;

  const onSubmit = async (data: RegisterSellerInput | CreateShopInput) => {
    setIsLoading(true);
    try {
      if (isLoggedIn && user) {
        // Trường hợp 1: User đã đăng nhập → Chỉ tạo Shop mới
        // Logic: Tạo Shop collection với ownerUserId = user._id
        // Email là của User, Shop không có email riêng (dùng ownerUserId để reference)
        const shopData = data as CreateShopInput;
        
        // TODO: API call để tạo shop
        // POST /api/shops
        // Body: {
        //   shopName: shopData.shopName,
        //   ownerUserId: user.id,  // Reference đến User
        //   description: null,      // Optional, có thể thêm sau
        //   status: "Pending"       // Cần admin approve
        // }
        
        console.log("Create shop - API payload:", { 
          shopName: shopData.shopName, 
          ownerUserId: user.id,  // Reference đến User collection
          // Email không cần vì đã có trong User collection
        });
        
        toast.success(
          "Tạo shop thành công! Shop đang chờ phê duyệt. Bạn có thể bắt đầu bán hàng sau khi được duyệt."
        );
        router.push("/seller");
      } else {
        // Trường hợp 2: Chưa đăng nhập → Tạo User TRƯỚC, sau đó tạo Shop
        // Logic: 
        // 1. Tạo User collection với email, password, name
        // 2. Lấy user._id từ response
        // 3. Tạo Shop collection với ownerUserId = user._id
        const sellerData = data as RegisterSellerInput;
        
        // TODO: API call để đăng ký user + tạo shop
        // Step 1: POST /api/auth/register
        // Body: {
        //   email: sellerData.email,
        //   password: sellerData.password,
        //   fullName: sellerData.name,
        //   roleId: "seller_role_id"  // Set role là seller
        // }
        // Response: { user: { _id: "...", email: "...", ... } }
        
        // Step 2: POST /api/shops
        // Body: {
        //   shopName: sellerData.shopName,
        //   ownerUserId: user._id,  // Reference đến User vừa tạo
        //   description: null,
        //   status: "Pending"
        // }
        
        console.log("Register seller - API payload:", {
          // Step 1: Create User
          user: {
            email: sellerData.email,
            password: sellerData.password,
            fullName: sellerData.name,
            // roleId sẽ được set là seller
          },
          // Step 2: Create Shop (sau khi có user._id)
          shop: {
            shopName: sellerData.shopName,
            ownerUserId: "user._id_from_step1", // Reference đến User
          }
        });
        
        toast.success(
          "Đăng ký seller thành công! Vui lòng kiểm tra email để xác minh tài khoản. Shop của bạn đang chờ phê duyệt."
        );
        router.push("/login");
      }
    } catch (error) {
      toast.error("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-200px)] py-10 md:py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3 justify-center">
            <Store className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            <CardTitle className="text-2xl md:text-3xl text-center">
              {isLoggedIn ? "Tạo Shop" : "Đăng ký bán hàng"}
            </CardTitle>
          </div>
          <CardDescription className="text-center text-base">
            {isLoggedIn 
              ? `Xin chào ${user?.name}! Tạo shop của bạn để bắt đầu bán sản phẩm số`
              : "Tạo tài khoản và shop của bạn để bắt đầu bán sản phẩm số"
            }
          </CardDescription>
          {isLoggedIn && (
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
                control={form.control}
                name="shopName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Tên Shop</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Shop của tôi" 
                        className="h-11 text-base"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    {isLoggedIn && (
                      <p className="text-xs text-muted-foreground">
                        Shop sẽ được tạo và liên kết với tài khoản {user?.email} của bạn (ownerUserId)
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 text-base md:text-lg" 
                disabled={isLoading}
              >
                {isLoading 
                  ? (isLoggedIn ? "Đang tạo shop..." : "Đang đăng ký...") 
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
