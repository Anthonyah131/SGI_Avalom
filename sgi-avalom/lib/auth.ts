import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";
import { parse } from "cookie";
import { User, UserWithToken } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "";

// Hashear la contraseña
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Comparar la contraseña
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (usu_id: string, usu_rol: string): string => {
  return jwt.sign({ userId: usu_id, userRole: usu_rol }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Verificar el token JWT
export const verifyToken = (token: string): User | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    return decoded;
  } catch (error) {
    return null;
  }
};

// Middleware para autenticar
export const authenticate = (handler: any) => {
  return async (req: NextRequest, res: NextResponse) => {
    const cookies = parse(req.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No hay token" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as UserWithToken;
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 401 }
      );
    }
  };
};
