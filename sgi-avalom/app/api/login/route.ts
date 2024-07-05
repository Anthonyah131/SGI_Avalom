import { NextRequest, NextResponse } from "next/server";
import { comparePassword, generateToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await prisma.ava_usuario.findUnique({
    where: { usu_correo: email },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  }

  const isPasswordValid = await comparePassword(password, user.usu_contrasena);
  if (!isPasswordValid) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = generateToken(String(user.usu_id));

  return NextResponse.json({
    message: "Login successful",
    token: token,
    user: user,
  });
}
