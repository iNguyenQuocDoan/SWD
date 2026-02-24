"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "Làm thế nào để biết tài khoản an toàn và hợp lệ?",
        answer:
            "Tất cả người bán trên sàn đều phải trải qua quy trình xác minh nghiêm ngặt bao gồm xác minh danh tính (eKYC) và kiểm tra tài khoản. Mỗi sản phẩm đều được đội ngũ kiểm duyệt xem xét trước khi được liệt kê. Chúng tôi cũng duy trì hệ thống đánh giá người bán để đảm bảo chất lượng.",
    },
    {
        question: "Chính sách hoàn tiền như thế nào?",
        answer:
            "Chúng tôi cung cấp chương trình bảo vệ người mua toàn diện. Nếu tài khoản không hoạt động như mô tả, bạn có thể gửi khiếu nại trong vòng 72 giờ sau khi mua. Đội ngũ kiểm duyệt sẽ xem xét trường hợp và xử lý hoàn tiền đầy đủ nếu người bán có lỗi. Tiền được giữ trong ký quỹ trong thời gian bảo vệ.",
    },
    {
        question: "Thời gian giao hàng bao lâu?",
        answer:
            "Hầu hết sản phẩm số được giao ngay lập tức sau khi xác nhận thanh toán. Thông tin tài khoản được chia sẻ an toàn qua hệ thống giao hàng mã hóa. Trong một số trường hợp hiếm gặp, xác minh thủ công có thể mất đến 30 phút trong giờ cao điểm.",
    },
    {
        question: "Nếu tài khoản ngừng hoạt động thì sao?",
        answer:
            "Chúng tôi cung cấp thời gian bảo hành cho tất cả tài khoản từ 24 giờ đến 30 ngày tùy thuộc vào loại sản phẩm. Nếu tài khoản ngừng hoạt động trong thời gian bảo hành, hãy liên hệ đội ngũ hỗ trợ và chúng tôi sẽ thay thế hoặc xử lý hoàn tiền.",
    },
    {
        question: "Làm thế nào để trở thành người bán?",
        answer:
            "Để trở thành người bán, hãy tạo tài khoản, hoàn thành xác minh eKYC, và gửi đơn đăng ký bán hàng. Đội ngũ chúng tôi sẽ xem xét đơn đăng ký trong vòng 24-48 giờ. Sau khi được duyệt, bạn có thể đăng sản phẩm số và bắt đầu bán hàng.",
    },
    {
        question: "Hỗ trợ những phương thức thanh toán nào?",
        answer:
            "Chúng tôi hỗ trợ nhiều phương thức thanh toán bao gồm chuyển khoản ngân hàng, ví điện tử (MoMo, ZaloPay, VNPay), và hệ thống ví nội bộ. Tất cả thanh toán đều được xử lý qua kênh bảo mật với mã hóa end-to-end.",
    },
];

export function FAQSection() {
    return (
        <section id="faq" className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-5 lg:px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                            Câu hỏi thường gặp
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                            Bạn đang thắc mắc?
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Dưới đây là các câu hỏi thường gặp. Nếu không tìm thấy câu trả lời,
                            hãy liên hệ đội ngũ hỗ trợ của chúng tôi.
                        </p>
                    </div>

                    {/* Accordion */}
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border-b border-border">
                                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline hover:text-primary transition-colors py-5">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
