"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProductSchema,
  type CreateProductInput,
} from "@/lib/validations";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAIAssisting, setIsAIAssisting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "",
      tags: [],
      deliveryType: "license_key",
      images: [],
    },
  });

  const handleAIAssist = async () => {
    const title = form.getValues("title");
    const description = form.getValues("description");

    if (!title || !description) {
      toast.error("Vui lòng nhập tiêu đề và mô tả trước khi sử dụng AI Assist");
      return;
    }

    setIsAIAssisting(true);
    try {
      // TODO: Call AI API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const suggestions = {
        suggestedCategories: [
          "Windows",
          "Software License",
          "Operating System",
        ],
        suggestedTags: ["windows11", "license", "genuine", "lifetime"],
        improvedDescription:
          description +
          "\n\n[AI Enhanced]\nSản phẩm chính hãng, đảm bảo kích hoạt thành công. Hỗ trợ 24/7.",
      };

      setAiSuggestions(suggestions);
      toast.success("AI đã phân tích và đưa ra gợi ý!");
    } catch (error) {
      toast.error("Lỗi khi sử dụng AI Assist");
    } finally {
      setIsAIAssisting(false);
    }
  };

  const applyAISuggestion = (type: "description" | "category" | "tags") => {
    if (!aiSuggestions) return;

    if (type === "description") {
      form.setValue("description", aiSuggestions.improvedDescription);
    } else if (type === "category" && aiSuggestions.suggestedCategories[0]) {
      form.setValue("category", aiSuggestions.suggestedCategories[0]);
    } else if (type === "tags") {
      form.setValue("tags", aiSuggestions.suggestedTags);
    }

    toast.success("Đã áp dụng gợi ý từ AI");
  };

  const onSubmit = async (data: CreateProductInput) => {
    setIsLoading(true);
    try {
      // TODO: Submit to API
      console.log("Create product:", data);
      toast.success("Sản phẩm đã được tạo và gửi vào hàng đợi kiểm duyệt!");
    } catch (error) {
      toast.error("Lỗi khi tạo sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RequireAuth requiredRole="seller">
      <div className="container py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tạo sản phẩm mới</h1>
          <p className="text-muted-foreground">
            Thêm sản phẩm mới vào shop. Sản phẩm sẽ được kiểm duyệt trước khi
            hiển thị công khai.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>
                  Nhập thông tin chi tiết về sản phẩm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề sản phẩm *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Windows 11 Pro License Key"
                          {...field}
                        />
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
                      <FormLabel>Mô tả *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả chi tiết về sản phẩm, cách sử dụng, điều kiện..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAIAssist}
                    disabled={isAIAssisting}
                  >
                    {isAIAssisting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        AI đang phân tích...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Assist
                      </>
                    )}
                  </Button>
                </div>

                {aiSuggestions && (
                  <Card className="border-primary/50 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Gợi ý từ AI
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Danh mục gợi ý:
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {aiSuggestions.suggestedCategories.map(
                            (cat: string) => (
                              <Badge key={cat} variant="outline">
                                {cat}
                              </Badge>
                            )
                          )}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="mt-2"
                          onClick={() => applyAISuggestion("category")}
                        >
                          Áp dụng
                        </Button>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Tags gợi ý:</p>
                        <div className="flex gap-2 flex-wrap">
                          {aiSuggestions.suggestedTags.map((tag: string) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="mt-2"
                          onClick={() => applyAISuggestion("tags")}
                        >
                          Áp dụng
                        </Button>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">
                          Mô tả đã cải thiện:
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-background p-3 rounded border">
                          {aiSuggestions.improvedDescription}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="mt-2"
                          onClick={() => applyAISuggestion("description")}
                        >
                          Áp dụng
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Pricing & Category */}
            <Card>
              <CardHeader>
                <CardTitle>Giá và phân loại</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá (USD) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="29.99"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Windows">Windows</SelectItem>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Antivirus">Antivirus</SelectItem>
                            <SelectItem value="VPN">VPN</SelectItem>
                            <SelectItem value="Adobe">
                              Adobe Creative
                            </SelectItem>
                            <SelectItem value="Games">Game Keys</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="deliveryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại sản phẩm *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="license_key">
                            License Key
                          </SelectItem>
                          <SelectItem value="subscription">
                            Subscription
                          </SelectItem>
                          <SelectItem value="digital_file">
                            Digital File
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Chọn loại sản phẩm số bạn đang bán
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline">
                Lưu nháp
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang tạo..." : "Gửi kiểm duyệt"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
    </RequireAuth>
  );
}
