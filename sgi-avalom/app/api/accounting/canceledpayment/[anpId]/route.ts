import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ anpId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { anpId } = await context.params;

      const monthlyRent = await prisma.ava_anulacionpago.findUnique({
        where: { anp_id: BigInt(anpId) },
      });

      if (!monthlyRent) {
        return NextResponse.json(
          { success: false, error: "Pago no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(monthlyRent) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener la anulación de pago: ", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ anpId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { anpId } = await context.params;
      const data = await req.json();

      const updatedMonthlyRent = await prisma.ava_anulacionpago.update({
        where: { anp_id: BigInt(anpId) },
        data: {
          anp_descripcion: data.anp_descripcion,
          anp_motivo: data.anp_motivo,
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(updatedMonthlyRent) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al actualizar la anulación de pagos: ", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
