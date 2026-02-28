"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown } from "lucide-react";
import { reportService } from "@/lib/services/report.service";
import { RevenueTrendItem } from "@/types/report";

type TimeRange = "7d" | "30d" | "90d";
type ChartType = "area" | "bar";

const formatPrice = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toString();
};

const getDateRange = (range: TimeRange) => {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
      start.setDate(end.getDate() - 30);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
  }

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
};

export function AdminRevenueChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [data, setData] = useState<RevenueTrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { startDate, endDate } = getDateRange(timeRange);
        const res = await reportService.getRevenueTrends({
          startDate,
          endDate,
          granularity: "day",
        });

        if (res.success && res.data) {
          setData(res.data.data);
          setSummary(res.data.summary);
        }
      } catch (err) {
        console.error("Failed to fetch revenue trends", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  const chartData = data.map((item) => ({
    ...item,
    date: item.date.day ? `${item.date.day}/${item.date.month}` : `${item.date.month}/${item.date.year}`,
  }));

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-medium">Doanh thu Platform</CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
              <TabsList className="h-7">
                <TabsTrigger value="area" className="text-xs h-6 px-2">Line</TabsTrigger>
                <TabsTrigger value="bar" className="text-xs h-6 px-2">Bar</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-1">
              {(["7d", "30d", "90d"] as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setTimeRange(range)}
                >
                  {range === "7d" ? "7 ngày" : range === "30d" ? "30 ngày" : "90 ngày"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-500">Tổng doanh thu</p>
                <p className="text-lg font-bold text-green-600">
                  {formatPrice(summary.totalRevenue)}đ
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-500">Tổng đơn hàng</p>
                <p className="text-lg font-bold text-blue-600">
                  {summary.totalOrders.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-500">TB/đơn</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatPrice(summary.avgOrderValue)}đ
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorAdminRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={formatPrice} />
                    <Tooltip
                      formatter={(value) =>
                        new Intl.NumberFormat("vi-VN").format(Number(value)) + "đ"
                      }
                      labelFormatter={(label) => `Ngày: ${label}`}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                    />
                    <Area type="monotone" dataKey="totalRevenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorAdminRevenue)" />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={formatPrice} />
                    <Tooltip
                      formatter={(value) =>
                        new Intl.NumberFormat("vi-VN").format(Number(value)) + "đ"
                      }
                      labelFormatter={(label) => `Ngày: ${label}`}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                    />
                    <Bar dataKey="totalRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
