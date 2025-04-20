import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ alqId: string }> }
) {
  return authenticate(async () => {
    try {
      const { alqId } = await ctx.params;

      const paymentsCount = await prisma.ava_pago.count({
        where: {
          ava_alquilermensual: {
            alq_id: BigInt(alqId),
          },
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt({
            hasPayments: paymentsCount > 0,
            paymentsCount,
          }),
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("GET has‑payments:", err);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(req, new NextResponse());
}
