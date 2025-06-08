import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ alqId: string }> }
) {
  return authenticate(async (_req: NextRequest, _res: NextResponse) => {
    try {
      const params = await context.params;
      const alqId = BigInt(params.alqId);

      const alquiler = await prisma.ava_alquiler.findUnique({
        where: { alq_id: alqId },
        include: {
          ava_propiedad: true,
          ava_clientexalquiler: {
            include: { ava_cliente: true },
          },
          ava_deposito: true,
        },
      });

      if (!alquiler) {
        return NextResponse.json(
          { success: false, error: "Alquiler no encontrado" },
          { status: 404 }
        );
      }

      const pagoPendiente = await prisma.ava_alquilermensual.findFirst({
        where: {
          alq_id: alqId,
          alqm_estado: {
            notIn: ["P", "R"],
          },
        },
        select: { alqm_id: true },
      });

      const hayPagosPendientes = !!pagoPendiente;

      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt({
            alquiler,
            propiedad: alquiler.ava_propiedad,
            clientes: alquiler.ava_clientexalquiler.map((c) => c.ava_cliente),
            deposito: alquiler.ava_deposito[0],
            hayPagosPendientes,
          }),
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error al obtener detalles del alquiler:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Error interno del servidor",
        },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
