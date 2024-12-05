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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ alqId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      const rentalId = BigInt(params.alqId);
      const data = await req.json();
      const { ava_clientexalquiler, ...alquilerData } = data;

      const updatedRental = await prisma.$transaction(async (prisma) => {
        const rent = await prisma.ava_alquiler.update({
          where: { alq_id: rentalId },
          data: {
            ...alquilerData,
            alq_monto: BigInt(alquilerData.alq_monto),
          },
        });

        if (ava_clientexalquiler && Array.isArray(ava_clientexalquiler)) {
          await prisma.ava_clientexalquiler.deleteMany({
            where: { alq_id: rentalId },
          });

          if (ava_clientexalquiler.length > 0) {
            const clientConnections = ava_clientexalquiler.map((relation) => ({
              alq_id: rentalId,
              cli_id: relation.cli_id,
            }));

            await prisma.ava_clientexalquiler.createMany({
              data: clientConnections,
            });
          }
        }

        return prisma.ava_alquiler.findUnique({
          where: { alq_id: rentalId },
          include: {
            ava_clientexalquiler: {
              include: { ava_cliente: true },
            },
          },
        });
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(updatedRental) },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error actualizando el alquiler:", error.message);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor." },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ alqId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      await prisma.ava_alquiler.delete({
        where: { alq_id: BigInt(params.alqId) },
      });
      return NextResponse.json(
        { success: true, message: "Alquiler eliminado" },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
