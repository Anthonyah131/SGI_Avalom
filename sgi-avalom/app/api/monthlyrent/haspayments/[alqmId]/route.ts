import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  req: NextRequest,
  context: { params: { alqmId: string } }
) {
  return authenticate(async () => {
    try {
      const { alqmId } = context.params;

      const count = await prisma.ava_pago.count({
        where: {
          alqm_id: BigInt(alqmId),
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: { hasPayments: count > 0 },
        },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(req, new NextResponse());
}
