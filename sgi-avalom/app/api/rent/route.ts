import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const rents = await prisma.ava_alquiler.findMany({
        include: {
          ava_alquilermensual: true,
          ava_propiedad: true,
        },
      });
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(rents) },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const data = await req.json();

      const existingActiveRent = await prisma.ava_alquiler.findFirst({
        where: {
          prop_id: data.prop_id,
          alq_estado: "A",
        },
      });

      if (existingActiveRent) {
        return NextResponse.json(
          {
            success: false,
            error: "Ya existe un alquiler activo para esta propiedad.",
          },
          { status: 400 }
        );
      }

      const rent = await prisma.ava_alquiler.create({
        data,
      });
      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(rent) },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
