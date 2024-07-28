import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { propId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const property = await prisma.ava_propiedad.findFirst({
        where: { prop_id: Number(params.propId) },
        include: {
          ava_alquiler: true,
          ava_tipopropiedad: true,
          ava_edificio: true,
        },
      });
      if (!property) {
        return NextResponse.json(
          { error: "Propiedad no encontrada" },
          { status: 404 }
        );
      }
      return NextResponse.json(property);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { propId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const data = await req.json();
      const property = await prisma.ava_propiedad.update({
        where: { prop_id: Number(params.propId) },
        data,
      });
      return NextResponse.json(property);
    } catch (error) {
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { propId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      await prisma.ava_propiedad.delete({
        where: { prop_id: Number(params.propId) },
      });
      return NextResponse.json({
        message: "Propiedad eliminada correctamente",
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
