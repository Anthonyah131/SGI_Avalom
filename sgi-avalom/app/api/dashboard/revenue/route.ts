import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET(request: NextRequest) {
  return authenticate(async (_req: NextRequest, res: NextResponse) => {
    try {
      const monthsParam = request.nextUrl.searchParams.get("months");
      const count = monthsParam ? parseInt(monthsParam, 10) : 6;
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
      );

      const monthlyTotals = intervals.map((intv, idx) => ({
        month: intv.label,
        total: sums[idx]._sum.pag_monto ?? 0,
      }));

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt({ monthlyTotals }) },
        { status: 200 }
      );
    } catch (error: any) {
      console.error(error);
      return NextResponse.json(
        { success: false, error: "Error al calcular ingresos mensuales" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
