import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ShoppingBag, Shield, Zap, TrendingUp, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Full viewport height with perfect centering */}
      <section className="relative min-h-[calc(100vh-80px)] w-full flex items-center justify-center overflow-hidden py-12 md:py-16">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />

        {/* Content - Perfectly centered */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-5 md:space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Nền tảng uy tín #1 Việt Nam</span>
            </div>

            {/* Main headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight text-foreground">
              <span className="block">Marketplace</span>
              <span className="block bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Sản Phẩm Số
              </span>
              <span className="block">Uy Tín</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Mua bán license key, subscription và các sản phẩm số với
              <span className="text-foreground font-medium"> hệ thống bảo vệ người mua toàn diện</span>
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Giao dịch an toàn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Bảo vệ người mua</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button size="lg" className="text-base h-12 px-6 md:px-8 shadow-lg hover:shadow-xl transition-all duration-300 group" asChild>
                <Link href="/products">
                  Khám phá sản phẩm
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12 px-6 md:px-8 bg-background/80 backdrop-blur-sm border-2 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300" asChild>
                <Link href="/seller/register">Đăng ký bán hàng</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-lg text-muted-foreground">
              Trải nghiệm mua sắm sản phẩm số an toàn, nhanh chóng và đáng tin cậy
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-3 pt-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl md:text-2xl">Giao hàng tức thì</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <CardDescription className="text-base leading-relaxed">
                  Nhận license key hoặc subscription ngay sau khi thanh toán thành công
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-3 pt-8">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-7 w-7 text-green-600" />
                </div>
                <CardTitle className="text-xl md:text-2xl">Bảo vệ người mua</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <CardDescription className="text-base leading-relaxed">
                  Hệ thống escrow giữ tiền đến khi xác nhận kích hoạt thành công
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-3 pt-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-7 w-7 text-amber-600" />
                </div>
                <CardTitle className="text-xl md:text-2xl">AI kiểm duyệt</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <CardDescription className="text-base leading-relaxed">
                  Sản phẩm được kiểm tra tự động và kiểm duyệt bởi đội ngũ chuyên nghiệp
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-3 pt-8">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-7 w-7 text-purple-600" />
                </div>
                <CardTitle className="text-xl md:text-2xl">Đánh giá uy tín</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <CardDescription className="text-base leading-relaxed">
                  Hệ thống Trust Level và Email Verified giúp đánh giá độ tin cậy
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Danh mục phổ biến
            </h2>
            <p className="text-lg text-muted-foreground">
              Khám phá các sản phẩm số được yêu thích nhất
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: "Windows License", icon: "🪟", color: "from-blue-500/10 to-blue-600/5" },
              { name: "Office 365", icon: "📊", color: "from-orange-500/10 to-orange-600/5" },
              { name: "Antivirus", icon: "🛡️", color: "from-green-500/10 to-green-600/5" },
              { name: "VPN", icon: "🔐", color: "from-purple-500/10 to-purple-600/5" },
              { name: "Adobe Creative", icon: "🎨", color: "from-red-500/10 to-red-600/5" },
              { name: "Game Keys", icon: "🎮", color: "from-indigo-500/10 to-indigo-600/5" },
              { name: "Cloud Storage", icon: "☁️", color: "from-cyan-500/10 to-cyan-600/5" },
              { name: "Developer Tools", icon: "💻", color: "from-slate-500/10 to-slate-600/5" },
            ].map((category) => (
              <Card
                key={category.name}
                className={`group cursor-pointer border-2 border-transparent hover:border-primary/20 bg-gradient-to-br ${category.color} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <CardHeader className="py-6 md:py-8">
                  <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300 text-center">
                    {category.icon}
                  </div>
                  <CardTitle className="text-center text-base md:text-lg font-semibold group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* View all button */}
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base group" asChild>
              <Link href="/products">
                Xem tất cả sản phẩm
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 lg:py-24 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-indigo-700" />

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Bắt đầu bán hàng ngay hôm nay
            </h2>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Đăng ký làm seller, tạo shop của bạn và tiếp cận hàng nghìn khách hàng tiềm năng
            </p>
            <div className="pt-4">
              <Button size="lg" variant="secondary" className="h-13 md:h-14 px-10 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group" asChild>
                <Link href="/seller/register">
                  Đăng ký bán hàng miễn phí
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
