import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function GET(
  request: NextRequest,
  { params }: { params: { cliId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const client = await prisma.ava_cliente.findUnique({
        where: { cli_id: parseInt(params.cliId) },
      });
      if (!client) {
        return NextResponse.json(
          { error: "Cliente no encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(client);
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { cliId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const body = await request.json();

      const cliId = parseInt(params.cliId);
      if (isNaN(cliId)) {
        return NextResponse.json({ error: "Id Invalido" }, { status: 400 });
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
      return NextResponse.json(updatedClient);
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return NextResponse.json(
            { error: "La cedula ya está registrada" },
            { status: 409 }
          );
        }
      }
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { cliId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      await prisma.ava_cliente.delete({
        where: { cli_id: parseInt(params.cliId) },
      });
      return NextResponse.json({ status: 204 });
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
