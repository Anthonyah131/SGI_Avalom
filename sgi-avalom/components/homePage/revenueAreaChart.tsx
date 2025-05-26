"use client";

import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
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

export interface MonthlyTotal {
  month: string;
  total: number;
}

interface RevenueAreaChartProps {
  data: MonthlyTotal[];
  loading?: boolean;
}

export function RevenueAreaChart({
  data,
  loading = false,
}: RevenueAreaChartProps) {
  const hasData = data.length > 0;

  const formattedData = hasData
    ? data.map((item) => ({
        month: item.month,
        total: Number(item.total) || 0,
      }))
    : [];

  const maxValue =
    formattedData.reduce((max, item) => Math.max(max, item.total), 0) * 1.2;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const CustomTooltip = ({ active, payload, label }: any) =>
    active && payload && payload.length ? (
      <div className="bg-background border rounded-md shadow-md p-3">
        <p className="font-medium">{`Mes: ${label}`}</p>
        <p className="text-blue-500">{`Total: ${formatCurrency(
          payload[0].value
        )}`}</p>
      </div>
    ) : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">
          Ingresos Últimos 12 Meses
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Muestra los ingresos totales por mes.
        </CardDescription>
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
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => v.slice(0, 3)}
                  interval={0}
                />
                <YAxis
                  domain={[0, maxValue]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#0ea5e9"
                  fill="url(#colorTotal)"
                  fillOpacity={1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 sm:p-6">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Últimos 12 meses de ingresos
        </p>
      </CardFooter>
    </Card>
  );
}

export default RevenueAreaChart;
