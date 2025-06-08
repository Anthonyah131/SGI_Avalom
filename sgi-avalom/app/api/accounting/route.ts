import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const rentals = await prisma.ava_alquiler.findMany({
        include: {
          ava_propiedad: {
            include: {
              ava_edificio: true,
              ava_tipopropiedad: true,
            },
          },
        },
        orderBy: {
          ava_propiedad: {
            prop_identificador: "asc",
          },
        },
      });
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(rentals) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener los alquileres:", error);
      return NextResponse.json(
        { success: true, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
