import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const propId = parseInt(context.params.id);

  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const fromDate = from ? new Date(`${from}-01`) : undefined;
  const toDate = to ? new Date(`${to}-31`) : undefined;

  const property = await prisma.ava_propiedad.findUnique({
    where: { prop_id: propId },
    include: {
      ava_edificio: true,
      ava_alquiler: {
        include: {
          ava_alquilermensual: {
            include: {
              ava_pago: true,
            },
          },
          ava_clientexalquiler: {
            include: { ava_cliente: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!property) {
    return new Response(JSON.stringify({ error: "Propiedad no encontrada" }), {
      status: 404,
    });
  }

  const alquiler = property.ava_alquiler[0];
  const mensualidades = (alquiler?.ava_alquilermensual ?? []).filter((m) => {
    const fecha = new Date(m.alqm_fechapago ?? m.alqm_fechainicio);
    return (!fromDate || fecha >= fromDate) && (!toDate || fecha <= toDate);
  });

  const cliente = alquiler?.ava_clientexalquiler[0]?.ava_cliente;

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  const marginX = 50;
  const marginTop = height - 50;
  const rowHeight = 20;
  const colWidths = [100, 220, 100, 100];
  const colsX = colWidths.reduce<number[]>((arr, w, i) => {
    if (i === 0) return [marginX];
    return [...arr, arr[i - 1] + colWidths[i - 1]];
  }, []);

  // === TÍTULOS ===
  page.drawText("Reporte de Pagos de Propiedad", {
    x: marginX,
    y: marginTop,
    size: 16,
    font: helveticaBold,
  });

  page.drawText(`Propiedad: ${property.prop_identificador}`, {
    x: marginX,
    y: marginTop - 25,
    size: 12,
    font: helvetica,
  });

  if (property.ava_edificio) {
    page.drawText(`Edificio: ${property.ava_edificio.edi_identificador}`, {
      x: marginX,
      y: marginTop - 45,
      size: 12,
      font: helvetica,
    });
  }

  if (cliente) {
    const nombreCliente = [
      cliente.cli_nombre,
      cliente.cli_papellido,
      cliente.cli_sapellido,
    ]
      .filter(Boolean)
      .join(" ");
    page.drawText(`Inquilino: ${nombreCliente}`, {
      x: marginX,
      y: marginTop - 65,
      size: 12,
      font: helvetica,
    });
  }

  // === CABECERA TABLA ===
  const startY = marginTop - 90;

  const headers = ["Fecha", "Descripción", "Monto/mes", "Estado"];
  headers.forEach((h, i) => {
    page.drawText(h, {
      x: colsX[i],
      y: startY,
      size: 11,
      font: helveticaBold,
    });
  });

  let cursorY = startY - rowHeight;
  let total = 0;

  for (const m of mensualidades) {
    if (cursorY < 60) {
      page = pdfDoc.addPage([595.28, 841.89]);
      cursorY = height - 50;
    }

    const fechaPago = m.alqm_fechapago
      ? new Date(m.alqm_fechapago).toLocaleDateString("es-CR")
      : "—";

    const descripcion = "Alquiler mensual";
    const monto = `CRC ${m.alqm_montototal.toLocaleString("es-CR")}`;
    const estado = m.alqm_estado === "C" ? "Cancelado" : "Pendiente";

    total += Number(m.alqm_montototal);

    const row = [fechaPago, descripcion, monto, estado];

    row.forEach((text, i) => {
      page.drawText(text, {
        x: colsX[i],
        y: cursorY,
        size: 10,
        font: helvetica,
      });
    });

    cursorY -= rowHeight;
  }

  if (cursorY < 80) {
    page = pdfDoc.addPage([595.28, 841.89]);
    cursorY = height - 50;
  }

  page.drawText(`Total Pagado: CRC ${total.toLocaleString("es-CR")}`, {
    x: marginX,
    y: cursorY - 20,
    size: 12,
    font: helveticaBold,
  });

  const pdfBytes = await pdfDoc.save();

  return new Response(new Uint8Array(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="reporte_propiedad_${property.prop_id}.pdf"`,
    },
  });
}
