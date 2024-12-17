import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ alqm_id: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { alqm_id } = await context.params;

      const monthlyRent = await prisma.ava_alquilermensual.findUnique({
        where: { alqm_id: BigInt(alqm_id) },
        include: { ava_alquiler: true },
      });

      if (!monthlyRent) {
        return NextResponse.json(
          { success: false, error: "Alquiler mensual no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(monthlyRent) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener el alquiler mensual:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ alqm_id: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { alqm_id } = await context.params;
      const data = await req.json();

      const updatedMonthlyRent = await prisma.ava_alquilermensual.update({
        where: { alqm_id: BigInt(alqm_id) },
        data: {
          alqm_identificador: data.alqm_identificador,
          alqm_fechainicio: new Date(data.alqm_fechainicio),
          alqm_fechafin: new Date(data.alqm_fechafin),
          alqm_montototal: BigInt(data.alqm_montototal),
          alqm_montopagado: BigInt(data.alqm_montopagado),
          alqm_fechapago: data.alqm_fechapago ? new Date(data.alqm_fechapago) : null,
          alqm_estado: data.alqm_estado,
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(updatedMonthlyRent) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al actualizar el alquiler mensual:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ alqm_id: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { alqm_id } = await context.params;

      await prisma.ava_alquilermensual.delete({
        where: { alqm_id: BigInt(alqm_id) },
      });

      return NextResponse.json(
        { success: true, message: "Alquiler mensual eliminado" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al eliminar el alquiler mensual:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
