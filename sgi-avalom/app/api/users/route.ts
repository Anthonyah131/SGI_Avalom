import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const users = await prisma.ava_usuario.findMany();
      return NextResponse.json(users);
    } catch (error) {
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const body = await request.json();

      if (!body.usu_nombre || !body.usu_correo || !body.usu_contrasena) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(body.usu_contrasena, 10);
      const emailLowerCase = body.usu_correo.toLowerCase();

      const user = await prisma.ava_usuario.create({
        data: {
          usu_nombre: body.usu_nombre,
          usu_papellido: body.usu_papellido,
          usu_sapellido: body.usu_sapellido,
          usu_cedula: body.usu_cedula,
          usu_correo: emailLowerCase,
          usu_contrasena: hashedPassword,
          usu_telefono: body.usu_telefono,
          // usu_fechacreacion se establecerá automáticamente debido a la configuración en el modelo
          usu_estado: body.usu_estado,
          usu_rol: body.usu_rol,
        },
      });

      return NextResponse.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
  })(request, new NextResponse());
}
