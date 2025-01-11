import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const data = await req.json();

      const {
        pag_monto,
        pag_fechapago,
        pag_estado,
        pag_cuenta,
        pag_descripcion,
        alqm_id,
      } = data;

      const paymentAmount = BigInt(pag_monto);

      const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.ava_pago.create({
          data: {
            pag_monto: paymentAmount,
            pag_fechapago: new Date(pag_fechapago),
            pag_estado,
            pag_cuenta,
            pag_descripcion,
            alqm_id: BigInt(alqm_id),
          },
        });

        const currentMonthlyRent = await tx.ava_alquilermensual.findUnique({
          where: { alqm_id: BigInt(alqm_id) },
        });

        if (!currentMonthlyRent) {
          throw new Error("El alquiler mensual no existe.");
        }

        const newMontopagado =
          currentMonthlyRent.alqm_montopagado + paymentAmount;

        const newEstado =
          newMontopagado >= currentMonthlyRent.alqm_montototal
            ? "P"
            : currentMonthlyRent.alqm_estado;

        const updatedMonthlyRent = await tx.ava_alquilermensual.update({
          where: { alqm_id: BigInt(alqm_id) },
          data: {
            alqm_montopagado: newMontopagado,
            alqm_estado: newEstado,
          },
        });

        return { payment, updatedMonthlyRent };
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(result) },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
