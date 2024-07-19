import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("query");

      if (!query) {
        return NextResponse.json({ error: "No se ha proporcionado un query" }, { status: 400 });
      }

      const clients = await prisma.ava_cliente.findMany({
        where: {
          OR: [
            { cli_nombre: { contains: query, mode: "insensitive" } },
            { cli_papellido: { contains: query, mode: "insensitive" } },
            { cli_sapellido: { contains: query, mode: "insensitive" } },
            { cli_cedula: { contains: query, mode: "insensitive" } },
          ],
        },
      });

      return NextResponse.json(clients);
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
  })(request, new NextResponse());
}
