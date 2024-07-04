import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    return authenticate(async (req: NextRequest, res: NextResponse) => {
      const user = await prisma.ava_usuario.findUnique({
        where: { usu_id: parseInt(params.userId) },
      });
      if (!user) {
        return NextResponse.json({ status: 404, message: "User Not Found" });
      }
      return NextResponse.json(user);
    })(request, new NextResponse());
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await request.json();
    if (!body.usu_nombre || !body.usu_correo) {
      return NextResponse.json({ status: 400, message: "Bad Request" });
    }
    const user = await prisma.ava_usuario.update({
      where: { usu_id: parseInt(params.userId) },
      data: body,
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await prisma.ava_usuario.delete({
      where: { usu_id: parseInt(params.userId) },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ status: 500, message: "Internal Server Error" });
  }
}
