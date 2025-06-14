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
        orderBy: { prop_identificador: "asc" },
      },
    },
  });

  const pdf = await PDFDocument.create();
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const A4: [number, number] = [841.89, 595.28]; // A4 landscape
  const marginX = 50;
  const marginTop = A4[1] - 50;
  const rowH = 18;

  const colWidths = [130, 80, 80, 110, 70, 70, 90, 90];
  //            Fecha, Edi, Prop, Cliente, Estado, Monto, Pagado, Estado pago

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

  cursorY -= 50;

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
    "Estado/Al",
    "Monto/mes",
    "Pagado",
    "Estado de pago",
  ];
  headers.forEach((h, i) => {
    page.drawText(h, {
      x: colXs[i],
      y: cursorY - rowH + 25,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
  });

  cursorY -= rowH;

  let totalEsperado = 0;
  let totalPagado = 0;

  for (const ed of edificios) {
    for (const prop of ed.ava_propiedad) {
      let subtotalEsperado = 0;
      let subtotalPagado = 0;

      // ... título sección ...
      if (cursorY < 80) {
        page = pdf.addPage(A4);
        cursorY = marginTop;
      }
      page.drawText(`Departamento: ${prop.prop_identificador}`, {
        x: marginX,
        y: cursorY,
        size: 13,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      cursorY -= rowH;

      // Cabecera tabla por sección
      headers.forEach((h, i) => {
        page.drawText(h, {
          x: colXs[i],
          y: cursorY + 7,
          size: 11,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });
      });
      cursorY -= rowH;

      for (const alq of prop.ava_alquiler) {
        const mensualidades = alq.ava_alquilermensual.filter((m) => {
          const fecha = new Date(m.alqm_fechainicio);
          return (
            (!fromDate || fecha >= fromDate) && (!toDate || fecha <= toDate)
          );
        });

        for (const mens of mensualidades) {
          if (cursorY < 60) {
            page = pdf.addPage(A4);
            cursorY = marginTop;
          }

          const fechaInicio = new Date(
            mens.alqm_fechainicio
          ).toLocaleDateString("es-CR");
          const fechaFin = mens.alqm_fechafin
            ? new Date(mens.alqm_fechafin).toLocaleDateString("es-CR")
            : "";
          const fecha = fechaFin ? `${fechaInicio} a ${fechaFin}` : fechaInicio;

          const edificioLabel = ed.edi_identificador;
          const propiedadLabel = prop.prop_identificador;
          const cliente = alq.ava_clientexalquiler[0]?.ava_cliente;
          const clienteNombre = cliente
            ? `${cliente.cli_nombre} ${cliente.cli_papellido}`
            : "—";
          const estado = alq.alq_estado === "A" ? "Activo" : "Cancelado";

          const montoEsperado = Number(mens.alqm_montototal);
          const montoPagado = Number(mens.alqm_montopagado ?? 0);
          const estadoPago =
            mens.alqm_estado === "P"
              ? "Pagado"
              : mens.alqm_estado === "A"
              ? "Atrasado"
              : mens.alqm_estado === "I"
              ? "Incompleto"
              : mens.alqm_estado === "R"
              ? "Cortesía"
              : mens.alqm_estado;

          // Sumar a los subtotales
          subtotalEsperado += montoEsperado;
          subtotalPagado += montoPagado;
          // Sumar a los totales generales
          totalEsperado += montoEsperado;
          totalPagado += montoPagado;

          const row = [
            fecha,
            edificioLabel,
            propiedadLabel,
            clienteNombre,
            estado,
            `CRC ${montoEsperado.toLocaleString("es-CR")}`,
            `CRC ${montoPagado.toLocaleString("es-CR")}`,
            estadoPago,
          ];

          row.forEach((text, i) => {
            const fontSize = i === 0 ? 9.5 : 10;
            page.drawText(text, {
              x: colXs[i],
              y: cursorY,
              size: fontSize,
              font: helvetica,
              color: rgb(0, 0, 0),
              maxWidth: colWidths[i] - 6,
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

      // --- Imprimir subtotales de la sección ---
      if (cursorY < 80) {
        page = pdf.addPage(A4);
        cursorY = marginTop;
      }
      page.drawText(
        `Subtotal esperado (${
          prop.prop_identificador
        }): CRC ${subtotalEsperado.toLocaleString("es-CR")}`,
        {
          x: marginX,
          y: cursorY - 8,
          size: 11,
          font: helveticaBold,
          color: rgb(0.2, 0.2, 0.2),
        }
      );
      page.drawText(
        `Subtotal pagado (${
          prop.prop_identificador
        }): CRC ${subtotalPagado.toLocaleString("es-CR")}`,
        {
          x: marginX,
          y: cursorY - 28,
          size: 11,
          font: helveticaBold,
          color: rgb(0.2, 0.2, 0.2),
        }
      );

      // Ajustar cursorY para dibujar la línea bien separada de los textos
      cursorY -= 38;

      // Línea divisoria negra/gris después de los subtotales (¡ahora está bien posicionada!)
      page.drawLine({
        start: { x: marginX - 10, y: cursorY - 6 },
        end: { x: marginX - 10 + tableWidth + 10, y: cursorY - 6 },
        thickness: 2,
        color: rgb(0.1, 0.1, 0.1), // negro/gris oscuro
      });
      cursorY -= 18; // Más espacio tras la línea (ajusta si quieres más o menos separación)
    }
  }

  // Totales al final
  if (cursorY < 80) {
    page = pdf.addPage(A4);
    cursorY = marginTop;
  }

  page.drawText(
    `Total mensual esperado: CRC ${totalEsperado.toLocaleString("es-CR")}`,
    {
      x: marginX,
      y: cursorY - 20,
      size: 12,
      font: helveticaBold,
    }
  );

  page.drawText(
    `Total pagado por clientes: CRC ${totalPagado.toLocaleString("es-CR")}`,
    {
      x: marginX,
      y: cursorY - 40,
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
