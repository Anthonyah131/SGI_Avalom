import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { cliId: string } }
) {
  try {
    return authenticate(async (req: NextRequest, res: NextResponse) => {
      const client = await prisma.ava_cliente.findUnique({
        where: { cli_id: parseInt(params.cliId) },
      });
      if (!client) {
        return NextResponse.json({ status: 404, message: "Client Not Found" });
      }
      return NextResponse.json(client);
    })(request, new NextResponse());
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { cliId: string } }
) {
  try {
    return authenticate(async (req: NextRequest, res: NextResponse) => {
      const body = await request.json();
      const updatedClient = await prisma.ava_cliente.update({
        where: { cli_id: parseInt(params.cliId) },
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
    })(request, new NextResponse());
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { cliId: string } }
) {
  try {
    return authenticate(async (req: NextRequest, res: NextResponse) => {
      await prisma.ava_cliente.delete({
        where: { cli_id: parseInt(params.cliId) },
      });
      return NextResponse.json({ status: 204 });
    })(request, new NextResponse());
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}
