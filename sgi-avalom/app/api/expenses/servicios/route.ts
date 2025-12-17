import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

// GET: Obtener todos los servicios
export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const servicios = await prisma.ava_servicio.findMany({
        orderBy: {
          ser_codigo: "asc",
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt(servicios),
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error al obtener servicios:", error?.message || error);
      return NextResponse.json(
        {
          success: false,
          error: "Error al obtener servicios",
        },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

// POST: Crear un nuevo servicio
export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const body = await request.json();
      const { ser_codigo, ser_nombre, ser_servicio, ser_negocio, ser_mediopago } = body;

      // Validar campos requeridos
      if (!ser_codigo || !ser_nombre) {
        return NextResponse.json(
          {
            success: false,
            error: "Código y nombre son campos requeridos",
          },
          { status: 400 }
        );
      }

      // Verificar si el código ya existe
      const existingService = await prisma.ava_servicio.findFirst({
        where: { ser_codigo: ser_codigo },
      });

      if (existingService) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe un servicio con ese código",
          },
          { status: 409 }
        );
      }

      // Crear el servicio
      const newService = await prisma.ava_servicio.create({
        data: {
          ser_codigo: ser_codigo,
          ser_nombre: ser_nombre,
          ser_servicio: ser_servicio || null,
          ser_negocio: ser_negocio || null,
          ser_mediopago: ser_mediopago || null,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt(newService),
          message: "Servicio creado exitosamente",
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Error al crear servicio:", error?.message || error);
      return NextResponse.json(
        {
          success: false,
          error: "Error al crear servicio",
        },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
