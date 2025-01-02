import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      // Leer datos enviados desde el frontend
      const { rents, alqId } = await request.json();

      if (
        !rents.every(
          (rent: {
            alqm_identificador: string;
            alqm_fechainicio: string;
            alqm_fechafin: string;
          }) =>
            rent.alqm_identificador &&
            rent.alqm_fechainicio &&
            rent.alqm_fechafin
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Uno o más alquileres tienen datos incompletos.",
          },
          { status: 400 }
        );
      }

      // Transacción para guardar todos los alquileres mensuales
      const savedRents = await prisma.$transaction(async (prisma) => {
        const results = [];

        for (const rent of rents) {
          const savedRent = await prisma.ava_alquilermensual.create({
            data: {
              alqm_identificador: rent.alqm_identificador,
              alqm_fechainicio: new Date(rent.alqm_fechainicio),
              alqm_fechafin: new Date(rent.alqm_fechafin),
              alqm_montototal: BigInt(rent.alqm_montototal),
              alqm_montopagado: BigInt(rent.alqm_montopagado),
              alqm_fechapago: rent.alqm_fechapago
                ? new Date(rent.alqm_fechapago)
                : null,
              alqm_estado: rent.alqm_estado,
              alq_id: BigInt(alqId),
            },
          });
          results.push(savedRent);
        }

        return results;
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(savedRents) },
        { status: 201 }
      );
    } catch (error: any) {
      console.error(
        "Error al guardar los alquileres mensuales: ",
        error?.message || error
      );
      return NextResponse.json(
        { success: false, error: "Error interno del servidor." },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
