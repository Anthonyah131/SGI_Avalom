import { NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

// Helper que cuenta cuántas líneas ocupará un texto para el ancho dado
function measureLines(text: string, width: number, font: any, size: number) {
  if (!text) return 1;
  let lines = 0,
    current = "";
  for (const word of text.split(" ")) {
    const test = current ? current + " " + word : word;
    const w = font.widthOfTextAtSize(test, size);
    if (w > width && current) {
      lines++;
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines++;
  return lines;
}

// Helper para dibujar un texto envuelto, devuelve el y final (bajo)
function drawWrappedText(
  page: any,
  text: string,
  x: number,
  y: number,
  width: number,
  font: any,
  size: number
) {
  if (!text) return y;
  let current = "";
  let lines = [];
  for (const word of text.split(" ")) {
    const test = current ? current + " " + word : word;
    const w = font.widthOfTextAtSize(test, size);
    if (w > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  lines.forEach((line, idx) => {
    page.drawText(line, { x, y: y - idx * (size + 1.5), size, font });
  });
  return y - (lines.length - 1) * (size + 1.5);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const alq_id = Number(searchParams.get("alq_id"));
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!alq_id || isNaN(alq_id))
    return new Response("alq_id inválido", { status: 400 });

  const fromDate = from ? new Date(`${from}-01T00:00:00.000Z`) : undefined;
  let toDate: Date | undefined = undefined;
  if (to) {
    const nextMonth = new Date(`${to}-01T00:00:00.000Z`);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    toDate = new Date(nextMonth.getTime() - 1);
  }

  const fechaGeneracion = new Date();

  const alquiler = await prisma.ava_alquiler.findUnique({
    where: { alq_id },
    include: {
      ava_clientexalquiler: { include: { ava_cliente: true } },
      ava_propiedad: { 
        include: { 
          ava_edificio: true,
          ava_tipopropiedad: true,
        } 
      },
      ava_deposito: {
        include: {
          ava_pago: true,
        },
      },
      ava_alquilermensual: {
        where: {
          alqm_fechainicio: { gte: fromDate, lte: toDate },
        },
        orderBy: { alqm_fechainicio: "asc" },
        include: {
          ava_pago: {
            include: {
              ava_anulacionpago: { include: { ava_usuario: true } },
            },
            orderBy: { pag_fechapago: "asc" },
          },
        },
      },
    },
  });

  if (!alquiler) return new Response("Alquiler no encontrado", { status: 404 });

  // A3 landscape
  const A3: [number, number] = [1190.55, 841.89];
  const pdf = await PDFDocument.create();
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const marginX = 50;
  const marginTop = A3[1] - 50;
  const rowH = 18;
  let page = pdf.addPage(A3);
  let cursorY = marginTop;

  // Título principal
  page.drawText("REPORTE DETALLADO DE ALQUILER", {
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

  cursorY -= 20;

  const fromLabel = fromDate
    ? formatInTimeZone(fromDate, "UTC", "MMMM yyyy", { locale: es })
    : "";
  const toLabel = toDate
    ? formatInTimeZone(toDate, "UTC", "MMMM yyyy", { locale: es })
    : "";
  if (fromDate && toDate) {
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

  // Caja de información general del alquiler
  const infoBoxHeight = 145;
  page.drawRectangle({
    x: marginX - 10,
    y: cursorY - infoBoxHeight,
    width: 500,
    height: infoBoxHeight,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
  });

  page.drawText("INFORMACIÓN DEL ALQUILER", {
    x: marginX,
    y: cursorY - 15,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0.3, 0.6),
  });

  cursorY -= 35;

  const cliente = alquiler.ava_clientexalquiler[0]?.ava_cliente;
  const estadoAlquiler = alquiler.alq_estado === "A" 
    ? "Activo" 
    : alquiler.alq_estado === "F" 
    ? "Finalizado" 
    : alquiler.alq_estado === "C"
    ? "Cancelado"
    : alquiler.alq_estado;

  const infoGeneral = [
    `ID Alquiler: ${alq_id}`,
    `Estado: ${estadoAlquiler}`,
    `Cliente: ${cliente ? `${cliente.cli_nombre} ${cliente.cli_papellido}` : "—"}`,
    `${cliente?.cli_correo ? `Correo: ${cliente.cli_correo}` : ""}`,
    `${cliente?.cli_telefono ? `Teléfono: ${cliente.cli_telefono}` : ""}`,
    `Propiedad: ${alquiler.ava_propiedad?.prop_identificador ?? "—"}`,
    `Tipo: ${alquiler.ava_propiedad?.ava_tipopropiedad?.tipp_nombre ?? "—"}`,
    `Edificio: ${alquiler.ava_propiedad?.ava_edificio?.edi_identificador ?? "—"}`,
    `Monto mensual: CRC ${Number(alquiler.alq_monto).toLocaleString("es-CR")}`,
  ].filter(Boolean);

  infoGeneral.forEach((info, i) => {
    const x = marginX + (i % 2) * 240;
    const y = cursorY - Math.floor(i / 2) * 16;
    page.drawText(info, {
      x,
      y,
      size: 10,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
  });

  cursorY -= 145;

  // Información del depósito si existe
  if (alquiler.ava_deposito && alquiler.ava_deposito.length > 0) {
    const deposito = alquiler.ava_deposito[0];
    const depositoTotal = Number(deposito.depo_total);
    const depositoActual = Number(deposito.depo_montoactual);
    
    page.drawText("DEPÓSITO", {
      x: marginX + 550,
      y: cursorY + 145,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0.3, 0.6),
    });

    page.drawRectangle({
      x: marginX + 540,
      y: cursorY,
      width: 220,
      height: 130,
      color: rgb(0.98, 0.98, 1),
      borderColor: rgb(0, 0.3, 0.6),
      borderWidth: 1,
    });

    const depositoInfo = [
      `Total: CRC ${depositoTotal.toLocaleString("es-CR")}`,
      `Actual: CRC ${depositoActual.toLocaleString("es-CR")}`,
      `Usado: CRC ${(depositoTotal - depositoActual).toLocaleString("es-CR")}`,
      `Pagos: ${deposito.ava_pago?.length ?? 0}`,
    ];

    depositoInfo.forEach((info, i) => {
      page.drawText(info, {
        x: marginX + 550,
        y: cursorY + 115 - i * 18,
        size: 9,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
    });
  }

  cursorY -= 20;

  // ====== Cálculo de totales y estadísticas ======
  let totalEsperado = 0;
  let totalPagado = 0;
  let totalPagos = 0;
  let pagosAtrasados = 0;
  let mensualidadesPagadas = 0;
  const totalMensualidades = alquiler.ava_alquilermensual.length;

  // ========== Detalle por mensualidad ==========
  for (const mens of alquiler.ava_alquilermensual) {
    totalEsperado += Number(mens.alqm_montototal);
    
    if (mens.alqm_estado === "P") mensualidadesPagadas++;
    if (mens.alqm_estado === "A") pagosAtrasados++;

    // Suma solo pagos NO anulados
    for (const pago of mens.ava_pago) {
      const esAnulado =
        pago.ava_anulacionpago && pago.ava_anulacionpago.length > 0;
      if (!esAnulado) {
        totalPagado += Number(pago.pag_monto);
        totalPagos++;
      }
    }

    if (cursorY < 180) {
      page = pdf.addPage(A3);
      cursorY = marginTop;
    }

    // Subtítulo mensualidad
    page.drawText(
      `Mensualidad: ${new Date(mens.alqm_fechainicio).toLocaleDateString(
        "es-CR"
      )} - ${new Date(mens.alqm_fechafin).toLocaleDateString(
        "es-CR"
      )} | Monto: CRC ${Number(mens.alqm_montototal).toLocaleString("es-CR")}`,
      { x: marginX, y: cursorY, size: 13, font: helveticaBold }
    );
    cursorY -= rowH;
    page.drawText(
      `Pagado: CRC ${Number(mens.alqm_montopagado ?? 0).toLocaleString(
        "es-CR"
      )} | Estado: ${
        mens.alqm_estado === "P"
          ? "Pagado"
          : mens.alqm_estado === "A"
          ? "Atrasado"
          : mens.alqm_estado === "I"
          ? "Incompleto"
          : mens.alqm_estado === "R"
          ? "Cortesía"
          : mens.alqm_estado
      }`,
      { x: marginX, y: cursorY, size: 11, font: helvetica }
    );
    cursorY -= rowH;

    // --- Encabezados simplificados ---
    const headers = [
      "Descripción",
      "Fecha pago",
      "Monto",
      "Estado",
      "Referencia",
      "Cuenta",
      "Banco",
      "Método",
      "Motivo anulación",
      "Desc. anulación",
      "Fecha anulación",
      "Usuario anuló",
    ];
    const colWidths = [
      200, // Descripción amplia
      70,
      65,
      65,
      90,
      60,
      70,
      70,
      110,
      110,
      80,
      100,
    ];
    const colXs = colWidths.reduce<number[]>(
      (acc, w, i) =>
        i === 0 ? [marginX] : [...acc, acc[i - 1] + colWidths[i - 1]],
      []
    );

    headers.forEach((h, i) => {
      page.drawText(h, {
        x: colXs[i],
        y: cursorY,
        size: 9,
        font: helveticaBold,
      });
    });
    cursorY -= rowH;

    if (mens.ava_pago.length === 0) {
      page.drawText("No hay pagos asociados a esta mensualidad.", {
        x: marginX,
        y: cursorY,
        size: 10,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
      cursorY -= rowH;
    } else {
      for (const pago of mens.ava_pago) {
        if (cursorY < 60) {
          page = pdf.addPage(A3);
          cursorY = marginTop;
        }
        const esAnulado =
          pago.ava_anulacionpago && pago.ava_anulacionpago.length > 0;
        const anulacion = esAnulado ? pago.ava_anulacionpago[0] : null;

        // Usuario que anuló, si existe
        const usuarioAnulo = anulacion?.ava_usuario
          ? `${anulacion.ava_usuario.usu_nombre ?? ""} ${
              anulacion.ava_usuario.usu_papellido ?? ""
            }`
          : "";

        // 1. Medir cuántas líneas ocupará cada campo "wrappeado"
        const fields = [
          pago.pag_descripcion ?? "",
          pago.pag_fechapago
            ? new Date(pago.pag_fechapago).toLocaleDateString("es-CR")
            : "",
          `CRC ${Number(pago.pag_monto).toLocaleString("es-CR")}`,
          pago.pag_estado === "A"
            ? "Activo"
            : pago.pag_estado === "N"
            ? "Anulado"
            : pago.pag_estado,
          pago.pag_referencia ?? "",
          pago.pag_cuenta ?? "",
          pago.pag_banco ?? "",
          pago.pag_metodopago ?? "",
          esAnulado ? anulacion?.anp_motivo ?? "" : "",
          esAnulado ? anulacion?.anp_descripcion ?? "" : "",
          esAnulado && anulacion?.anp_fechaanulacion
            ? new Date(anulacion.anp_fechaanulacion).toLocaleDateString("es-CR")
            : "",
          usuarioAnulo,
        ];

        const linesPerCell = fields.map((txt, i) =>
          measureLines(txt, colWidths[i], helvetica, 9)
        );
        const maxLines = Math.max(...linesPerCell);

        // 2. Imprimir cada celda respetando el máximo
        let x = marginX;
        for (let i = 0; i < fields.length; i++) {
          let yCell = cursorY;
          drawWrappedText(
            page,
            fields[i],
            x,
            yCell,
            colWidths[i],
            helvetica,
            9
          );
          x += colWidths[i];
        }
        cursorY -= maxLines * (9 + 1.5);
      }
    }
    // Línea divisoria tras la sección
    page.drawLine({
      start: { x: marginX, y: cursorY + 6 },
      end: {
        x: marginX + colWidths.reduce((a, b) => a + b, 0),
        y: cursorY + 6,
      },
      thickness: 1.5,
      color: rgb(0.5, 0.5, 0.5),
    });
    cursorY -= 10;
  }

  // Mostrar los totales y estadísticas al final
  if (cursorY < 180) {
    page = pdf.addPage(A3);
    cursorY = marginTop;
  }

  cursorY -= 30;

  // Caja de resumen financiero
  page.drawRectangle({
    x: marginX - 10,
    y: cursorY - 130,
    width: 750,
    height: 135,
    color: rgb(0.98, 0.98, 1),
    borderColor: rgb(0, 0.3, 0.6),
    borderWidth: 2,
  });

  page.drawText("RESUMEN FINANCIERO Y ESTADÍSTICAS", {
    x: marginX,
    y: cursorY - 15,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0.3, 0.6),
  });

  cursorY -= 40;

  const totalPendiente = totalEsperado - totalPagado;
  const porcentajeCumplimiento = totalEsperado > 0
    ? ((totalPagado / totalEsperado) * 100).toFixed(1)
    : "0.0";
  const tasaPagoPuntual = totalMensualidades > 0
    ? (((totalMensualidades - pagosAtrasados) / totalMensualidades) * 100).toFixed(1)
    : "0.0";

  // Columna izquierda - Montos
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

  cursorY -= 20;

  page.drawText(
    `Porcentaje de Cumplimiento: ${porcentajeCumplimiento}%`,
    {
      x: marginX,
      y: cursorY,
      size: 11,
      font: helveticaBold,
      color: Number(porcentajeCumplimiento) >= 80 ? rgb(0, 0.5, 0) : rgb(0.8, 0.4, 0),
    }
  );

  // Columna derecha - Estadísticas
  const statsX = marginX + 380;
  cursorY += 60; // Volver arriba para la columna derecha

  const estadisticas = [
    `Total de Mensualidades: ${totalMensualidades}`,
    `Mensualidades Pagadas: ${mensualidadesPagadas}`,
    `Mensualidades Atrasadas: ${pagosAtrasados}`,
    `Total de Pagos Realizados: ${totalPagos}`,
    `Tasa de Pago Puntual: ${tasaPagoPuntual}%`,
  ];

  estadisticas.forEach((stat, i) => {
    page.drawText(stat, {
      x: statsX,
      y: cursorY - i * 20,
      size: 10,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
  });

  // Finalizar PDF
  const pdfBytes = await pdf.save();
  let filename = `Reporte_alquiler_${alq_id}_${from || ""}_a_${to || ""}.pdf`;
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
