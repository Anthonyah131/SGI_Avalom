import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const data = await req.json();

      const {
        anp_descripcion,
        anp_motivo,
        anp_fechaanulacion,
        pag_id,
        usu_id,
      } = data;

      const pago = await prisma.ava_pago.findUnique({
        where: { pag_id: BigInt(pag_id) },
        include: { ava_alquilermensual: true },
      });

      if (!pago || !pago.ava_alquilermensual) {
        throw new Error("El pago o el alquiler mensual relacionado no existe.");
      }

      const alquilerMensualId = pago.ava_alquilermensual.alqm_id;
      const montoAnulado = pago.pag_monto;

      const [anulacionPago, updatedAlquilerMensual, montoAntes, montoDespues] =
        await prisma.$transaction(async (tx) => {
          const alquilerMensualAntes = await tx.ava_alquilermensual.findUnique({
            where: { alqm_id: alquilerMensualId },
            select: {
              alqm_montopagado: true,
              alqm_montototal: true,
            },
          });

          const montoAntes =
            alquilerMensualAntes?.alqm_montopagado ?? BigInt(0);

          const anulacionPago = await tx.ava_anulacionpago.create({
            data: {
              anp_montofinal: BigInt(0),
              anp_montooriginal: BigInt(0),
              anp_descripcion,
              anp_motivo,
              anp_fechaanulacion: new Date(anp_fechaanulacion),
              pag_id: BigInt(pag_id),
              usu_id: BigInt(usu_id),
            },
          });

          const alquilerMensual = await tx.ava_alquilermensual.update({
            where: { alqm_id: alquilerMensualId },
            data: {
              alqm_montopagado: {
                decrement: montoAnulado,
              },
            },
            select: {
              alqm_montototal: true,
              alqm_montopagado: true,
            },
          });

          const montoDespues = alquilerMensual.alqm_montopagado;

          const nuevoEstado =
            montoDespues === BigInt(0)
              ? "I"
              : montoDespues < alquilerMensual.alqm_montototal
              ? "I"
              : "P";

          const updatedAlquilerMensual = await tx.ava_alquilermensual.update({
            where: { alqm_id: alquilerMensualId },
            data: { alqm_estado: nuevoEstado },
          });

          await tx.ava_pago.update({
            where: { pag_id: BigInt(pag_id) },
            data: { pag_estado: "D" },
          });

          await tx.ava_anulacionpago.update({
            where: { anp_id: anulacionPago.anp_id },
            data: {
              anp_montofinal: montoDespues,
              anp_montooriginal: montoAntes,
            },
          });

          return [
            anulacionPago,
            updatedAlquilerMensual,
            montoAntes,
            montoDespues,
          ];
        });

      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt({ anulacionPago, updatedAlquilerMensual }),
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Error al crear la anulación de pago: ", error.message);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
