import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

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
      });
      return NextResponse.json(rentals);
    } catch (error) {
      console.error("Error al obtener los alquileres:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
