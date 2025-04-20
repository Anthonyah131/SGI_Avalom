import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ alqId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      const rent = await prisma.ava_alquiler.findFirst({
        where: { alq_id: BigInt(params.alqId) },
        include: {
          ava_alquilermensual: {
            include: {
              ava_pago: true,
            },
          },
          ava_clientexalquiler: {
            include: {
              ava_cliente: true,
            },
          },
          ava_deposito: {
            include: {
              ava_pago: true,
            },
          },
        },
      });
      if (!rent) {
        return NextResponse.json(
          { success: false, error: "Alquiler no encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(rent) },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
