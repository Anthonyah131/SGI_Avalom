import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const monthlyRents = await prisma.ava_alquilermensual.findMany({
        include: {
          ava_alquiler: true,
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(monthlyRents) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener los alquileres mensuales:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const data = await req.json();

      const monthlyRent = await prisma.ava_alquilermensual.create({
        data: {
          alqm_identificador: data.alqm_identificador,
          alqm_fechainicio: new Date(data.alqm_fechainicio),
          alqm_fechafin: new Date(data.alqm_fechafin),
          alqm_montototal: BigInt(data.alqm_montototal),
          alqm_montopagado: BigInt(data.alqm_montopagado),
          alqm_fechapago: data.alqm_fechapago
            ? new Date(data.alqm_fechapago)
            : null,
          alqm_estado: data.alqm_estado,
          alq_id: BigInt(data.alq_id),
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(monthlyRent) },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error al crear el alquiler mensual:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
