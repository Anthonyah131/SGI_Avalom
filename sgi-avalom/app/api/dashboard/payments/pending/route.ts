import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (_req: NextRequest, res: NextResponse) => {
    try {
      const [
        mensualidadesImpagasCount,
        depositosPendientesCount,
        mensualidadesPendientes,
        depositosPendientesList,
      ] = await Promise.all([
        prisma.ava_alquilermensual.count({
          where: { alqm_estado: { not: "P" } },
        }),
        prisma.ava_deposito.count({
          where: {
            depo_montoactual: { lt: prisma.ava_deposito.fields.depo_total },
            depo_fechadevolucion: null,
          },
        }),
        prisma.ava_alquilermensual.findMany({
          where: { alqm_estado: { not: "P" } },
          take: 10,
          orderBy: { alqm_fechainicio: "asc" },
          select: {
            alqm_id: true,
            alqm_identificador: true,
            alqm_fechainicio: true,
            alqm_fechafin: true,
            alqm_montototal: true,
            alqm_montopagado: true,
            ava_alquiler: {
              select: {
                alq_id: true,
                prop_id: true,
                ava_propiedad: {
                  select: { prop_identificador: true },
                },
              },
            },
          },
        }),
        prisma.ava_deposito.findMany({
          where: {
            depo_montoactual: { lt: prisma.ava_deposito.fields.depo_total },
            depo_fechadevolucion: null,
          },
          take: 10,
          orderBy: { depo_fechacreacion: "asc" },
          select: {
            depo_id: true,
            depo_montoactual: true,
            depo_total: true,
            depo_fechacreacion: true,
            ava_alquiler: {
              select: {
                alq_id: true,
                prop_id: true,
                ava_propiedad: {
                  select: { prop_identificador: true },
                },
              },
            },
          },
        }),
      ]);

      const data = {
        totals: {
          mensualidadesImpagas: mensualidadesImpagasCount,
          depositosPendientes: depositosPendientesCount,
        },
        mensualidadesPendientes,
        depositosPendientesList,
      };

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(data) },
        { status: 200 }
      );
    } catch (error: any) {
      console.error(error);
      return NextResponse.json(
        { success: false, error: "Error al obtener pagos pendientes" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
