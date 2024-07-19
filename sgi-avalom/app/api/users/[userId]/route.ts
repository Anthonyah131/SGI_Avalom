import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const user = await prisma.ava_usuario.findUnique({
        where: { usu_id: parseInt(params.userId) },
      });
      if (!user) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(user);
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
  { params }: { params: { userId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const body = await request.json();
      if (!body.usu_nombre || !body.usu_correo) {
        return NextResponse.json(
          { error: "Faltan campos obligatorios" },
          { status: 400 }
        );
      }
      const user = await prisma.ava_usuario.update({
        where: { usu_id: parseInt(params.userId) },
        data: body,
      });
      return NextResponse.json(user);
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
  { params }: { params: { userId: string } }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const user = await prisma.ava_usuario.delete({
        where: { usu_id: parseInt(params.userId) },
      });
      return NextResponse.json(user);
    } catch (error) {
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
