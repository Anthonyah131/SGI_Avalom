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

      const sums = await Promise.all(
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
      );

      const monthlyTotals = intervals.map((intv, idx) => ({
        month: intv.label,
        total: sums[idx]._sum.gas_monto ?? BigInt(0),
      }));

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt({ monthlyTotals }) },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error en expenses/monthly:", error);
      return NextResponse.json(
        { success: false, error: "Error al calcular gastos mensuales" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

