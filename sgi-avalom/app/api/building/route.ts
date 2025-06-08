import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const buildings = await prisma.ava_edificio.findMany({
        include: {
          ava_propiedad: {
            include: {
              ava_tipopropiedad: true,
            },
            orderBy: {
              prop_identificador: "asc",
            },
          },
        },
        orderBy: {
          edi_identificador: "asc",
        },
      });
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(buildings) },
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

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const body = await request.json();

      if (!body.edi_identificador) {
        return NextResponse.json(
          { error: "El identificador del edificio es requerido" },
          { status: 400 }
        );
      }

      const building = await prisma.ava_edificio.create({
        data: {
          edi_identificador: body.edi_identificador,
          edi_descripcion: body.edi_descripcion,
          edi_direccion: body.edi_direccion,
          edi_codigopostal: body.edi_codigopostal,
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(building) },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
