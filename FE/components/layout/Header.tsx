"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/auth";
import { authService } from "@/lib/services/auth.service";
import { useRouter } from "next/navigation";
import { useShop } from "@/lib/hooks/useShop";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Store,
  Shield,
  Menu,
  X,
  Wallet,
  Package,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomerMenuStats } from "./CustomerMenuStats";

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { hasActiveShop, shop } = useShop();

  const handleLogout = async () => {
    await authService.logout();
    router.push("/");
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 md:h-24 items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
            <Link 
              href="/" 
              className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity"
            >
              <Store className="h-7 w-7 md:h-8 md:w-8" />
              <span className="font-bold text-lg md:text-xl lg:text-2xl">
                Sàn Tài Khoản Số
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-6 xl:gap-8">
              <Link
                href="/products"
                className="text-base font-medium transition-colors hover:text-primary"
              >
                Sản phẩm
              </Link>
              <Link
                href="/categories"
                className="text-base font-medium transition-colors hover:text-primary"
              >
                Danh mục
              </Link>
              <Link
                href="/sellers"
                className="text-base font-medium transition-colors hover:text-primary"
              >
                Người bán
              </Link>
            </nav>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-lg mx-4">
            <form
              action="/products"
              method="get"
              className="relative w-full"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get("search") as string;
                if (query) {
                  window.location.href = `/products?search=${encodeURIComponent(query)}`;
                } else {
                  window.location.href = `/products`;
                }
              }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                name="search"
                placeholder="Tìm kiếm nền tảng, loại gói..."
                className="pl-10 h-11 text-base w-full"
                autoComplete="off"
              />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Mobile Search Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {!isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:flex text-base" asChild>
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button size="sm" className="hidden sm:flex text-base" asChild>
                  <Link href="/register">Đăng ký</Link>
                </Button>
                {/* Mobile Auth Buttons */}
                <div className="sm:hidden flex gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/login">
                      <User className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon" className="h-10 w-10 md:h-11 md:w-11" asChild>
                  <Link href="/cart">
                    <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 md:h-11 md:w-11 rounded-full"
                    >
                      <Avatar className="h-10 w-10 md:h-11 md:w-11">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="text-base md:text-lg">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-base font-medium leading-none">
                          {user?.name}
                        </p>
                        <p className="text-sm leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="text-base">
                      <Link href="/customer/profile">
                        <User className="mr-2 h-5 w-5" />
                        <span>Hồ sơ</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-base">
                      <Link href="/customer/wallet">
                        <Wallet className="mr-2 h-5 w-5" />
                        <span>Ví tiền</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-base">
                      <Link href="/customer/orders">
                        <Package className="mr-2 h-5 w-5" />
                        <span>Lịch sử đơn hàng</span>
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "customer" && <CustomerMenuStats />}
                    {/* Hiển thị "Đăng ký bán hàng" nếu user là customer và chưa có shop */}
                    {user?.role === "customer" && !shop && (
                      <DropdownMenuItem asChild className="text-base">
                        <Link href="/customer/become-seller">
                          <Store className="mr-2 h-5 w-5" />
                          <span>Đăng ký bán hàng</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {/* Hiển thị "Trạng thái đơn đăng ký" nếu user có shop đang chờ duyệt */}
                    {shop && shop.status === "Pending" && (
                      <DropdownMenuItem asChild className="text-base">
                        <Link href="/customer/seller-application-status">
                          <Store className="mr-2 h-5 w-5" />
                          <span>Trạng thái đơn đăng ký</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {/* Hiển thị "Shop của tôi" nếu user có shop đã được duyệt (status = Active) */}
                    {hasActiveShop && (
                      <DropdownMenuItem asChild className="text-base">
                        <Link href="/seller/shop">
                          <Store className="mr-2 h-5 w-5" />
                          <span>Shop của tôi</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {/* Hiển thị "Quản lý Shop" cho seller role cũ (backward compatibility) */}
                    {user?.role === "seller" && !hasActiveShop && !shop && (
                      <DropdownMenuItem asChild className="text-base">
                        <Link href="/customer/become-seller">
                          <Store className="mr-2 h-5 w-5" />
                          <span>Tạo Shop</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === "moderator" && (
                      <>
                        <DropdownMenuItem asChild className="text-base">
                          <Link href="/moderator/shops">
                            <Store className="mr-2 h-5 w-5" />
                            <span>Quản lý Shop</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="text-base">
                          <Link href="/moderator/review">
                            <Shield className="mr-2 h-5 w-5" />
                            <span>Kiểm duyệt sản phẩm</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild className="text-base">
                        <Link href="/admin">
                          <Shield className="mr-2 h-5 w-5" />
                          <span>Quản trị</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-base">
                      <LogOut className="mr-2 h-5 w-5" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu & Search */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t py-4 space-y-4">
            {/* Mobile Search */}
            <form
              action="/products"
              method="get"
              className="relative px-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get("search") as string;
                if (query) {
                  window.location.href = `/products?search=${encodeURIComponent(query)}`;
                } else {
                  window.location.href = `/products`;
                }
                setMobileMenuOpen(false);
              }}
            >
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                name="search"
                placeholder="Tìm kiếm nền tảng, loại gói..."
                className="pl-11 h-12 text-base w-full"
                autoComplete="off"
              />
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-2 px-4">
              <Link
                href="/products"
                className="text-base font-medium py-3 px-4 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link
                href="/categories"
                className="text-base font-medium py-3 px-4 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Danh mục
              </Link>
              <Link
                href="/sellers"
                className="text-base font-medium py-3 px-4 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Người bán
              </Link>
              {!isAuthenticated && (
                <>
                  <div className="border-t my-2"></div>
                  <Link
                    href="/login"
                    className="text-base font-medium py-3 px-4 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="text-base font-medium py-3 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
