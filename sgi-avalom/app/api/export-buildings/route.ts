import { NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const fromDate = from ? new Date(`${from}-01`) : undefined;
  const toDate = to ? new Date(`${to}-31`) : undefined;
  const esRango = Boolean(fromDate || toDate);

  const edificios = await prisma.ava_edificio.findMany({
    orderBy: { edi_identificador: "asc" },
    include: {
      ava_propiedad: {
        include: {
          ava_alquiler: {
            include: {
              ava_clientexalquiler: { include: { ava_cliente: true } },
              ava_alquilermensual: {},
            },
          },
        },
      },
    },
  });

  const pdf = await PDFDocument.create();
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const A4: [number, number] = [595.28, 841.89];
  const marginX = 50;
  const marginTop = A4[1] - 50;
  const rowH = 18;

  const colWidths = [70, 100, 100, 120, 80, 70];
  const colXs = colWidths.reduce<number[]>(
    (acc, w, i) =>
      i === 0 ? [marginX] : [...acc, acc[i - 1] + colWidths[i - 1]],
    []
  );
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);

  let page = pdf.addPage(A4);
  let cursorY = marginTop;

  // Título principal
  page.drawText(
    esRango
      ? "REPORTE DE EDIFICIOS - POR RANGO"
      : "REPORTE DE EDIFICIOS - TOTAL",
    {
      x: marginX,
      y: cursorY + 20,
      size: 16,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    }
  );

  // Subtítulo de fechas si hay rango
  if (esRango && fromDate && toDate) {
    const fromLabel = format(fromDate, "MMMM yyyy", { locale: es });
    const toLabel = format(toDate, "MMMM yyyy", { locale: es });
    page.drawText(`Rango: ${fromLabel} a ${toLabel}`, {
      x: marginX,
      y: cursorY,
      size: 11,
      font: helvetica,
    });
  }

  cursorY -= 30;

  // Cabecera tabla
  page.drawLine({
    start: { x: marginX - 20, y: cursorY + 20 },
    end: { x: marginX - 20 + tableWidth + 20, y: cursorY + 20 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: marginX - 20, y: cursorY - rowH + 20 },
    end: { x: marginX - 20 + tableWidth + 20, y: cursorY - rowH + 20 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  const headers = [
    "Fecha",
    "Edificio",
    "Propiedad",
    "Cliente",
    "Estado/Alquiler",
    "Monto/mes",
  ];
  headers.forEach((h, i) => {
    page.drawText(h, {
      x: colXs[i],
      y: cursorY - rowH + 20,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
  });

  cursorY -= rowH;

  let total = 0;

  for (const ed of edificios) {
    for (const prop of ed.ava_propiedad) {
      for (const alq of prop.ava_alquiler) {
        // aplicar filtro
        const mensualidades = alq.ava_alquilermensual.filter((m) => {
          const fecha = new Date(m.alqm_fechapago ?? m.alqm_fechainicio);
          return (
            (!fromDate || fecha >= fromDate) && (!toDate || fecha <= toDate)
          );
        });

        for (const mens of mensualidades) {
          if (cursorY < 60) {
            page = pdf.addPage(A4);
            cursorY = marginTop;
          }

          const fecha = new Date(
            mens.alqm_fechapago ?? mens.alqm_fechainicio
          ).toLocaleDateString("es-CR");

          const edificioLabel = ed.edi_identificador;
          const propiedadLabel = prop.prop_identificador;
          const cliente = alq.ava_clientexalquiler[0]?.ava_cliente;
          const clienteNombre = cliente
            ? `${cliente.cli_nombre} ${cliente.cli_papellido}`
            : "—";
          const estado = alq.alq_estado === "A" ? "Activo" : "Cancelado";
          const monto = `CRC ${mens.alqm_montototal.toLocaleString("es-CR")}`;

          total += Number(mens.alqm_montototal);

          const row = [
            fecha,
            edificioLabel,
            propiedadLabel,
            clienteNombre,
            estado,
            monto,
          ];

          row.forEach((text, i) => {
            page.drawText(text, {
              x: colXs[i],
              y: cursorY,
              size: 10,
              font: helvetica,
              color: rgb(0, 0, 0),
              maxWidth: colWidths[i] - 5,
            });
          });

          page.drawLine({
            start: { x: marginX - 5, y: cursorY - 2 },
            end: { x: marginX - 5 + tableWidth + 5, y: cursorY - 2 },
            thickness: 0.5,
            color: rgb(0.5, 0.5, 0.5),
          });

          cursorY -= rowH;
        }
      }
    }
  }

  // Total final
  if (cursorY < 80) {
    page = pdf.addPage(A4);
    cursorY = marginTop;
  }

  page.drawText(
    `Total mensual acumulado: CRC ${total.toLocaleString("es-CR")}`,
    {
      x: marginX,
      y: cursorY - 20,
      size: 12,
      font: helveticaBold,
    }
  );

  const pdfBytes = await pdf.save();

  let filename = "edificios_total.pdf";

  if (from && to) {
    filename = `edificios_${from}_a_${to}.pdf`;
  }

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
