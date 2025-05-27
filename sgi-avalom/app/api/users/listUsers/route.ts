import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.ava_cliente.findMany({
      orderBy: { cli_nombre: "asc" },
      select: {
        cli_id: true,
        cli_nombre: true,
        cli_papellido: true,
        cli_sapellido: true,
        cli_cedula: true,
        cli_direccion: true,
        cli_estadocivil: true,
      },
    });

    const data = clients.map((c) => ({
      id: c.cli_id.toString(),
      nombre: `${c.cli_nombre} ${c.cli_papellido}${c.cli_sapellido ? ` ${c.cli_sapellido}` : ""}`,
      cedula: c.cli_cedula,
      direccion: c.cli_direccion ?? "",
      estadoCivil: c.cli_estadocivil ?? "",
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Error fetching clients:", err);
    return NextResponse.json(
      { error: "Error fetching clients" },
      { status: 500 }
    );
  }
}
