"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketSchema, type CreateTicketInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RequireAuth } from "@/components/auth/RequireAuth";
import {
  Card,
  CardContent,
  CardDescription,
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function CreateTicketPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      category: "other",
      subject: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateTicketInput) => {
    setIsLoading(true);
    try {
      // TODO: Submit ticket
      toast.success("Ticket đã được tạo! Chúng tôi sẽ phản hồi sớm nhất.");
    } catch (error) {
      toast.error("Lỗi khi tạo ticket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RequireAuth>
      <div className="container py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tạo ticket hỗ trợ</h1>
          <p className="text-muted-foreground">
            Gặp vấn đề? Hãy cho chúng tôi biết để được hỗ trợ
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin vấn đề</CardTitle>
                <CardDescription>
                  Mô tả chi tiết vấn đề bạn gặp phải
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại vấn đề *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại vấn đề" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="invalid_key">
                            License key không hợp lệ
                          </SelectItem>
                          <SelectItem value="activation_fail">
                            Lỗi kích hoạt
                          </SelectItem>
                          <SelectItem value="refund_request">
                            Yêu cầu hoàn tiền
                          </SelectItem>
                          <SelectItem value="technical">
                            Vấn đề kỹ thuật
                          </SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subOrderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã đơn hàng (nếu có)</FormLabel>
                      <FormControl>
                        <Input placeholder="ORD-2026010712345" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nhập mã đơn hàng nếu vấn đề liên quan đến đơn hàng cụ
                        thể
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề *</FormLabel>
                      <FormControl>
                        <Input placeholder="Tóm tắt vấn đề..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả chi tiết *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả chi tiết vấn đề bạn gặp phải, các bước đã thử..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Cung cấp càng nhiều thông tin càng giúp chúng tôi hỗ trợ
                        nhanh hơn
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline">
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang gửi..." : "Gửi ticket"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
    </RequireAuth>
  );
}
