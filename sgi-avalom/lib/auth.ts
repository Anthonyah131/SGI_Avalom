import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";
import cookie from "cookie";
import { User } from "./types";

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

// Generar el token JWT
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" });
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
    const cookies = cookie.parse(req.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication token required" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as User;
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  };
};
