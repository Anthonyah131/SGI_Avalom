import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function PUT(
  request: NextRequest,
  context: { params: { alqId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { alqId } = await context.params;
      const requestData = await request.json();

      const {
        depo_montodevuelto,
        depo_descmontodevuelto,
        depo_montocastigo,
        depo_descrmontocastigo,
        depo_fechadevolucion,
        alqc_motivo,
        alqc_montodevuelto,
        alqc_castigo,
        alqc_motivomontodevuelto,
        alqc_motivocastigo,
        alqc_fecha_cancelacion,
      } = requestData;

      const rental = await prisma.ava_alquiler.findUnique({
        where: { alq_id: BigInt(alqId) },
        include: { ava_deposito: true },
      });

      if (!rental) {
        return NextResponse.json(
          { success: false, error: "Alquiler no encontrado" },
          { status: 404 }
        );
      }

      if (!rental.ava_deposito) {
        return NextResponse.json(
          {
            success: false,
            error: "No se encontró un depósito asociado al alquiler.",
          },
          { status: 400 }
        );
      }

      const depoId = rental.ava_deposito[0].depo_id;

      const result = await prisma.$transaction(async (tx) => {
        await tx.ava_alquiler.update({
          where: { alq_id: BigInt(alqId) },
          data: { alq_estado: "C" },
        });

        await tx.ava_deposito.update({
          where: { depo_id: depoId },
          data: {
            depo_montodevuelto: BigInt(depo_montodevuelto),
            depo_descmontodevuelto,
            depo_montocastigo: BigInt(depo_montocastigo),
            depo_descrmontocastigo,
            depo_fechadevolucion: new Date(depo_fechadevolucion),
          },
        });

        await tx.ava_alquilercancelado.create({
          data: {
            alqc_motivo,
            alqc_montodevuelto: BigInt(alqc_montodevuelto),
            alqc_castigo: BigInt(alqc_castigo),
            alqc_motivomontodevuelto,
            alqc_motivocastigo,
            alqc_fecha_cancelacion: new Date(alqc_fecha_cancelacion),
            alq_id: BigInt(alqId),
          },
        });

        return { success: true, message: "Alquiler cancelado correctamente" };
      });

      return NextResponse.json(
        { success: true, data: result },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error al cancelar el alquiler:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
