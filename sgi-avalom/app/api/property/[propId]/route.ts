import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ propId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      const property = await prisma.ava_propiedad.findFirst({
        where: { prop_id: BigInt(params.propId) },
        include: {
          ava_alquiler: {
        orderBy: {
          alq_fechapago: "desc",
        },
        include: {
          ava_clientexalquiler: {
            include: {
          ava_cliente: true,
            },
          },
        },
          },
          ava_tipopropiedad: true,
          ava_edificio: true,
        },
      });
      if (!property) {
        return NextResponse.json(
          { success: false, error: "Propiedad no encontrada" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(property) },
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
  context: { params: Promise<{ propId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      const data = await req.json();

      const property = await prisma.ava_propiedad.update({
        where: { prop_id: BigInt(params.propId) },
        data: {
          prop_identificador: data.prop_identificador,
          prop_descripcion: data.prop_descripcion,
          tipp_id: data.tipp_id,
        },
      });
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(property) },
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ propId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      await prisma.ava_propiedad.delete({
        where: { prop_id: BigInt(params.propId) },
      });
      return NextResponse.json(
        { success: true, message: "Propiedad eliminada" },
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
