"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Wallet, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  RefreshCcw,
  Search,
  Filter,
  MoreHorizontal,
  ArrowRight,
  ShieldCheck,
  Ban
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { disbursementService } from "@/lib/services/disbursement.service";
import { 
  DisbursementStats, 
  HoldingItem, 
  PendingItem 
} from "@/types/disbursement";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function DisbursementPage() {
  const [stats, setStats] = useState<DisbursementStats | null>(null);
  const [holdingItems, setHoldingItems] = useState<HoldingItem[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHoldingItems = holdingItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.orderCode?.toLowerCase().includes(query) ||
      item.customerEmail?.toLowerCase().includes(query) ||
      item.shopName?.toLowerCase().includes(query)
    );
  });

  const filteredPendingItems = pendingItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.orderCode?.toLowerCase().includes(query) ||
      item.customerEmail?.toLowerCase().includes(query) ||
      item.shopName?.toLowerCase().includes(query)
    );
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, holdingData, pendingData] = await Promise.all([
        disbursementService.getStats(),
        disbursementService.getHolding({ limit: 10 }),
        disbursementService.getPending({ limit: 10 })
      ]);
      setStats(statsData);
      setHoldingItems(holdingData.items);
      setPendingItems(pendingData.items);
    } catch (error) {
      console.error("Error fetching disbursement data:", error);
      toast.error("Không thể tải dữ liệu giải ngân");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDisburse = async (itemId: string) => {
    try {
      setProcessingId(itemId);
      const result = await disbursementService.triggerDisbursement(itemId);
      if (result.success) {
        toast.success(result.message || "Giải ngân thành công");
        fetchData();
      } else {
        toast.error(result.message || "Giải ngân thất bại");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi thực hiện giải ngân");
    } finally {
      setProcessingId(null);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-8 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-primary pl-6 py-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase sm:text-5xl">
            Disbursement <span className="text-primary"></span>
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Hệ thống quản lý giải ngân Escrow & Release tiền cho Seller
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchData} 
          disabled={loading}
          className="rounded-none border-2 border-foreground hover:bg-foreground hover:text-background transition-all"
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Main Stats Card - Bento Style */}
        <Card className="md:col-span-2 lg:col-span-2 bg-foreground text-background rounded-none border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={120} />
          </div>
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-[0.2em] font-bold text-background/60">Đang giữ (Escrow)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? <Skeleton className="h-12 w-3/4 bg-background/20" /> : (
              <div className="space-y-1">
                <div className="text-4xl font-black tracking-tighter tabular-nums">
                  {formatVND(stats?.holding.totalAmount || 0)}
                </div>
                <div className="text-sm font-medium text-background/60">
                  {stats?.holding.count} giao dịch đang được hold
                </div>
              </div>
            )}
            <div className="mt-8">
              <Badge className="bg-primary text-primary-foreground rounded-none px-3 py-1 font-bold italic tracking-tighter uppercase">
                Release sau 72h
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-2 rounded-none border-2 border-foreground shadow-none hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center justify-between">
              Sẵn sàng giải ngân
              <ArrowUpRight className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-10 w-1/2" /> : (
              <div className="text-5xl font-black tracking-tighter tabular-nums text-primary">
                {stats?.readyForDisbursement || 0}
              </div>
            )}
            <p className="text-sm font-medium mt-2 text-muted-foreground italic">
              Đơn hàng đã qua mốc 72h & không khiếu nại
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-2 rounded-none border-2 border-muted shadow-none bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">30 ngày qua</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end border-b border-foreground/10 pb-2">
              <span className="text-xs font-bold uppercase">Đã release</span>
              <span className="text-lg font-black tracking-tighter">{formatVND(stats?.releasedLast30Days.totalAmount || 0)}</span>
            </div>
            <div className="flex justify-between items-end border-b border-foreground/10 pb-2">
              <span className="text-xs font-bold uppercase">Hoàn tiền</span>
              <span className="text-lg font-black tracking-tighter text-destructive">{formatVND(stats?.refundedLast30Days.totalAmount || 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area - Glassmorphism Table */}
      <Tabs defaultValue="holding" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList className="bg-transparent p-0 gap-8 h-auto">
            <TabsTrigger 
              value="holding" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 py-2 text-xs uppercase font-bold tracking-[0.2em] transition-all"
            >
              Holding Items
            </TabsTrigger>
            <TabsTrigger 
              value="ready" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-0 py-2 text-xs uppercase font-bold tracking-[0.2em] transition-all"
            >
              Ready to Release
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm orderCode, email, shopName..." 
                className="pl-10 rounded-none border-2 border-muted focus-visible:ring-0 focus-visible:border-foreground transition-all"
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-none border-2 border-muted">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="holding" className="mt-0 outline-none">
          <div className="border-2 border-foreground bg-background overflow-hidden">
            <Table>
              <TableHeader className="bg-foreground text-background">
                <TableRow className="hover:bg-foreground border-none">
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-background py-6">Mã Đơn / Item</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-background">Shop / Seller</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-background">Số tiền</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-background">Thời gian giữ</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-background text-right">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-b-2 border-muted">
                      <TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : holdingItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                        <Clock size={48} />
                        <p className="font-bold uppercase tracking-widest">Không có dữ liệu holding</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  holdingItems.map((item) => (
                    <TableRow key={item.orderItemId} className="border-b-2 border-muted hover:bg-muted/30 transition-colors group">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black tracking-tighter text-lg">#{item.orderCode}</span>
                          <span className="text-xs font-medium text-muted-foreground truncate max-w-[200px] uppercase">
                            {item.productTitle}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold uppercase text-xs">{item.shopName}</span>
                          <span className="text-xs text-muted-foreground">{item.customerEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-black tabular-nums">{formatVND(item.holdAmount)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-primary" />
                            <span className="text-xs font-bold uppercase">{item.timeRemainingFormatted}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground italic">
                            Hold: {format(new Date(item.holdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.hasOpenComplaint ? (
                          <Badge variant="destructive" className="rounded-none uppercase text-[10px] font-black tracking-widest px-2">
                            Khiếu nại
                          </Badge>
                        ) : item.isReadyForDisbursement ? (
                          <Badge className="bg-green-600 text-white rounded-none uppercase text-[10px] font-black tracking-widest px-2">
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="rounded-none uppercase text-[10px] font-black tracking-widest px-2">
                            Holding
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="ready" className="mt-0 outline-none">
          <div className="border-2 border-foreground bg-background overflow-hidden">
            <Table>
              <TableHeader className="bg-foreground text-background">
                <TableRow className="hover:bg-foreground border-none">
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-background py-6">Mã Đơn</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-background">Sản phẩm</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-background">Số tiền</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-background">Đã giữ</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest text-background text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-b-2 border-muted">
                      <TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : pendingItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                        <CheckCircle2 size={48} />
                        <p className="font-bold uppercase tracking-widest">Tất cả đã được giải ngân</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingItems.map((item) => (
                    <TableRow key={item.orderItemId} className="border-b-2 border-muted hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <span className="font-black tracking-tighter text-lg">#{item.orderCode}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold uppercase text-xs">{item.productTitle}</span>
                          <span className="text-xs text-muted-foreground">{item.shopName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-black tabular-nums text-primary">{formatVND(item.holdAmount)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold uppercase">{item.hoursHeld} giờ</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.hasOpenComplaint && (
                            <div className="flex items-center text-destructive mr-4">
                              <AlertCircle size={14} className="mr-1" />
                              <span className="text-[10px] font-bold uppercase tracking-tighter">Bị chặn</span>
                            </div>
                          )}
                          <Button 
                            size="sm"
                            disabled={!item.canDisburse || processingId === item.orderItemId}
                            onClick={() => handleDisburse(item.orderItemId)}
                            className="rounded-none font-bold uppercase text-[10px] tracking-widest px-4 h-8 bg-foreground hover:bg-primary transition-all group"
                          >
                            {processingId === item.orderItemId ? (
                              <RefreshCcw className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                Giải ngân
                                <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Banner - Glassmorphism style */}
      <div className="bg-muted/50 border-2 border-muted p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
          <ShieldCheck size={120} />
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-foreground text-background p-4 rounded-none shrink-0 italic font-black text-2xl rotate-[-2deg]">
            i
          </div>
          <div className="space-y-1">
            <h4 className="font-black uppercase tracking-widest text-sm">Cơ chế Escrow 72h</h4>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-2xl">
              Hệ thống tự động giữ tiền (holdBalance) trong vòng 72 giờ kể từ khi đơn hàng được giao. 
              Admin có quyền can thiệp giải ngân sớm hoặc giữ tiền lâu hơn nếu có khiếu nại (Support Ticket). 
              Phí platform (5%) sẽ được khấu trừ trực tiếp khi giải ngân thành công.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
