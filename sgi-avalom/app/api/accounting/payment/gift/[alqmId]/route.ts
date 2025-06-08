import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ alqmId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { alqmId } = await context.params;
      const id = BigInt(alqmId);

      // extraemos el flag del body: { isGifted: boolean }
      const { isGifted } = (await req.json()) as { isGifted: boolean };

      // 1) obtenemos la mensualidad
      const mensual = await prisma.ava_alquilermensual.findUnique({
        where: { alqm_id: id },
        select: {
          alqm_estado: true,
          alqm_montototal: true,
          alqm_montopagado: true,
          alqm_fechafin: true,
        },
      });
      if (!mensual) {
        return NextResponse.json(
          { success: false, error: "Alquiler mensual no encontrado" },
          { status: 404 }
        );
      }
      if (mensual.alqm_estado === "P" && isGifted) {
        return NextResponse.json(
          { success: false, error: "No se puede regalar un mes ya pagado" },
          { status: 400 }
        );
      }

      // 2) calculamos el nuevo estado
      let nuevoEstado: string;
      if (isGifted) {
        nuevoEstado = "R";
      } else {
        // calcular Atrasado o Incompleto
        const now = new Date();
        const fin = new Date(mensual.alqm_fechafin);
        if (mensual.alqm_montopagado < mensual.alqm_montototal) {
          // si ya pasó la fecha y no completó → atrasado
          nuevoEstado = fin < now ? "A" : "I";
        } else {
          // si por alguna razón está pagado a completo
          nuevoEstado = "P";
        }
      }

      // 3) actualizamos
      const updated = await prisma.ava_alquilermensual.update({
        where: { alqm_id: id },
        data: { alqm_estado: nuevoEstado },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(updated) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al regalar/desregalar mes:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
