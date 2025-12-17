import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

// GET: Obtener un servicio específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ servicioId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      
      const servicio = await prisma.ava_servicio.findFirst({
        where: { ser_id: BigInt(params.servicioId) },
      });

      if (!servicio) {
        return NextResponse.json(
          {
            success: false,
            error: "Servicio no encontrado",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt(servicio),
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error al obtener servicio:", error?.message || error);
      return NextResponse.json(
        {
          success: false,
          error: "Error al obtener servicio",
        },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

// PUT: Actualizar un servicio
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ servicioId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      const body = await request.json();
      const { ser_codigo, ser_nombre, ser_servicio, ser_negocio, ser_mediopago } = body;

      // Verificar si el servicio existe
      const existingService = await prisma.ava_servicio.findFirst({
        where: { ser_id: BigInt(params.servicioId) },
      });

      if (!existingService) {
        return NextResponse.json(
          {
            success: false,
            error: "Servicio no encontrado",
          },
          { status: 404 }
        );
      }

      // Si se está cambiando el código, verificar que no exista otro servicio con ese código
      if (ser_codigo !== existingService.ser_codigo) {
        const codeExists = await prisma.ava_servicio.findFirst({
          where: {
            ser_codigo: ser_codigo,
            NOT: { ser_id: BigInt(params.servicioId) },
          },
        });

        if (codeExists) {
          return NextResponse.json(
            {
              success: false,
              error: "Ya existe un servicio con ese código",
            },
            { status: 409 }
          );
        }
      }

      // Actualizar el servicio
      const updatedService = await prisma.ava_servicio.update({
        where: { ser_id: BigInt(params.servicioId) },
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
          data: stringifyWithBigInt(updatedService),
          message: "Servicio actualizado exitosamente",
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error al actualizar servicio:", error?.message || error);
      return NextResponse.json(
        {
          success: false,
          error: "Error al actualizar servicio",
        },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

// DELETE: Eliminar un servicio
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ servicioId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      
      // Verificar si el servicio existe
      const existingService = await prisma.ava_servicio.findFirst({
        where: { ser_id: BigInt(params.servicioId) },
      });

      if (!existingService) {
        return NextResponse.json(
          {
            success: false,
            error: "Servicio no encontrado",
          },
          { status: 404 }
        );
      }

      // Verificar si el servicio está siendo usado en algún gasto
      const gastosWithService = await prisma.ava_gasto.count({
        where: { ser_id: BigInt(params.servicioId) },
      });

      if (gastosWithService > 0) {
        return NextResponse.json(
          {
            success: false,
            error: `No se puede eliminar el servicio porque está siendo usado en ${gastosWithService} gasto(s)`,
          },
          { status: 409 }
        );
      }

      // Eliminar el servicio
      await prisma.ava_servicio.delete({
        where: { ser_id: BigInt(params.servicioId) },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Servicio eliminado exitosamente",
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error al eliminar servicio:", error?.message || error);
      return NextResponse.json(
        {
          success: false,
          error: "Error al eliminar servicio",
        },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
