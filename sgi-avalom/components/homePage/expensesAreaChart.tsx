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
import { formatCurrencyNoDecimals } from "@/utils/currencyConverter";

export interface MonthlyExpense {
  month: string;
  total: number;
}

interface ExpensesAreaChartProps {
  data: MonthlyExpense[];
  loading?: boolean;
}

export function ExpensesAreaChart({
  data,
  loading = false,
}: ExpensesAreaChartProps) {
  const hasData = data.length > 0;

  const formattedData = hasData
    ? data.map((item) => ({
        month: item.month,
        total: Number(item.total) || 0,
      }))
    : [];

  const maxValue =
    formattedData.reduce((max, item) => Math.max(max, item.total), 0) * 1.2;


  const CustomTooltip = ({ active, payload, label }: any) =>
    active && payload && payload.length ? (
      <div className="bg-background border rounded-md shadow-lg p-3">
        <p className="font-medium text-foreground">{`Mes: ${label}`}</p>
        <p className="text-red-500 font-semibold">{`Gastos: ${formatCurrencyNoDecimals(
          payload[0].value
        )}`}</p>
      </div>
    ) : null;

  return (
    <Card className="overflow-hidden border shadow-lg">
      <CardHeader className="p-4 sm:p-6 border-b">
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
          Gastos Últimos 12 Meses
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Evolución de los gastos mensuales del sistema
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
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
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
                  tickFormatter={formatCurrencyNoDecimals}
                  width={60}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#ef4444"
                  fill="url(#colorExpenses)"
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
          Últimos 12 meses de gastos registrados
        </p>
      </CardFooter>
    </Card>
  );
}

export default ExpensesAreaChart;

