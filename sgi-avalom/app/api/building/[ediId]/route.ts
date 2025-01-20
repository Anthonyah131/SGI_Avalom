import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ediId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      const building = await prisma.ava_edificio.findFirst({
        where: { edi_id: BigInt(params.ediId) },
        include: {
          ava_propiedad: true,
        },
      });
      if (!building) {
        return NextResponse.json(
          { success: false, error: "Edificio no encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(building) },
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
  context: { params: Promise<{ ediId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      const data = await req.json();

      const building = await prisma.ava_edificio.update({
        where: { edi_id: BigInt(params.ediId) },
        data: {
          edi_identificador: data.edi_identificador,
          edi_descripcion: data.edi_descripcion,
        },
      });
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(building) },
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ ediId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      const ediId = BigInt(params.ediId);

      const buildingWithProperties = await prisma.ava_edificio.findFirst({
        where: { edi_id: ediId },
        include: {
          ava_propiedad: true,
        },
      });

      if (!buildingWithProperties) {
        return NextResponse.json(
          { success: false, error: "Edificio no encontrado" },
          { status: 404 }
        );
      }

      if (buildingWithProperties.ava_propiedad.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `No se puede eliminar el edificio ${buildingWithProperties.edi_identificador} porque tiene propiedades relacionadas.`,
          },
          { status: 400 }
        );
      }

      await prisma.ava_edificio.delete({
        where: { edi_id: ediId },
      });

      return NextResponse.json(
        { success: true, message: "Edificio eliminado exitosamente" },
        { status: 200 }
      );
    } catch (error: any) {
      console.error(error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Error interno del servidor",
        },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
