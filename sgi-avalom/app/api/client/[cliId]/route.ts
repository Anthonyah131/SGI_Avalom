import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ cliId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      const client = await prisma.ava_cliente.findUnique({
        where: { cli_id: BigInt(params.cliId) },
      });
      if (!client) {
        return NextResponse.json(
          { success: false, error: "Cliente no encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(client) },
        { status: 200 }
      );
    } catch (error: any) {
      console.error(
        "Error inesperado en GET /api/client/[cliId]:",
        error?.message || error
      );
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ cliId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      const body = await request.json();

      let cliId: bigint;
      try {
        cliId = BigInt(params.cliId);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Id Invalido" },
          { status: 400 }
        );
      }

      const updatedClient = await prisma.ava_cliente.update({
        where: { cli_id: cliId },
        data: {
          cli_nombre: body.cli_nombre,
          cli_cedula: body.cli_cedula,
          cli_papellido: body.cli_papellido,
          cli_sapellido: body.cli_sapellido,
          cli_telefono: body.cli_telefono,
          cli_correo: body.cli_correo,
        },
      });
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(updatedClient) },
        { status: 200 }
      );
    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return NextResponse.json(
            {
              success: false,
              error: "Ya existe un cliente con campos duplicados",
            },
            { status: 409 }
          );
        }
      }

      console.error(
        "Error inesperado en PUT /api/client/[cliId]:",
        error?.message || error
      );
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ cliId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      await prisma.ava_cliente.delete({
        where: { cli_id: BigInt(params.cliId) },
      });
      return NextResponse.json(
        { success: true, message: "Cliente eliminado" },
        { status: 200 }
      );
    } catch (error: any) {
      console.error(
        "Error inesperado en DELETE /api/client/[cliId]:",
        error?.message || error
      );
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
