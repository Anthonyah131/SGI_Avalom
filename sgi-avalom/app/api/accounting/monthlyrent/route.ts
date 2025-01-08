import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const monthlyRents = await prisma.ava_alquilermensual.findMany({});

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
