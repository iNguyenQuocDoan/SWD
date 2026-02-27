"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { reportService } from "@/lib/services/report.service";
import { SellerRevenueTrendItem } from "@/types/report";

type TimeRange = "7d" | "30d" | "90d";

const formatPrice = (value: number) => {
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

export function RevenueChartSection() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [data, setData] = useState<SellerRevenueTrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState({ current: 0, previous: 0 });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { startDate, endDate } = getDateRange(timeRange);
        const res = await reportService.getSellerRevenueTrends({
          startDate,
          endDate,
          granularity: "day",
        });

        if (res.success && res.data) {
          setData(res.data.data);

          // Calculate comparison
          const total = res.data.data.reduce((sum, item) => sum + item.netRevenue, 0);

          // Fetch previous period for comparison
          const prevStart = new Date(startDate);
          const prevEnd = new Date(endDate);
          const daysDiff = Math.ceil((prevEnd.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24));
          prevStart.setDate(prevStart.getDate() - daysDiff);
          prevEnd.setDate(prevEnd.getDate() - daysDiff);

          const prevRes = await reportService.getSellerRevenueTrends({
            startDate: prevStart.toISOString().split("T")[0],
            endDate: prevEnd.toISOString().split("T")[0],
            granularity: "day",
          });

          const prevTotal = prevRes.success && prevRes.data
            ? prevRes.data.data.reduce((sum, item) => sum + item.netRevenue, 0)
            : 0;

          setComparison({ current: total, previous: prevTotal });
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

  const percentChange = comparison.previous > 0
    ? ((comparison.current - comparison.previous) / comparison.previous) * 100
    : 0;
  const isPositive = percentChange >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Biểu đồ doanh thu</CardTitle>
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
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <>
            {/* Comparison Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold">
                {formatPrice(comparison.current)}đ
              </span>
              {comparison.previous > 0 && (
                <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(percentChange).toFixed(1)}%</span>
                  <span className="text-muted-foreground">vs kỳ trước</span>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={formatPrice}
                  />
                  <Tooltip
                    formatter={(value) =>
                      new Intl.NumberFormat("vi-VN").format(Number(value)) + "đ"
                    }
                    labelFormatter={(label) => `Ngày: ${label}`}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="netRevenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
