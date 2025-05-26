import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (_req: NextRequest, res: NextResponse) => {
    try {
      const [recentPayments, recentCancellations, recentClients] =
        await Promise.all([
          prisma.ava_pago.findMany({
            take: 5,
            orderBy: { pag_fechapago: "desc" },
            select: {
              pag_monto: true,
              pag_fechapago: true,
              pag_metodopago: true,
              pag_banco: true,
              pag_referencia: true,
              pag_estado: true,
              ava_alquilermensual: {
                select: {
                  alqm_identificador: true,
                  alqm_fechainicio: true,
                  alqm_fechafin: true,
                  alq_id: true,
                },
              },
              ava_deposito: {
                select: {
                  alq_id: true,
                  depo_id: true,
                },
              },
            },
          }),
          prisma.ava_alquilercancelado.findMany({
            take: 5,
            orderBy: { alqc_fecha_cancelacion: "desc" },
            select: {
              alqc_motivo: true,
              alqc_montodevuelto: true,
              alqc_castigo: true,
              alqc_fecha_cancelacion: true,
              ava_alquiler: {
                select: {
                  alq_id: true,
                  alq_monto: true,
                  ava_propiedad: {
                    select: {
                      prop_identificador: true,
                    },
                  },
                },
              },
            },
          }),
          prisma.ava_cliente.findMany({
            take: 5,
            orderBy: { cli_fechacreacion: "desc" },
            select: {
              cli_nombre: true,
              cli_papellido: true,
              cli_correo: true,
              cli_telefono: true,
              cli_fechacreacion: true,
            },
          }),
        ]);

      const data = {
        recentPayments,
        recentCancellations,
        recentClients,
      };

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(data) },
        { status: 200 }
      );
    } catch (error: any) {
      console.error(error);
      return NextResponse.json(
        { success: false, error: "Error al obtener actividades recientes" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
