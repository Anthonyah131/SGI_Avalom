import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ alqId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { alqId } = await context.params;
      const data = await request.json();

      const rental = await prisma.ava_alquiler.findUnique({
        where: { alq_id: BigInt(alqId) },
        include: { ava_deposito: true, ava_alquilermensual: true },
      });

      if (!rental) {
        return NextResponse.json(
          { success: false, error: "Alquiler no encontrado" },
          { status: 404 }
        );
      }

      const allPaymentsCompleted = rental.ava_alquilermensual.every(
        (rent) => rent.alqm_estado === "P" || rent.alqm_estado === "R"
      );

      const isDepositPaid =
        rental.ava_deposito?.[0]?.depo_total ===
        rental.ava_deposito?.[0]?.depo_montoactual;

      if (!allPaymentsCompleted || !isDepositPaid) {
        return NextResponse.json(
          {
            success: false,
            error: "No se puede finalizar, hay pagos pendientes.",
          },
          { status: 400 }
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        await tx.ava_alquiler.update({
          where: { alq_id: BigInt(alqId) },
          data: { alq_estado: "F" },
        });

        await tx.ava_deposito.update({
          where: { depo_id: rental.ava_deposito?.[0]?.depo_id },
          data: {
            depo_montodevuelto: BigInt(data.depo_montodevuelto),
            depo_descmontodevuelto: data.depo_descmontodevuelto,
            depo_montocastigo: BigInt(data.depo_montocastigo),
            depo_descrmontocastigo: data.depo_descrmontocastigo,
            depo_fechadevolucion: data.depo_fechadevolucion
              ? new Date(data.depo_fechadevolucion)
              : null,
          },
        });

        return { success: true, message: "Alquiler finalizado correctamente" };
      });

      return NextResponse.json(
        { success: true, data: result },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error al finalizar el alquiler:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
