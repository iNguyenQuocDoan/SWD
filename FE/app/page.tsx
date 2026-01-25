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
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12 lg:mb-16">
            Tại sao chọn chúng tôi?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <ShoppingBag className="h-12 w-12 md:h-14 md:w-14 mb-4 text-primary" />
                <CardTitle className="text-xl md:text-2xl">Giao hàng tức thì</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base md:text-lg leading-relaxed">
                  Nhận license key hoặc subscription ngay sau khi thanh toán
                  thành công
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <Shield className="h-12 w-12 md:h-14 md:w-14 mb-4 text-primary" />
                <CardTitle className="text-xl md:text-2xl">Bảo vệ người mua</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base md:text-lg leading-relaxed">
                  Hệ thống escrow giữ tiền đến khi xác nhận kích hoạt thành công
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <Zap className="h-12 w-12 md:h-14 md:w-14 mb-4 text-primary" />
                <CardTitle className="text-xl md:text-2xl">AI kiểm duyệt</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base md:text-lg leading-relaxed">
                  Sản phẩm được kiểm tra tự động và kiểm duyệt bởi đội ngũ
                  chuyên nghiệp
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <TrendingUp className="h-12 w-12 md:h-14 md:w-14 mb-4 text-primary" />
                <CardTitle className="text-xl md:text-2xl">Đánh giá uy tín</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base md:text-lg leading-relaxed">
                  Hệ thống Trust Level và Email Verified giúp đánh giá độ tin
                  cậy
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12 lg:mb-16">
            Danh mục phổ biến
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                <CardHeader className="pb-4">
                  <CardTitle className="text-center text-lg md:text-xl">{category}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 md:space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold max-w-3xl mx-auto">
            Bắt đầu bán hàng ngay hôm nay
          </h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
            Đăng ký làm seller, tạo shop của bạn và tiếp cận hàng nghìn khách
            hàng tiềm năng
          </p>
          <Button size="lg" variant="secondary" className="text-base md:text-lg h-12 md:h-14 px-8 md:px-10" asChild>
            <Link href="/seller/register">Đăng ký seller</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
