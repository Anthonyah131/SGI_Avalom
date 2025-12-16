import { NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { es } from "date-fns/locale";
import { formatInTimeZone, format } from "date-fns-tz";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const fromDate = from ? new Date(`${from}-01T00:00:00.000Z`) : undefined;

  let toDate: Date | undefined = undefined;
  if (to) {
    const nextMonth = new Date(`${to}-01T00:00:00.000Z`);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    toDate = new Date(nextMonth.getTime() - 1);
  }

  const esRango = Boolean(fromDate || toDate);
  const fechaGeneracion = new Date();

  const edificios = await prisma.ava_edificio.findMany({
    orderBy: { edi_identificador: "asc" },
    include: {
      ava_propiedad: {
        orderBy: { prop_identificador: "asc" },
        include: {
          ava_tipopropiedad: true,
          ava_alquiler: {
            include: {
              ava_clientexalquiler: { include: { ava_cliente: true } },
              ava_alquilermensual: {
                where: {
                  alqm_fechainicio: {
                    gte: fromDate,
                    lte: toDate,
                  },
                },
                orderBy: { alqm_fechainicio: "asc" },
              },
            },
          },
        },
      },
    },
  });

  // Calcular estadísticas generales
  const totalEdificios = edificios.length;
  const totalPropiedades = edificios.reduce(
    (sum, ed) => sum + ed.ava_propiedad.length,
    0
  );
  const propiedadesOcupadas = edificios.reduce(
    (sum, ed) =>
      sum +
      ed.ava_propiedad.filter((p) =>
        p.ava_alquiler.some((a) => a.alq_estado === "A")
      ).length,
    0
  );
  const tasaOcupacion = totalPropiedades > 0
    ? ((propiedadesOcupadas / totalPropiedades) * 100).toFixed(1)
    : "0.0";

  // Calcular morosidad
  let pagosAtrasados = 0;
  let totalPagos = 0;
  edificios.forEach((ed) => {
    ed.ava_propiedad.forEach((prop) => {
      prop.ava_alquiler.forEach((alq) => {
        alq.ava_alquilermensual.forEach((mens) => {
          totalPagos++;
          if (mens.alqm_estado === "A") pagosAtrasados++;
        });
      });
    });
  });
  const tasaMorosidad = totalPagos > 0
    ? ((pagosAtrasados / totalPagos) * 100).toFixed(1)
    : "0.0";

  const pdf = await PDFDocument.create();
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const A4: [number, number] = [841.89, 595.28]; // A4 landscape
  const marginX = 50;
  const marginTop = A4[1] - 50;
  const rowH = 18;

  // Nueva estructura de columnas (sin Edificio y Propiedad repetidos)
  const colWidths = [110, 150, 70, 70, 90, 80];
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
      ? "REPORTE CONTABLE DE EDIFICIOS - POR RANGO"
      : "REPORTE CONTABLE DE EDIFICIOS - TOTAL",
    {
      x: marginX,
      y: cursorY + 20,
      size: 16,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    }
  );

  // Fecha de generación
  const fechaGenStr = formatInTimeZone(
    fechaGeneracion,
    "America/Costa_Rica",
    "PPpp",
    { locale: es }
  );
  page.drawText(`Generado: ${fechaGenStr}`, {
    x: marginX,
    y: cursorY,
    size: 9,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  cursorY -= 20;

  // Subtítulo de fechas si hay rango
  if (esRango && fromDate && toDate) {
    const fromLabel = fromDate
      ? formatInTimeZone(fromDate, "UTC", "MMMM yyyy", { locale: es })
      : "";
    const toLabel = toDate
      ? formatInTimeZone(toDate, "UTC", "MMMM yyyy", { locale: es })
      : "";
    page.drawText(`Período: ${fromLabel} a ${toLabel}`, {
      x: marginX,
      y: cursorY,
      size: 11,
      font: helvetica,
    });
    cursorY -= 25;
  } else {
    cursorY -= 10;
  }

  // Sección de estadísticas generales
  page.drawRectangle({
    x: marginX - 10,
    y: cursorY - 80,
    width: tableWidth + 20,
    height: 85,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
  });

  page.drawText("RESUMEN EJECUTIVO", {
    x: marginX,
    y: cursorY - 15,
    size: 13,
    font: helveticaBold,
    color: rgb(0, 0.3, 0.6),
  });

  cursorY -= 35;

  const estadisticas = [
    `Total de Edificios: ${totalEdificios}`,
    `Total de Propiedades: ${totalPropiedades}`,
    `Propiedades Ocupadas: ${propiedadesOcupadas}`,
    `Tasa de Ocupación: ${tasaOcupacion}%`,
    `Tasa de Morosidad: ${tasaMorosidad}%`,
  ];

  const colGap = 200;
  estadisticas.forEach((stat, i) => {
    const x = marginX + (i % 3) * colGap;
    const y = cursorY - Math.floor(i / 3) * 20;
    page.drawText(stat, {
      x,
      y,
      size: 10,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
  });

  cursorY -= 90; // Más espacio después del resumen ejecutivo

  let totalEsperado = 0;
  let totalPagado = 0;

  // Iterar por edificios
  for (const ed of edificios) {
    // Nueva página si es necesario
    if (cursorY < 120) {
      page = pdf.addPage(A4);
      cursorY = marginTop;
    }

    // Encabezado del Edificio
    page.drawRectangle({
      x: marginX - 10,
      y: cursorY - 5,
      width: tableWidth + 20,
      height: 25,
      color: rgb(0, 0.3, 0.6),
    });

    page.drawText(`EDIFICIO: ${ed.edi_identificador}`, {
      x: marginX,
      y: cursorY + 5,
      size: 14,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    cursorY -= 35;

    // Iterar por propiedades del edificio
    for (const prop of ed.ava_propiedad) {
      let subtotalEsperado = 0;
      let subtotalPagado = 0;

      if (cursorY < 100) {
        page = pdf.addPage(A4);
        cursorY = marginTop;
      }

      // Encabezado de la propiedad
      page.drawRectangle({
        x: marginX - 5,
        y: cursorY - 5,
        width: tableWidth + 10,
        height: 20,
        color: rgb(0.85, 0.85, 0.85),
      });

      const tipoPropiedad = prop.ava_tipopropiedad?.tipp_nombre || "—";
      page.drawText(
        `Propiedad: ${prop.prop_identificador} (${tipoPropiedad})`,
        {
          x: marginX,
          y: cursorY,
          size: 12,
          font: helveticaBold,
          color: rgb(0.1, 0.1, 0.1),
        }
      );

      cursorY -= 25;

      // Obtener todas las mensualidades de todos los alquileres
      const todasMensualidades = prop.ava_alquiler.flatMap((alq) =>
        alq.ava_alquilermensual.map((mens) => ({
          ...mens,
          _cliente: alq.ava_clientexalquiler[0]?.ava_cliente,
          _estadoAlquiler: alq.alq_estado,
        }))
      );

      // Ordenar por fecha de inicio
      todasMensualidades.sort(
        (a, b) =>
          new Date(a.alqm_fechainicio).getTime() -
          new Date(b.alqm_fechainicio).getTime()
      );

      // Si no hay mensualidades, mostrar mensaje
      if (todasMensualidades.length === 0) {
        page.drawText(
          esRango
            ? "[!] Esta propiedad no genero ingresos en el periodo seleccionado"
            : "[!] Esta propiedad no tiene registros de alquileres",
          {
            x: marginX + 20,
            y: cursorY,
            size: 10,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5),
          }
        );
        cursorY -= 25;
        continue;
      }

      // Cabecera de tabla para esta propiedad
      const headers = [
        "Período",
        "Cliente",
        "Estado Alq.",
        "Monto",
        "Pagado",
        "Estado Pago",
      ];

      headers.forEach((h, i) => {
        page.drawText(h, {
          x: colXs[i],
          y: cursorY,
          size: 10,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });
      });

      page.drawLine({
        start: { x: marginX - 5, y: cursorY - 2 },
        end: { x: marginX - 5 + tableWidth + 5, y: cursorY - 2 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });

      cursorY -= rowH;

      // Imprimir las filas de datos
      for (const mens of todasMensualidades) {
        if (cursorY < 60) {
          page = pdf.addPage(A4);
          cursorY = marginTop;
        }

        const fechaInicio = new Date(mens.alqm_fechainicio).toLocaleDateString(
          "es-CR",
          { month: "short", year: "2-digit" }
        );
        const fechaFin = mens.alqm_fechafin
          ? new Date(mens.alqm_fechafin).toLocaleDateString("es-CR", {
              month: "short",
              year: "2-digit",
            })
          : "";
        const fecha = fechaFin ? `${fechaInicio}-${fechaFin}` : fechaInicio;

        const cliente = mens._cliente;
        const clienteNombre = cliente
          ? `${cliente.cli_nombre} ${cliente.cli_papellido}`
          : "—";

        const estado =
          mens._estadoAlquiler === "A"
            ? "Activo"
            : mens._estadoAlquiler === "F"
            ? "Finalizado"
            : "Cancelado";

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
          clienteNombre,
          estado,
          `CRC ${montoEsperado.toLocaleString("es-CR")}`,
          `CRC ${montoPagado.toLocaleString("es-CR")}`,
          estadoPago,
        ];

        row.forEach((text, i) => {
          const fontSize = 9;
          const textColor =
            i === 5 && estadoPago === "Atrasado"
              ? rgb(0.8, 0, 0)
              : i === 5 && estadoPago === "Pagado"
              ? rgb(0, 0.5, 0)
              : rgb(0, 0, 0);

          page.drawText(text, {
            x: colXs[i],
            y: cursorY,
            size: fontSize,
            font: helvetica,
            color: textColor,
            maxWidth: colWidths[i] - 6,
          });
        });

        page.drawLine({
          start: { x: marginX - 5, y: cursorY - 2 },
          end: { x: marginX - 5 + tableWidth + 5, y: cursorY - 2 },
          thickness: 0.3,
          color: rgb(0.7, 0.7, 0.7),
        });

        cursorY -= rowH;
      }

      // Subtotales de la propiedad
      if (cursorY < 80) {
        page = pdf.addPage(A4);
        cursorY = marginTop;
      }

      page.drawRectangle({
        x: marginX - 5,
        y: cursorY - 5,
        width: tableWidth + 10,
        height: 35,
        color: rgb(0.95, 0.95, 1),
      });

      page.drawText(
        `Subtotal ${prop.prop_identificador} - Esperado: CRC ${subtotalEsperado.toLocaleString(
          "es-CR"
        )} | Pagado: CRC ${subtotalPagado.toLocaleString("es-CR")}`,
        {
          x: marginX,
          y: cursorY + 5,
          size: 10,
          font: helveticaBold,
          color: rgb(0, 0.3, 0.6),
        }
      );

      cursorY -= 45;
    }

    // Espacio entre edificios
    cursorY -= 10;
  }

  // Totales al final con estadísticas mejoradas
  if (cursorY < 150) {
    page = pdf.addPage(A4);
    cursorY = marginTop;
  }

  cursorY -= 30;

  // Caja de resumen final
  page.drawRectangle({
    x: marginX - 10,
    y: cursorY - 100,
    width: tableWidth + 20,
    height: 105,
    color: rgb(0.98, 0.98, 1),
    borderColor: rgb(0, 0.3, 0.6),
    borderWidth: 2,
  });

  page.drawText("RESUMEN FINANCIERO", {
    x: marginX,
    y: cursorY - 15,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0.3, 0.6),
  });

  cursorY -= 40;

  const totalPendiente = totalEsperado - totalPagado;
  const porcentajePagado = totalEsperado > 0
    ? ((totalPagado / totalEsperado) * 100).toFixed(1)
    : "0.0";

  page.drawText(
    `Total Esperado: CRC ${totalEsperado.toLocaleString("es-CR")}`,
    {
      x: marginX,
      y: cursorY,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    }
  );

  cursorY -= 20;

  page.drawText(
    `Total Pagado: CRC ${totalPagado.toLocaleString("es-CR")}`,
    {
      x: marginX,
      y: cursorY,
      size: 11,
      font: helveticaBold,
      color: rgb(0, 0.5, 0),
    }
  );

  cursorY -= 20;

  page.drawText(
    `Total Pendiente: CRC ${totalPendiente.toLocaleString("es-CR")}`,
    {
      x: marginX,
      y: cursorY,
      size: 11,
      font: helveticaBold,
      color: totalPendiente > 0 ? rgb(0.8, 0, 0) : rgb(0, 0.5, 0),
    }
  );

  page.drawText(
    `Porcentaje de Cumplimiento: ${porcentajePagado}%`,
    {
      x: marginX + 350,
      y: cursorY,
      size: 11,
      font: helveticaBold,
      color: Number(porcentajePagado) >= 80 ? rgb(0, 0.5, 0) : rgb(0.8, 0.4, 0),
    }
  );

  const pdfBytes = await pdf.save();

  const fromLabel = fromDate
    ? formatInTimeZone(fromDate, "UTC", "MMMM-yyyy", { locale: es })
    : "";
  const toLabel = toDate
    ? formatInTimeZone(toDate, "UTC", "MMMM-yyyy", { locale: es })
    : "";

  let filename = "Reporte_edificios.pdf";
  if (from && to) {
    filename = `Reporte_edificios_${fromLabel}_a_${toLabel}.pdf`;
  }
  filename = filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_\-\.]/g, "");

  return new Response(new Uint8Array(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
