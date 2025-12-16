import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET(request: NextRequest) {
  return authenticate(async (_req: NextRequest, res: NextResponse) => {
    try {
      const monthsParam = request.nextUrl.searchParams.get("months");
      const count = monthsParam ? parseInt(monthsParam, 10) : 12;
      const now = new Date();

      const intervals = Array.from({ length: count }).map((_, i) => {
        const date = subMonths(now, count - 1 - i);
        return {
          start: startOfMonth(date),
          end: endOfMonth(date),
          label: format(date, "MMM yyyy"),
        };
      });

      const [revenueData, expensesData] = await Promise.all([
        // Ingresos por mes
        Promise.all(
          intervals.map(({ start, end }) =>
            prisma.ava_pago.aggregate({
              _sum: { pag_monto: true },
              where: {
                pag_fechapago: {
                  gte: start,
                  lte: end,
                },
                pag_estado: "A",
              },
            })
          )
        ),
        // Gastos por mes
        Promise.all(
          intervals.map(({ start, end }) =>
            prisma.ava_gasto.aggregate({
              _sum: { gas_monto: true },
              where: {
                gas_fecha: {
                  gte: start,
                  lte: end,
                },
                gas_estado: "A",
              },
            })
          )
        ),
      ]);

      const monthlyData = intervals.map((intv, idx) => {
        const revenue = revenueData[idx]._sum.pag_monto ?? BigInt(0);
        const expenses = expensesData[idx]._sum.gas_monto ?? BigInt(0);
        const profit = Number(revenue) - Number(expenses);
        const margin = Number(revenue) > 0 
          ? (profit / Number(revenue)) * 100 
          : 0;

        return {
          month: intv.label,
          revenue: Number(revenue),
          expenses: Number(expenses),
          profit,
          margin: Math.round(margin * 100) / 100,
        };
      });

      // Totales generales
      const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
      const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
      const totalProfit = totalRevenue - totalExpenses;
      const totalMargin = totalRevenue > 0 
        ? (totalProfit / totalRevenue) * 100 
        : 0;

      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt({
            monthlyData,
            totals: {
              revenue: totalRevenue,
              expenses: totalExpenses,
              profit: totalProfit,
              margin: Math.round(totalMargin * 100) / 100,
            },
          }),
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error en profit-loss:", error);
      return NextResponse.json(
        { success: false, error: "Error al calcular ganancias y pérdidas" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

