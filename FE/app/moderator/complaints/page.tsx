"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  PlayCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Timer,
  ArrowLeft,
  Search,
  Filter,
  ArrowUpRight,
  MessageSquareWarning,
  FileText,
  Shield,
  Activity,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { complaintService } from "@/lib/services/complaint.service";
import { useAuthStore } from "@/lib/auth";
import type { ComplaintQueueItem, ComplaintQueueStats, Complaint } from "@/types";
import { cn } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

// Cấu hình nhãn và màu sắc trạng thái
const STATUS_STYLES: Record<string, { label: string; class: string; icon: any; color: string }> = {
  InQueue: { 
    label: "Chờ tiếp nhận", 
    class: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
    icon: Clock,
    color: "#f97316"
  },
  Assigned: { 
    label: "Đã nhận đơn", 
    class: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    icon: CheckCircle,
    color: "#3b82f6"
  },
  ModeratorAssigned: { 
    label: "Đã nhận đơn", 
    class: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    icon: CheckCircle,
    color: "#3b82f6"
  },
  InReview: { 
    label: "Đang kiểm tra", 
    class: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400",
    icon: Eye,
    color: "#6366f1"
  },
  NeedMoreInfo: { 
    label: "Chờ phản hồi", 
    class: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse",
    icon: MessageSquareWarning,
    color: "#f43f5e"
  },
  Resolved: { 
    label: "Đã giải quyết", 
    class: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle,
    color: "#22c55e"
  },
};

const categoryLabels: Record<string, string> = {
  ProductQuality: "Chất lượng sản phẩm",
  NotAsDescribed: "Không đúng mô tả",
  MissingWrongItems: "Thiếu/Sai sản phẩm",
  AccountNotWorking: "Tài khoản không hoạt động",
  DeliveryIssues: "Vấn đề giao hàng",
  SellerNotResponding: "Người bán không phản hồi",
  RefundDispute: "Tranh chấp hoàn tiền",
};

export default function ModeratorComplaintsPage() {
  const router = useRouter();
  const moderatorId = useAuthStore((s) => s.user?.id || (s.user as any)?._id);

  const [activeTab, setActiveTab] = useState("queue");
  const [isLoading, setIsLoading] = useState(true);
  const [isPickingNext, setIsPickingNext] = useState(false);
  const [queueItems, setQueueItems] = useState<ComplaintQueueItem[]>([]);
  const [inProgressItems, setInProgressItems] = useState<ComplaintQueueItem[]>([]);
  const [stats, setStats] = useState<ComplaintQueueStats | null>(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const [queueResult, statsResult, assignedResult, inProgressResult] = await Promise.all([
        complaintService.getQueue({ status: "InQueue", limit: 50 }),
        complaintService.getQueueStats(),
        moderatorId
          ? complaintService.getQueue({ status: "Assigned", assignedModeratorId: moderatorId, limit: 50 })
          : Promise.resolve({ items: [], total: 0 }),
        moderatorId
          ? complaintService.getQueue({ assignedModeratorId: moderatorId, limit: 50 })
          : Promise.resolve({ items: [], total: 0 }),
      ]);

      setQueueItems(queueResult.items);
      setStats(statsResult);
      
      const myItems = [...(assignedResult.items || []), ...(inProgressResult.items || [])].filter(
        (item, index, self) => 
          item.status !== "InQueue" && 
          index === self.findIndex((t) => t._id === item._id)
      );
      setInProgressItems(myItems);
    } catch (error) {
      console.error("Failed to fetch queue:", error);
      toast.error("Không thể tải hàng đợi khiếu nại");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [moderatorId]);

  // Data cho biểu đồ phân bổ Donut
  const distributionData = useMemo(() => [
    { name: "Hàng đợi chung", value: queueItems.length, color: "#f97316" },
    { name: "Đang xử lý", value: inProgressItems.length, color: "#3b82f6" },
  ], [queueItems.length, inProgressItems.length]);

  // Data cho biểu đồ trạng thái Bar
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { Assigned: 0, InReview: 0, NeedMoreInfo: 0 };
    inProgressItems.forEach(item => {
      const status = item.status === "ModeratorAssigned" ? "Assigned" : item.status;
      if (counts[status] !== undefined) counts[status]++;
    });
    return [
      { name: "Đã nhận", value: counts.Assigned, color: "#3b82f6" },
      { name: "Kiểm tra", value: counts.InReview, color: "#6366f1" },
      { name: "Phản hồi", value: counts.NeedMoreInfo, color: "#f43f5e" },
    ];
  }, [inProgressItems]);

  const handlePickNext = async () => {
    setIsPickingNext(true);
    try {
      const queueItem = await complaintService.pickFromQueue();
      if (queueItem) {
        toast.success("Đã nhận khiếu nại mới thành công");
        await fetchQueue();
        setActiveTab("my-assigned");
        const ticketId = typeof queueItem.ticketId === "string" ? queueItem.ticketId : (queueItem.ticketId as Complaint)._id;
        router.push(`/moderator/complaints/${ticketId}`);
      } else {
        toast.info("Hiện không còn khiếu nại nào trong hàng đợi");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể nhận khiếu nại");
    } finally {
      setIsPickingNext(false);
    }
  };

  const handleViewComplaint = (item: ComplaintQueueItem) => {
    const ticketId = typeof item.ticketId === "string" ? item.ticketId : (item.ticketId as Complaint)._id;
    router.push(`/moderator/complaints/${ticketId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}p`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)} ngày`;
  };

  const ComplaintCard = ({ item }: { item: ComplaintQueueItem }) => {
    const ticket = typeof item.ticketId === "object" ? item.ticketId as Complaint : null;
    const displayStatus = ticket?.status && STATUS_STYLES[ticket.status] ? ticket.status : item.status;
    const style = STATUS_STYLES[displayStatus] || { label: displayStatus, class: "bg-slate-100", icon: FileText };
    const StatusIcon = style.icon;

    return (
      <Card 
        className="group relative overflow-hidden transition-all hover:shadow-md border-l-4" 
        style={{ borderLeftColor: item.isHighValue ? "#ef4444" : item.isEscalated ? "#f59e0b" : "#e2e8f0" }}
      >
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-muted-foreground tracking-tighter">
                  {ticket?.ticketCode || "N/A"}
                </span>
                
                {ticket?.status && ticket.status !== item.status && STATUS_STYLES[item.status] && (
                  <Badge variant="outline" className={cn("px-2 py-0 text-[10px] uppercase font-medium opacity-70", STATUS_STYLES[item.status].class)}>
                    {STATUS_STYLES[item.status].label}
                  </Badge>
                )}

                <Badge variant="outline" className={cn("px-2 py-0 text-[10px] uppercase font-bold", style.class)}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {style.label}
                </Badge>

                {item.isHighValue && (
                  <Badge variant="destructive" className="px-2 py-0 text-[10px] uppercase font-black tracking-widest">
                    Giá trị cao
                  </Badge>
                )}
                {item.isEscalated && (
                  <Badge className="px-2 py-0 text-[10px] uppercase font-bold bg-amber-500 hover:bg-amber-600">
                    Leo thang
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                  {ticket?.title || "Không có tiêu đề"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                  &quot;{ticket?.content}&quot;
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  {ticket?.category ? categoryLabels[ticket.category] : "Chưa phân loại"}
                </div>
                <div className="flex items-center gap-1 text-foreground font-bold">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  {formatPrice(item.orderValue)}
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  Chờ: {formatTime(item.ticketAge * 60)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-start">
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-9 px-4 font-bold shadow-sm"
                onClick={() => handleViewComplaint(item)}
              >
                Chi tiết
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Điều phối Tranh chấp</h1>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 ml-1 text-sm font-medium">
            <Activity className="h-4 w-4 text-green-500" />
            Giám sát và xử lý khiếu nại khách hàng thời gian thực
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchQueue} disabled={isLoading} className="rounded-xl shadow-sm h-11 px-5 font-semibold">
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Làm mới
          </Button>
          <Button 
            onClick={handlePickNext} 
            disabled={isPickingNext || isLoading} 
            className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 px-6 font-bold text-base"
          >
            {isPickingNext ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <PlayCircle className="mr-2 h-5 w-5" />}
            Nhận đơn tiếp theo
          </Button>
        </div>
      </div>

      {/* Visual Analytics Bento Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-12">
        {/* Donut Chart: Distribution */}
        <Card className="md:col-span-4 border-none shadow-sm bg-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" /> Phân bổ tổng đơn
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] pt-0">
            {isLoading ? <Skeleton className="h-full w-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart: My Status */}
        <Card className="md:col-span-5 border-none shadow-sm bg-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Trạng thái của tôi
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] pt-0">
            {isLoading ? <Skeleton className="h-full w-full rounded-xl" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                  <YAxis hide />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="md:col-span-3 grid grid-rows-2 gap-4">
          <Card className="border-none shadow-sm bg-orange-50/50 dark:bg-orange-900/10">
            <CardContent className="p-4 flex items-center gap-4 h-full">
              <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-900/30">
                <Timer className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-orange-700/70">Chờ trung bình</p>
                <div className="text-xl font-black">{isLoading ? "..." : formatTime(stats?.avgWaitTimeMinutes || 0)}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-rose-50/50 dark:bg-rose-900/10">
            <CardContent className="p-4 flex items-center gap-4 h-full">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/30">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-rose-700/70">Đơn cũ nhất</p>
                <div className="text-xl font-black">{isLoading ? "..." : (stats?.oldestTicketHours ? `${Math.round(stats.oldestTicketHours)}h` : "N/A")}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-1">
          <TabsList className="bg-transparent h-12 p-0 gap-8">
            <TabsTrigger 
              value="queue" 
              className="px-0 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none font-bold text-base transition-all"
            >
              Hàng đợi chung ({queueItems.length})
            </TabsTrigger>
            <TabsTrigger 
              value="my-assigned" 
              className="px-0 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none font-bold text-base transition-all"
            >
              Của tôi đang xử lý ({inProgressItems.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input 
              type="text" 
              placeholder="Mã đơn, tiêu đề..." 
              className="pl-10 pr-4 h-10 w-full sm:w-[300px] bg-muted/50 border border-transparent rounded-xl text-sm focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
            />
          </div>
        </div>

        <TabsContent value="queue" className="mt-0 outline-none space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
          ) : queueItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/20">
              <div className="p-4 rounded-full bg-background shadow-sm mb-4">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold">Hàng đợi sạch bóng!</h3>
              <p className="text-muted-foreground mt-2 max-w-xs">Không có khiếu nại nào đang chờ. Bạn có thể nghỉ ngơi một chút.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {queueItems.map((item) => <ComplaintCard key={item._id} item={item} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-assigned" className="mt-0 outline-none space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
          ) : inProgressItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/20">
              <div className="p-4 rounded-full bg-background shadow-sm mb-4">
                <PlayCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Bạn chưa nhận đơn nào</h3>
              <p className="text-muted-foreground mt-2 max-w-xs">Hãy nhấn &quot;Nhận đơn tiếp theo&quot; để bắt đầu giải quyết các khiếu nại.</p>
              <Button onClick={handlePickNext} variant="default" className="mt-6 rounded-xl font-bold px-8 h-11">Bắt đầu ngay</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {inProgressItems.map((item) => <ComplaintCard key={item._id} item={item} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
