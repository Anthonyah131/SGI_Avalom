"use client";

import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

export interface ProfitLossData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

interface ProfitLossChartProps {
  data: ProfitLossData[];
  totals?: {
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
  };
  loading?: boolean;
}

export function ProfitLossChart({
  data,
  totals,
  loading = false,
}: ProfitLossChartProps) {
  const hasData = data.length > 0;

  const formattedData = hasData
    ? data.map((item) => ({
        month: item.month,
        revenue: Number(item.revenue) || 0,
        expenses: Number(item.expenses) || 0,
        profit: Number(item.profit) || 0,
      }))
    : [];

  const maxValue = Math.max(
    ...formattedData.flatMap((item) => [item.revenue, item.expenses]),
    0
  ) * 1.2;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const CustomTooltip = ({ active, payload, label }: any) =>
    active && payload && payload.length ? (
      <div className="bg-background border rounded-md shadow-lg p-3 space-y-1">
        <p className="font-medium text-foreground mb-2">{`Mes: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            className={`font-semibold ${
              entry.dataKey === "revenue"
                ? "text-emerald-600"
                : entry.dataKey === "expenses"
                ? "text-red-600"
                : entry.value >= 0
                ? "text-blue-600"
                : "text-rose-600"
            }`}
          >
            {entry.dataKey === "revenue"
              ? "Ingresos"
              : entry.dataKey === "expenses"
              ? "Gastos"
              : "Ganancia"}{" "}
            : {formatCurrency(entry.value)}
          </p>
        ))}
        {payload.length >= 2 && (
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
            Ganancia neta:{" "}
            {formatCurrency(
              (payload.find((p: any) => p.dataKey === "revenue")?.value || 0) -
                (payload.find((p: any) => p.dataKey === "expenses")?.value || 0)
            )}
          </p>
        )}
      </div>
    ) : null;

  const profitColor = totals && totals.profit >= 0 ? "text-emerald-600" : "text-red-600";
  const ProfitIcon = totals && totals.profit >= 0 ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Card className="overflow-hidden border shadow-lg">
      <CardHeader className="p-4 sm:p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
              Ganancias y Pérdidas
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Comparación de ingresos vs gastos mensuales
            </CardDescription>
          </div>
          {totals && (
            <div className="text-right">
              <div className="flex items-center gap-2">
                <ProfitIcon className={`w-5 h-5 ${profitColor}`} />
                <p className={`text-lg font-bold ${profitColor}`}>
                  {formatCurrency(totals.profit)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Margen: {totals.margin.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative p-2 sm:p-6">
        {loading ? (
          <Skeleton className="h-64 sm:h-80 w-full" />
        ) : (
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedData}
                margin={{ top: 16, right: 16, left: 35, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => v.slice(0, 3)}
                  interval={0}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  domain={[0, maxValue]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                  width={60}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => {
                    const labels: { [key: string]: string } = {
                      revenue: "Ingresos",
                      expenses: "Gastos",
                      profit: "Ganancia",
                    };
                    return labels[value] || value;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="#10b981"
                  fill="url(#colorRevenue)"
                  fillOpacity={1}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="1"
                  stroke="#ef4444"
                  fill="url(#colorExpenses)"
                  fillOpacity={1}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#3b82f6"
                  fill="url(#colorProfit)"
                  fillOpacity={0.6}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 sm:p-6">
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span className="text-muted-foreground">Ingresos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-muted-foreground">Gastos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-muted-foreground">Ganancia</span>
          </div>
        </div>
        {totals && (
          <div className="text-right text-xs sm:text-sm">
            <p className="text-muted-foreground">
              Total Ingresos: <span className="font-semibold text-emerald-600">{formatCurrency(totals.revenue)}</span>
            </p>
            <p className="text-muted-foreground">
              Total Gastos: <span className="font-semibold text-red-600">{formatCurrency(totals.expenses)}</span>
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default ProfitLossChart;

