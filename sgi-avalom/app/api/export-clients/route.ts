// app/api/export-clients/route.ts
import { NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";

export async function GET(req: NextRequest) {
  const fechaGeneracion = new Date();

  // 1. Traer clientes + información de alquileres
  const clientes = await prisma.ava_cliente.findMany({
    orderBy: { cli_nombre: "asc" },
    select: {
      cli_nombre: true,
      cli_papellido: true,
      cli_sapellido: true,
      cli_correo: true,
      cli_telefono: true,
      cli_fechacreacion: true,
      ava_clientexalquiler: {
        select: {
          ava_alquiler: {
            select: {
              alq_estado: true,
              alq_monto: true,
            },
          },
        },
      },
    },
  });

  // Calcular estadísticas
  const totalClientes = clientes.length;
  const clientesConContratoActivo = clientes.filter((c) =>
    c.ava_clientexalquiler.some((ca) => ca.ava_alquiler.alq_estado === "A")
  ).length;
  const clientesConContratoFinalizado = clientes.filter((c) =>
    c.ava_clientexalquiler.some((ca) => ca.ava_alquiler.alq_estado === "F") &&
    !c.ava_clientexalquiler.some((ca) => ca.ava_alquiler.alq_estado === "A")
  ).length;
  const clientesConContratoCancelado = clientes.filter((c) =>
    c.ava_clientexalquiler.some((ca) => ca.ava_alquiler.alq_estado === "C") &&
    !c.ava_clientexalquiler.some((ca) => ca.ava_alquiler.alq_estado === "A") &&
    !c.ava_clientexalquiler.some((ca) => ca.ava_alquiler.alq_estado === "F")
  ).length;
  const clientesSinContrato = clientes.filter(
    (c) => c.ava_clientexalquiler.length === 0
  ).length;

  // 2. Crear PDF y página
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  // Margen y configuración de columnas
  const marginX = 50;
  const marginTop = height - 50;
  const rowHeight = 18;
  const colWidths = [30, 130, 150, 80, 90, 70, 70]; // No., Nombre, Correo, Tel, F.Creación, Estado, #Contratos
  const colsX = colWidths.reduce<number[]>((arr, w, i) => {
    if (i === 0) return [marginX];
    return [...arr, arr[i - 1] + colWidths[i - 1]];
  }, []);
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);

  let cursorY = marginTop;

  // Título principal
  page.drawText("REPORTE DE CLIENTES", {
    x: marginX,
    y: cursorY + 20,
    size: 16,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

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

  cursorY -= 30;

  // Sección de estadísticas
  page.drawRectangle({
    x: marginX - 10,
    y: cursorY - 65,
    width: tableWidth + 20,
    height: 70,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
  });

  page.drawText("ESTADÍSTICAS GENERALES", {
    x: marginX,
    y: cursorY - 15,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0.3, 0.6),
  });

  cursorY -= 35;

  const estadisticas = [
    `Total de Clientes: ${totalClientes}`,
    `Con Contrato Activo: ${clientesConContratoActivo}`,
    `Con Contrato Finalizado: ${clientesConContratoFinalizado}`,
    `Con Contrato Cancelado: ${clientesConContratoCancelado}`,
    `Sin Contrato: ${clientesSinContrato}`,
  ];

  const colGap = 140;
  estadisticas.forEach((stat, i) => {
    const x = marginX + (i % 4) * colGap;
    const y = cursorY - Math.floor(i / 4) * 18;
    page.drawText(stat, {
      x,
      y,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
  });

  cursorY -= 50;

  // 3. Dibujar cabecera de la tabla
  page.drawLine({
    start: { x: marginX - 5, y: cursorY + 5 },
    end: {
      x: marginX - 5 + tableWidth + 5,
      y: cursorY + 5,
    },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: marginX - 5, y: cursorY - rowHeight + 5 },
    end: {
      x: marginX - 5 + tableWidth + 5,
      y: cursorY - rowHeight + 5,
    },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // Texto de cabecera
  const headers = ["No.", "Nombre", "Correo", "Teléfono", "F. Creación", "Estado", "#Alquileres"];
  headers.forEach((h, i) => {
    page.drawText(h, {
      x: colsX[i],
      y: cursorY - 10,
      size: 10,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
  });

  cursorY -= rowHeight;

  // 4. Dibujar filas
  clientes.forEach((c, idx) => {
    // Cada vez que bajamos demasiado, creamos nueva página
    if (cursorY < 50) {
      page = pdfDoc.addPage([841.89, 595.28]);
      cursorY = height - 50;
    }

    // Nombre completo
    const nombreCompleto = [c.cli_nombre, c.cli_papellido, c.cli_sapellido]
      .filter(Boolean)
      .join(" ");

    // Fecha de creación
    const fechaCreacion = c.cli_fechacreacion
      ? formatInTimeZone(c.cli_fechacreacion, "UTC", "dd/MM/yyyy", { locale: es })
      : "—";

    // Determinar estado más relevante
    const tieneActivo = c.ava_clientexalquiler.some(
      (ca) => ca.ava_alquiler.alq_estado === "A"
    );
    const tieneFinalizado = c.ava_clientexalquiler.some(
      (ca) => ca.ava_alquiler.alq_estado === "F"
    );
    const tieneCancelado = c.ava_clientexalquiler.some(
      (ca) => ca.ava_alquiler.alq_estado === "C"
    );

    let estado = "Sin contrato";
    if (tieneActivo) estado = "Activo";
    else if (tieneFinalizado) estado = "Finalizado";
    else if (tieneCancelado) estado = "Cancelado";

    // Total de alquileres
    const totalAlquileres = c.ava_clientexalquiler.length;

    const row = [
      String(idx + 1),
      nombreCompleto,
      c.cli_correo,
      c.cli_telefono ?? "—",
      fechaCreacion,
      estado,
      String(totalAlquileres),
    ];

    // Dibujar cada celda
    row.forEach((text, i) => {
      page.drawText(text, {
        x: colsX[i],
        y: cursorY,
        size: 9,
        font: helvetica,
        color: rgb(0, 0, 0),
        maxWidth: colWidths[i] - 5,
      });
    });

    // Línea separadora de fila
    page.drawLine({
      start: { x: marginX - 5, y: cursorY - 2 },
      end: {
        x: marginX - 5 + tableWidth + 5,
        y: cursorY - 2,
      },
      thickness: 0.5,
      color: rgb(0.5, 0.5, 0.5),
    });

    cursorY -= rowHeight;
  });

  // 5. Serializar y responder
  const pdfBytes = await pdfDoc.save();
  const filename = `Reporte_clientes_${formatInTimeZone(
    fechaGeneracion,
    "UTC",
    "yyyy-MM-dd",
    { locale: es }
  )}.pdf`;

  return new Response(new Uint8Array(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
