import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
          <div>
            <h3 className="font-semibold text-lg md:text-xl mb-4 md:mb-6">Về chúng tôi</h3>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">Giới thiệu</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">Liên hệ</Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-foreground transition-colors">Tuyển dụng</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg md:text-xl mb-4 md:mb-6">Hỗ trợ</h3>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-foreground transition-colors">Trung tâm trợ giúp</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">Câu hỏi thường gặp</Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-foreground transition-colors">Liên hệ hỗ trợ</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg md:text-xl mb-4 md:mb-6">Người bán</h3>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li>
                <Link href="/seller/register" className="hover:text-foreground transition-colors">Đăng ký bán hàng</Link>
              </li>
              <li>
                <Link href="/seller/guide" className="hover:text-foreground transition-colors">Hướng dẫn bán hàng</Link>
              </li>
              <li>
                <Link href="/seller/policies" className="hover:text-foreground transition-colors">Chính sách</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg md:text-xl mb-4 md:mb-6">Chính sách</h3>
            <ul className="space-y-3 text-base text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">Điều khoản dịch vụ</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-foreground transition-colors">Chính sách hoàn tiền</Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 md:my-12" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-base text-muted-foreground">
          <p>© 2026 Digital Marketplace. All rights reserved.</p>
          <p>Made with ❤️ in Vietnam</p>
        </div>
      </div>
    </footer>
  );
}
