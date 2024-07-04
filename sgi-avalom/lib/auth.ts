// lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextResponse, NextRequest } from 'next/server';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || '';

// Hashear la contraseña
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Comparar la contraseña
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generar el token JWT
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

// Verificar el token JWT
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware para autenticar
export const authenticate = (handler: any) => {
  return async (req: NextRequest, res: NextResponse) => {
    const cookies = cookie.parse(req.headers.get('cookie') || '');
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ message: 'Authentication token required' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }
  };
};
