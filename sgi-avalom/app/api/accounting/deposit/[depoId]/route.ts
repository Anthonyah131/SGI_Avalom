import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ depoId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { depoId } = await context.params;

      const deposite = await prisma.ava_deposito.findUnique({
        where: { depo_id: BigInt(depoId) },
        include: {
          ava_pago: {
            include: {
              ava_anulacionpago: {
                include: {
                  ava_usuario: {
                    select: {
                      usu_id: true,
                      usu_nombre: true,
                      usu_papellido: true,
                      usu_correo: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!deposite) {
        return NextResponse.json(
          { success: false, error: "Deposito no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(deposite) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener el deposito:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}