import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ShoppingBag, Shield, Zap, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        {/* Background Image Container - 16:9 Aspect Ratio */}
        <div className="relative w-full aspect-video">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/hero-background.jpg')", // Thay đổi đường dẫn ảnh của bạn
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Overlay để text dễ đọc hơn - 16:9 */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-background/80" />
        </div>
        
        {/* Content - Centered over 16:9 background */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-foreground drop-shadow-lg">
                Marketplace Sản Phẩm Số Uy Tín
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-foreground/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                Mua bán license key, subscription và các sản phẩm số với hệ thống
                bảo vệ người mua toàn diện
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" className="text-base md:text-lg h-12 md:h-14 px-8 md:px-10 shadow-lg" asChild>
                  <Link href="/products">Khám phá sản phẩm</Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base md:text-lg h-12 md:h-14 px-8 md:px-10 bg-background/90 backdrop-blur-sm shadow-lg" asChild>
                  <Link href="/seller/register">Đăng ký bán hàng</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-6 md:py-8 lg:py-10">
        <div className="container mx-auto px-4 sm:px-5 lg:px-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-4 md:mb-6 lg:mb-8">
            Tại sao chọn chúng tôi?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <ShoppingBag className="h-8 w-8 md:h-10 md:w-10 mb-2 text-primary" />
                <CardTitle className="text-lg md:text-xl">Giao hàng tức thì</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  Nhận license key hoặc subscription ngay sau khi thanh toán
                  thành công
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <Shield className="h-8 w-8 md:h-10 md:w-10 mb-2 text-primary" />
                <CardTitle className="text-lg md:text-xl">Bảo vệ người mua</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  Hệ thống escrow giữ tiền đến khi xác nhận kích hoạt thành công
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <Zap className="h-8 w-8 md:h-10 md:w-10 mb-2 text-primary" />
                <CardTitle className="text-lg md:text-xl">AI kiểm duyệt</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  Sản phẩm được kiểm tra tự động và kiểm duyệt bởi đội ngũ
                  chuyên nghiệp
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <TrendingUp className="h-8 w-8 md:h-10 md:w-10 mb-2 text-primary" />
                <CardTitle className="text-lg md:text-xl">Đánh giá uy tín</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm md:text-base leading-relaxed">
                  Hệ thống Trust Level và Email Verified giúp đánh giá độ tin
                  cậy
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-6 md:py-8 lg:py-10 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-5 lg:px-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-4 md:mb-6 lg:mb-8">
            Danh mục phổ biến
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {[
              "Windows License",
              "Office 365",
              "Antivirus",
              "VPN",
              "Adobe Creative",
              "Game Keys",
              "Cloud Storage",
              "Developer Tools",
            ].map((category) => (
              <Card
                key={category}
                className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
              >
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-center text-sm md:text-base">{category}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-6 md:py-8 lg:py-10 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-5 lg:px-6 text-center space-y-3 md:space-y-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold max-w-3xl mx-auto">
            Bắt đầu bán hàng ngay hôm nay
          </h2>
          <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
            Đăng ký làm seller, tạo shop của bạn và tiếp cận hàng nghìn khách
            hàng tiềm năng
          </p>
          <Button size="lg" variant="secondary" className="text-sm md:text-base h-9 md:h-10 px-5 md:px-6" asChild>
            <Link href="/seller/register">Đăng ký seller</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
