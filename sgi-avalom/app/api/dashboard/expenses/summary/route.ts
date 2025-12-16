import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (_req: NextRequest, res: NextResponse) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const [
        totalExpenses,
        monthlyExpenses,
        yearlyExpenses,
        serviceExpenses,
        maintenanceExpenses,
      ] = await Promise.all([
        // Total de gastos activos
        prisma.ava_gasto.aggregate({
          _sum: { gas_monto: true },
          where: { gas_estado: "A" },
        }),
        // Gastos del mes actual
        prisma.ava_gasto.aggregate({
          _sum: { gas_monto: true },
          where: {
            gas_estado: "A",
            gas_fecha: { gte: startOfMonth },
          },
        }),
        // Gastos del año actual
        prisma.ava_gasto.aggregate({
          _sum: { gas_monto: true },
          where: {
            gas_estado: "A",
            gas_fecha: { gte: startOfYear },
          },
        }),
        // Gastos de servicios
        prisma.ava_gasto.aggregate({
          _sum: { gas_monto: true },
          where: {
            gas_estado: "A",
            gas_tipo: "S",
          },
        }),
        // Gastos de mantenimiento
        prisma.ava_gasto.aggregate({
          _sum: { gas_monto: true },
          where: {
            gas_estado: "A",
            gas_tipo: "M",
          },
        }),
      ]);

      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt({
            total: totalExpenses._sum.gas_monto ?? BigInt(0),
            monthly: monthlyExpenses._sum.gas_monto ?? BigInt(0),
            yearly: yearlyExpenses._sum.gas_monto ?? BigInt(0),
            services: serviceExpenses._sum.gas_monto ?? BigInt(0),
            maintenance: maintenanceExpenses._sum.gas_monto ?? BigInt(0),
          }),
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error en expenses/summary:", error);
      return NextResponse.json(
        { success: false, error: "Error al obtener resumen de gastos" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

