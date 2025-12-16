import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

interface MonthlyData {
  mes: string;
  ingresos: number;
  gastos: number;
  ganancia: number;
  margen: number;
  variacionIngresos: number | null;
  variacionGanancia: number | null;
  indicador: "GANANCIA" | "PÉRDIDA";
}

interface BuildingSummary {
  edi_id: string;
  edi_identificador: string;
  ingresos: number;
  gastos: number;
  ganancia: number;
  margen: number;
}

interface PropertySummary {
  prop_id: string;
  prop_identificador: string;
  edi_identificador: string;
  ingresos: number;
  gastos: number;
  ganancia: number;
  margen: number;
}

interface ExpenseBreakdown {
  tipo: string;
  monto: number;
  porcentaje: number;
}

interface ServiceExpense {
  ser_id: string;
  ser_nombre: string;
  monto: number;
}

export async function GET(req: NextRequest) {
  return authenticate(async (request: NextRequest, res: NextResponse) => {
    try {
      const { searchParams } = req.nextUrl;
      const fechaDesde = searchParams.get("fechaDesde");
      const fechaHasta = searchParams.get("fechaHasta");

      if (!fechaDesde || !fechaHasta) {
        return new Response(
          JSON.stringify({ error: "fechaDesde y fechaHasta son requeridos" }),
          { status: 400 }
        );
      }

      // Manejar fechas correctamente (asegurar que sean en UTC)
      // Si la fecha viene como "YYYY-MM-DD", agregar la hora para evitar problemas de zona horaria
      const fromDateStr = fechaDesde.includes("T") ? fechaDesde : fechaDesde + "T00:00:00.000Z";
      const toDateStr = fechaHasta.includes("T") ? fechaHasta : fechaHasta + "T23:59:59.999Z";
      const fromDate = new Date(fromDateStr);
      const toDate = new Date(toDateStr);

      // Debug: Verificar cuántos gastos hay en total y en el rango
      const totalGastos = await prisma.ava_gasto.count({
        where: { gas_estado: "A" },
      });
      
      // Verificar gastos sin filtro de fecha para debug
      const gastosSinFiltroFecha = await prisma.ava_gasto.findMany({
        where: { gas_estado: "A" },
        take: 5,
        orderBy: { gas_fecha: "desc" },
        select: {
          gas_id: true,
          gas_fecha: true,
          gas_monto: true,
          gas_estado: true,
        },
      });
      
      const gastosEnRango = await prisma.ava_gasto.count({
        where: {
          gas_estado: "A",
          gas_fecha: {
            gte: fromDate,
            lte: toDate,
          },
        },
      });
      
      console.log(`[DEBUG Profit-Loss] Total gastos activos: ${totalGastos}`);
      console.log(`[DEBUG Profit-Loss] Gastos en rango ${fechaDesde} a ${fechaHasta}: ${gastosEnRango}`);
      console.log(`[DEBUG Profit-Loss] fromDate: ${fromDate.toISOString()}, toDate: ${toDate.toISOString()}`);
      if (gastosSinFiltroFecha.length > 0) {
        console.log(`[DEBUG Profit-Loss] Ejemplo de gastos activos (sin filtro fecha):`, 
          gastosSinFiltroFecha.map(g => ({
            gas_id: g.gas_id.toString(),
            gas_fecha: g.gas_fecha.toISOString(),
            gas_monto: g.gas_monto.toString(),
          }))
        );
      }

      // ============================================
      // 1. CALCULAR INGRESOS (Pagos activos de mensualidades)
      // ============================================
      const pagos = await prisma.ava_pago.findMany({
        where: {
          pag_estado: "A",
          pag_fechapago: {
            gte: fromDate,
            lte: toDate,
          },
          alqm_id: {
            not: null, // Solo pagos de mensualidades
          },
        },
        include: {
          ava_alquilermensual: {
            include: {
              ava_alquiler: {
                include: {
                  ava_propiedad: {
                    include: {
                      ava_edificio: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // ============================================
      // 2. CALCULAR GASTOS (Gastos activos)
      // ============================================
      const gastos = await prisma.ava_gasto.findMany({
        where: {
          gas_estado: "A",
          gas_fecha: {
            gte: fromDate,
            lte: toDate,
          },
        },
        include: {
          ava_edificio: true,
          ava_propiedad: {
            include: {
              ava_edificio: true,
            },
          },
          ava_servicio: true,
        },
      });

      console.log(`[DEBUG] Gastos encontrados: ${gastos.length}`);
      if (gastos.length > 0) {
        console.log(`[DEBUG] Primer gasto:`, {
          gas_id: gastos[0].gas_id.toString(),
          gas_fecha: gastos[0].gas_fecha.toISOString(),
          gas_monto: gastos[0].gas_monto.toString(),
          gas_estado: gastos[0].gas_estado,
        });
      }

      // ============================================
      // 3. RESUMEN EJECUTIVO GLOBAL
      // ============================================
      const ingresosTotal = pagos.reduce(
        (sum, p) => sum + Number(p.pag_monto),
        0
      );
      const gastosTotal = gastos.reduce(
        (sum, g) => {
          const monto = Number(g.gas_monto);
          console.log(`[DEBUG] Sumando gasto: gas_id=${g.gas_id.toString()}, monto=${monto}, gas_monto=${g.gas_monto.toString()}`);
          return sum + monto;
        },
        0
      );
      console.log(`[DEBUG] gastosTotal calculado: ${gastosTotal}`);
      const gananciaTotal = ingresosTotal - gastosTotal;
      const margenTotal =
        ingresosTotal > 0 ? (gananciaTotal / ingresosTotal) * 100 : 0;

      // ============================================
      // 4. SERIE MENSUAL GLOBAL
      // ============================================
      const monthlyData: MonthlyData[] = [];
      const monthlyMap = new Map<string, { ingresos: number; gastos: number }>();

      // Agrupar ingresos por mes
      pagos.forEach((pago) => {
        const mes = formatInTimeZone(
          pago.pag_fechapago,
          "UTC",
          "yyyy-MM",
          { locale: es }
        );
        const current = monthlyMap.get(mes) || { ingresos: 0, gastos: 0 };
        current.ingresos += Number(pago.pag_monto);
        monthlyMap.set(mes, current);
      });

      // Agrupar gastos por mes
      console.log(`[DEBUG] Procesando ${gastos.length} gastos para agrupar por mes`);
      gastos.forEach((gasto, index) => {
        const mes = formatInTimeZone(
          gasto.gas_fecha,
          "UTC",
          "yyyy-MM",
          { locale: es }
        );
        const monto = Number(gasto.gas_monto);
        console.log(`[DEBUG] Gasto ${index + 1}: mes=${mes}, monto=${monto}, gas_monto=${gasto.gas_monto.toString()}`);
        const current = monthlyMap.get(mes) || { ingresos: 0, gastos: 0 };
        current.gastos += monto;
        monthlyMap.set(mes, current);
        console.log(`[DEBUG] Después de agregar: mes=${mes}, gastos=${current.gastos}`);
      });
      console.log(`[DEBUG] MonthlyMap después de procesar gastos:`, Array.from(monthlyMap.entries()));

      // Generar todos los meses en el rango
      const startMonth = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
      const endMonth = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
      const months: string[] = [];

      for (
        let d = new Date(startMonth);
        d <= endMonth;
        d.setMonth(d.getMonth() + 1)
      ) {
        months.push(formatInTimeZone(d, "UTC", "yyyy-MM", { locale: es }));
      }

      // Construir datos mensuales con variaciones
      months.forEach((mes, index) => {
        const data = monthlyMap.get(mes) || { ingresos: 0, gastos: 0 };
        const ganancia = data.ingresos - data.gastos;
        const margen = data.ingresos > 0 ? (ganancia / data.ingresos) * 100 : 0;

        // Calcular variación vs mes anterior
        let variacionIngresos: number | null = null;
        let variacionGanancia: number | null = null;

        if (index > 0) {
          const prevMes = months[index - 1];
          const prevData = monthlyMap.get(prevMes) || { ingresos: 0, gastos: 0 };
          const prevGanancia = prevData.ingresos - prevData.gastos;

          if (prevData.ingresos > 0) {
            variacionIngresos =
              ((data.ingresos - prevData.ingresos) / prevData.ingresos) * 100;
          }

          if (prevGanancia !== 0) {
            variacionGanancia = ((ganancia - prevGanancia) / Math.abs(prevGanancia)) * 100;
          }
        }

        monthlyData.push({
          mes,
          ingresos: data.ingresos,
          gastos: data.gastos,
          ganancia,
          margen,
          variacionIngresos,
          variacionGanancia,
          indicador: ganancia >= 0 ? "GANANCIA" : "PÉRDIDA",
        });
      });

      const mesesEnGanancia = monthlyData.filter((m) => m.ganancia >= 0).length;
      const mesesEnPerdida = monthlyData.filter((m) => m.ganancia < 0).length;

      // ============================================
      // 5. RESUMEN POR EDIFICIO
      // ============================================
      const buildingMap = new Map<string, BuildingSummary>();

      // Procesar ingresos por edificio
      pagos.forEach((pago) => {
        const edificio =
          pago.ava_alquilermensual?.ava_alquiler?.ava_propiedad?.ava_edificio;
        if (edificio) {
          const key = edificio.edi_id.toString();
          const current = buildingMap.get(key) || {
            edi_id: key,
            edi_identificador: edificio.edi_identificador,
            ingresos: 0,
            gastos: 0,
            ganancia: 0,
            margen: 0,
          };
          current.ingresos += Number(pago.pag_monto);
          buildingMap.set(key, current);
        }
      });

      // Procesar gastos por edificio
      // Primero, obtener todos los edificios que necesitamos para evitar consultas repetidas
      const edificiosIds = new Set<string>();
      gastos.forEach((gasto) => {
        if (gasto.ava_edificio) {
          edificiosIds.add(gasto.ava_edificio.edi_id.toString());
        } else if (gasto.ava_propiedad?.ava_edificio) {
          edificiosIds.add(gasto.ava_propiedad.ava_edificio.edi_id.toString());
        } else if (gasto.edi_id) {
          // Si no hay relación cargada, usar edi_id directamente
          edificiosIds.add(gasto.edi_id.toString());
        }
      });
      
      // Obtener edificios que faltan
      const edificiosFaltantes = await prisma.ava_edificio.findMany({
        where: {
          edi_id: {
            in: Array.from(edificiosIds).map(id => BigInt(id)),
          },
        },
      });
      const edificiosMap = new Map<string, { edi_id: string; edi_identificador: string }>();
      edificiosFaltantes.forEach((e) => {
        edificiosMap.set(e.edi_id.toString(), {
          edi_id: e.edi_id.toString(),
          edi_identificador: e.edi_identificador,
        });
      });
      
      console.log(`[DEBUG] Procesando ${gastos.length} gastos para asignar a edificios`);
      gastos.forEach((gasto, index) => {
        let edificio: { edi_id: string; edi_identificador: string } | null = null;
        
        if (gasto.ava_edificio) {
          edificio = {
            edi_id: gasto.ava_edificio.edi_id.toString(),
            edi_identificador: gasto.ava_edificio.edi_identificador,
          };
        } else if (gasto.ava_propiedad?.ava_edificio) {
          edificio = {
            edi_id: gasto.ava_propiedad.ava_edificio.edi_id.toString(),
            edi_identificador: gasto.ava_propiedad.ava_edificio.edi_identificador,
          };
        } else if (gasto.edi_id) {
          // Usar edi_id directamente y buscar en el mapa
          const edificioData = edificiosMap.get(gasto.edi_id.toString());
          if (edificioData) {
            edificio = edificioData;
          }
        }
        
        console.log(`[DEBUG] Gasto ${index + 1}: gas_id=${gasto.gas_id.toString()}, edi_id=${gasto.edi_id?.toString() || 'null'}, tiene_ava_edificio=${!!gasto.ava_edificio}, tiene_ava_propiedad=${!!gasto.ava_propiedad}, edificio=${edificio ? edificio.edi_identificador : 'null'}`);
        
        if (edificio) {
          const key = edificio.edi_id;
          const current = buildingMap.get(key) || {
            edi_id: key,
            edi_identificador: edificio.edi_identificador,
            ingresos: 0,
            gastos: 0,
            ganancia: 0,
            margen: 0,
          };
          const monto = Number(gasto.gas_monto);
          current.gastos += monto;
          buildingMap.set(key, current);
          console.log(`[DEBUG] Gasto asignado a edificio ${edificio.edi_identificador}, monto=${monto}, total_gastos=${current.gastos}`);
        } else {
          console.log(`[DEBUG] ⚠️ Gasto ${gasto.gas_id.toString()} NO tiene edificio asignado`);
        }
      });
      console.log(`[DEBUG] BuildingMap después de procesar gastos:`, Array.from(buildingMap.entries()).map(([k, v]) => ({ key: k, ...v })));

      // Calcular ganancia y margen por edificio
      const buildingSummaries: BuildingSummary[] = Array.from(
        buildingMap.values()
      ).map((b) => {
        const ganancia = b.ingresos - b.gastos;
        const margen = b.ingresos > 0 ? (ganancia / b.ingresos) * 100 : 0;
        return { ...b, ganancia, margen };
      });

      // Top 5 por ganancia y Bottom 5 por pérdida
      const topBuildings = [...buildingSummaries]
        .sort((a, b) => b.ganancia - a.ganancia)
        .slice(0, 5);
      const bottomBuildings = [...buildingSummaries]
        .sort((a, b) => a.ganancia - b.ganancia)
        .slice(0, 5);

      // ============================================
      // 6. RESUMEN POR PROPIEDAD
      // ============================================
      const propertyMap = new Map<string, PropertySummary>();

      // Procesar ingresos por propiedad
      pagos.forEach((pago) => {
        const propiedad = pago.ava_alquilermensual?.ava_alquiler?.ava_propiedad;
        if (propiedad) {
          const key = propiedad.prop_id.toString();
          const current = propertyMap.get(key) || {
            prop_id: key,
            prop_identificador: propiedad.prop_identificador,
            edi_identificador:
              propiedad.ava_edificio?.edi_identificador || "—",
            ingresos: 0,
            gastos: 0,
            ganancia: 0,
            margen: 0,
          };
          current.ingresos += Number(pago.pag_monto);
          propertyMap.set(key, current);
        }
      });

      // Procesar gastos por propiedad
      gastos.forEach((gasto) => {
        if (gasto.ava_propiedad) {
          const key = gasto.ava_propiedad.prop_id.toString();
          const current = propertyMap.get(key) || {
            prop_id: key,
            prop_identificador: gasto.ava_propiedad.prop_identificador,
            edi_identificador:
              gasto.ava_propiedad.ava_edificio?.edi_identificador || "—",
            ingresos: 0,
            gastos: 0,
            ganancia: 0,
            margen: 0,
          };
          current.gastos += Number(gasto.gas_monto);
          propertyMap.set(key, current);
        }
      });

      // Calcular ganancia y margen por propiedad
      const propertySummaries: PropertySummary[] = Array.from(
        propertyMap.values()
      ).map((p) => {
        const ganancia = p.ingresos - p.gastos;
        const margen = p.ingresos > 0 ? (ganancia / p.ingresos) * 100 : 0;
        return { ...p, ganancia, margen };
      });

      const topProperties = [...propertySummaries]
        .sort((a, b) => b.ganancia - a.ganancia)
        .slice(0, 10);
      const bottomProperties = [...propertySummaries]
        .sort((a, b) => a.ganancia - b.ganancia)
        .slice(0, 10);

      // ============================================
      // 7. DISTRIBUCIÓN DE GASTOS
      // ============================================
      const gastosServicios = gastos.filter((g) => g.gas_tipo === "S");
      const gastosMantenimiento = gastos.filter((g) => g.gas_tipo === "M");

      const montoServicios = gastosServicios.reduce(
        (sum, g) => sum + Number(g.gas_monto),
        0
      );
      const montoMantenimiento = gastosMantenimiento.reduce(
        (sum, g) => sum + Number(g.gas_monto),
        0
      );

      const expenseBreakdown: ExpenseBreakdown[] = [
        {
          tipo: "Servicios",
          monto: montoServicios,
          porcentaje:
            gastosTotal > 0 ? (montoServicios / gastosTotal) * 100 : 0,
        },
        {
          tipo: "Mantenimiento",
          monto: montoMantenimiento,
          porcentaje:
            gastosTotal > 0 ? (montoMantenimiento / gastosTotal) * 100 : 0,
        },
      ];

      // Top 5 servicios por gasto
      const serviceMap = new Map<string, ServiceExpense>();
      gastosServicios.forEach((gasto) => {
        if (gasto.ava_servicio) {
          const key = gasto.ava_servicio.ser_id.toString();
          const current = serviceMap.get(key) || {
            ser_id: key,
            ser_nombre: gasto.ava_servicio.ser_nombre,
            monto: 0,
          };
          current.monto += Number(gasto.gas_monto);
          serviceMap.set(key, current);
        }
      });

      const topServices = Array.from(serviceMap.values())
        .sort((a, b) => b.monto - a.monto)
        .slice(0, 5);

      // ============================================
      // 8. INSIGHTS/ALERTAS
      // ============================================
      const mesesConPerdida = monthlyData.filter((m) => m.ganancia < 0);
      const edificiosConMargenNegativo = buildingSummaries.filter(
        (b) => b.margen < 0
      );
      const mesesGastosMayorIngresos = monthlyData.filter(
        (m) => m.gastos > m.ingresos
      );

      // Calcular promedio mensual de gastos por edificio
      const avgMonthlyExpenseByBuilding = new Map<string, number>();
      buildingSummaries.forEach((b) => {
        const monthsCount = months.length || 1;
        avgMonthlyExpenseByBuilding.set(
          b.edi_id,
          b.gastos / monthsCount
        );
      });

      // Detectar gastos altos (gasto_mes > promedio * 2)
      const gastosAltos: Array<{
        edificio: string;
        mes: string;
        gasto: number;
        promedio: number;
      }> = [];

      gastos.forEach((gasto) => {
        const edificio = gasto.ava_edificio || gasto.ava_propiedad?.ava_edificio;
        if (edificio) {
          const mes = formatInTimeZone(
            gasto.gas_fecha,
            "UTC",
            "yyyy-MM",
            { locale: es }
          );
          const promedio =
            avgMonthlyExpenseByBuilding.get(edificio.edi_id.toString()) || 0;
          if (Number(gasto.gas_monto) > promedio * 2) {
            gastosAltos.push({
              edificio: edificio.edi_identificador,
              mes,
              gasto: Number(gasto.gas_monto),
              promedio,
            });
          }
        }
      });

      // ============================================
      // 9. GENERAR PDF
      // ============================================
      const pdf = await PDFDocument.create();
      const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);

      const A4: [number, number] = [841.89, 595.28]; // A4 landscape
      const marginX = 50;
      const marginTop = A4[1] - 50;
      let page = pdf.addPage(A4);
      let cursorY = marginTop;

      // Función helper para nueva página
      const newPage = () => {
        page = pdf.addPage(A4);
        cursorY = marginTop;
      };

      // Función helper para dibujar texto con wrap
      const drawText = (
        text: string,
        x: number,
        y: number,
        size: number,
        font: any,
        bold = false,
        color = rgb(0, 0, 0)
      ) => {
        const textFont = bold ? helveticaBold : helvetica;
        page.drawText(text, {
          x,
          y,
          size,
          font: textFont,
          color,
        });
      };

      // Encabezado
      drawText("REPORTE CONTABLE GENERAL", marginX, cursorY + 20, 20, helvetica, true);
      const fechaGen = formatInTimeZone(
        new Date(),
        "UTC",
        "dd/MM/yyyy HH:mm",
        { locale: es }
      );
      drawText(
        `Generado: ${fechaGen}`,
        A4[0] - 200,
        cursorY + 20,
        9,
        helvetica,
        false,
        rgb(0.4, 0.4, 0.4)
      );

      const fromLabel = formatInTimeZone(fromDate, "UTC", "dd/MM/yyyy", {
        locale: es,
      });
      const toLabel = formatInTimeZone(toDate, "UTC", "dd/MM/yyyy", {
        locale: es,
      });
      drawText(
        `Período: ${fromLabel} a ${toLabel}`,
        marginX,
        cursorY - 5,
        12,
        helvetica,
        true
      );

      cursorY -= 40;

      // ============================================
      // SECCIÓN 1: RESUMEN EJECUTIVO
      // ============================================
      drawText("1. RESUMEN EJECUTIVO", marginX, cursorY, 14, helvetica, true);
      cursorY -= 25;

      // Fondo para resumen
      page.drawRectangle({
        x: marginX - 10,
        y: cursorY - 80,
        width: A4[0] - 2 * marginX + 20,
        height: 85,
        color: rgb(0.95, 0.95, 0.95),
      });

      drawText(
        `Ingresos Totales: CRC ${ingresosTotal.toLocaleString("es-CR")}`,
        marginX,
        cursorY,
        11,
        helvetica,
        true
      );
      cursorY -= 18;

      drawText(
        `Gastos Totales: CRC ${gastosTotal.toLocaleString("es-CR")}`,
        marginX,
        cursorY,
        11,
        helvetica,
        true
      );
      cursorY -= 18;

      const gananciaColor = gananciaTotal >= 0 ? rgb(0, 0.6, 0) : rgb(0.8, 0, 0);
      drawText(
        `Ganancia Neta: CRC ${gananciaTotal.toLocaleString("es-CR")}`,
        marginX,
        cursorY,
        12,
        helvetica,
        true,
        gananciaColor
      );
      cursorY -= 18;

      drawText(
        `Margen: ${margenTotal.toFixed(2)}%`,
        marginX,
        cursorY,
        11,
        helvetica,
        true
      );
      cursorY -= 18;

      drawText(
        `Meses en Ganancia: ${mesesEnGanancia} | Meses en Pérdida: ${mesesEnPerdida}`,
        marginX,
        cursorY,
        10,
        helvetica
      );

      cursorY -= 50;

      // ============================================
      // SECCIÓN 2: SERIE MENSUAL
      // ============================================
      if (cursorY < 200) newPage();

      drawText("2. SERIE MENSUAL GLOBAL", marginX, cursorY, 14, helvetica, true);
      cursorY -= 25;

      // Tabla mensual
      const colWidths = [80, 100, 100, 100, 80, 80, 80];
      const colXs = colWidths.reduce<number[]>(
        (acc, w, i) =>
          i === 0 ? [marginX] : [...acc, acc[i - 1] + colWidths[i - 1]],
        []
      );

      // Headers
      const headers = [
        "Mes",
        "Ingresos",
        "Gastos",
        "Ganancia",
        "Margen %",
        "Var. Ing.",
        "Var. Gan.",
      ];
      headers.forEach((h, i) => {
        drawText(h, colXs[i], cursorY, 9, helvetica, true);
      });

      cursorY -= 20;
      page.drawLine({
        start: { x: marginX - 10, y: cursorY + 5 },
        end: { x: A4[0] - marginX + 10, y: cursorY + 5 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      cursorY -= 10;

      // Filas de datos
      monthlyData.forEach((m) => {
        if (cursorY < 60) {
          newPage();
          cursorY = marginTop - 20;
        }

        const mesLabel = formatInTimeZone(
          new Date(m.mes + "-01"),
          "UTC",
          "MMM yyyy",
          { locale: es }
        );

        const row = [
          mesLabel,
          `CRC ${m.ingresos.toLocaleString("es-CR")}`,
          `CRC ${m.gastos.toLocaleString("es-CR")}`,
          `CRC ${m.ganancia.toLocaleString("es-CR")}`,
          `${m.margen.toFixed(1)}%`,
          m.variacionIngresos !== null
            ? `${m.variacionIngresos >= 0 ? "+" : ""}${m.variacionIngresos.toFixed(1)}%`
            : "—",
          m.variacionGanancia !== null
            ? `${m.variacionGanancia >= 0 ? "+" : ""}${m.variacionGanancia.toFixed(1)}%`
            : "—",
        ];

        const gananciaColorRow = m.ganancia >= 0 ? rgb(0, 0.6, 0) : rgb(0.8, 0, 0);

        row.forEach((text, i) => {
          if (i === 3) {
            // Columna de ganancia con color
            drawText(text, colXs[i], cursorY, 9, helvetica, false, gananciaColorRow);
          } else {
            drawText(text, colXs[i], cursorY, 9, helvetica);
          }
        });

        cursorY -= 16;
      });

      cursorY -= 20;

      // ============================================
      // SECCIÓN 3: TOP/BOTTOM EDIFICIOS
      // ============================================
      if (cursorY < 250) newPage();

      drawText("3. RANKING DE EDIFICIOS", marginX, cursorY, 14, helvetica, true);
      cursorY -= 25;

      // Top 5
      drawText("Top 5 por Ganancia", marginX, cursorY, 11, helvetica, true);
      cursorY -= 20;

      const topColWidths = [120, 100, 100, 100, 80];
      const topColXs = topColWidths.reduce<number[]>(
        (acc, w, i) =>
          i === 0 ? [marginX] : [...acc, acc[i - 1] + topColWidths[i - 1]],
        []
      );

      const topHeaders = ["Edificio", "Ingresos", "Gastos", "Ganancia", "Margen %"];
      topHeaders.forEach((h, i) => {
        drawText(h, topColXs[i], cursorY, 9, helvetica, true);
      });

      cursorY -= 18;
      page.drawLine({
        start: { x: marginX - 10, y: cursorY + 5 },
        end: { x: marginX + topColWidths.reduce((a, b) => a + b, 0) + 10, y: cursorY + 5 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      cursorY -= 10;

      topBuildings.forEach((b) => {
        if (cursorY < 60) {
          newPage();
          cursorY = marginTop - 20;
        }

        const gananciaColorB = b.ganancia >= 0 ? rgb(0, 0.6, 0) : rgb(0.8, 0, 0);
        drawText(b.edi_identificador, topColXs[0], cursorY, 9, helvetica);
        drawText(`CRC ${b.ingresos.toLocaleString("es-CR")}`, topColXs[1], cursorY, 9, helvetica);
        drawText(`CRC ${b.gastos.toLocaleString("es-CR")}`, topColXs[2], cursorY, 9, helvetica);
        drawText(
          `CRC ${b.ganancia.toLocaleString("es-CR")}`,
          topColXs[3],
          cursorY,
          9,
          helvetica,
          false,
          gananciaColorB
        );
        drawText(`${b.margen.toFixed(1)}%`, topColXs[4], cursorY, 9, helvetica);

        cursorY -= 16;
      });

      cursorY -= 20;

      // Bottom 5
      if (cursorY < 150) newPage();

      drawText("Bottom 5 por Pérdida", marginX, cursorY, 11, helvetica, true);
      cursorY -= 20;

      topHeaders.forEach((h, i) => {
        drawText(h, topColXs[i], cursorY, 9, helvetica, true);
      });

      cursorY -= 18;
      page.drawLine({
        start: { x: marginX - 10, y: cursorY + 5 },
        end: { x: marginX + topColWidths.reduce((a, b) => a + b, 0) + 10, y: cursorY + 5 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      cursorY -= 10;

      bottomBuildings.forEach((b) => {
        if (cursorY < 60) {
          newPage();
          cursorY = marginTop - 20;
        }

        const gananciaColorB = b.ganancia >= 0 ? rgb(0, 0.6, 0) : rgb(0.8, 0, 0);
        drawText(b.edi_identificador, topColXs[0], cursorY, 9, helvetica);
        drawText(`CRC ${b.ingresos.toLocaleString("es-CR")}`, topColXs[1], cursorY, 9, helvetica);
        drawText(`CRC ${b.gastos.toLocaleString("es-CR")}`, topColXs[2], cursorY, 9, helvetica);
        drawText(
          `CRC ${b.ganancia.toLocaleString("es-CR")}`,
          topColXs[3],
          cursorY,
          9,
          helvetica,
          false,
          gananciaColorB
        );
        drawText(`${b.margen.toFixed(1)}%`, topColXs[4], cursorY, 9, helvetica);

        cursorY -= 16;
      });

      cursorY -= 30;

      // ============================================
      // SECCIÓN 4: TOP/BOTTOM PROPIEDADES
      // ============================================
      if (cursorY < 250) newPage();

      drawText("4. RANKING DE PROPIEDADES", marginX, cursorY, 14, helvetica, true);
      cursorY -= 25;

      // Top 10
      drawText("Top 10 por Ganancia", marginX, cursorY, 11, helvetica, true);
      cursorY -= 20;

      const propColWidths = [100, 80, 100, 100, 100, 80];
      const propColXs = propColWidths.reduce<number[]>(
        (acc, w, i) =>
          i === 0 ? [marginX] : [...acc, acc[i - 1] + propColWidths[i - 1]],
        []
      );

      const propHeaders = ["Propiedad", "Edificio", "Ingresos", "Gastos", "Ganancia", "Margen %"];
      propHeaders.forEach((h, i) => {
        drawText(h, propColXs[i], cursorY, 9, helvetica, true);
      });

      cursorY -= 18;
      page.drawLine({
        start: { x: marginX - 10, y: cursorY + 5 },
        end: { x: marginX + propColWidths.reduce((a, b) => a + b, 0) + 10, y: cursorY + 5 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      cursorY -= 10;

      topProperties.forEach((p) => {
        if (cursorY < 60) {
          newPage();
          cursorY = marginTop - 20;
        }

        const gananciaColorP = p.ganancia >= 0 ? rgb(0, 0.6, 0) : rgb(0.8, 0, 0);
        drawText(p.prop_identificador, propColXs[0], cursorY, 9, helvetica);
        drawText(p.edi_identificador, propColXs[1], cursorY, 9, helvetica);
        drawText(`CRC ${p.ingresos.toLocaleString("es-CR")}`, propColXs[2], cursorY, 9, helvetica);
        drawText(`CRC ${p.gastos.toLocaleString("es-CR")}`, propColXs[3], cursorY, 9, helvetica);
        drawText(
          `CRC ${p.ganancia.toLocaleString("es-CR")}`,
          propColXs[4],
          cursorY,
          9,
          helvetica,
          false,
          gananciaColorP
        );
        drawText(`${p.margen.toFixed(1)}%`, propColXs[5], cursorY, 9, helvetica);

        cursorY -= 16;
      });

      cursorY -= 30;

      // ============================================
      // SECCIÓN 5: DISTRIBUCIÓN DE GASTOS
      // ============================================
      if (cursorY < 200) newPage();

      drawText("5. DISTRIBUCIÓN DE GASTOS", marginX, cursorY, 14, helvetica, true);
      cursorY -= 25;

      // Por tipo
      drawText("Por Tipo", marginX, cursorY, 11, helvetica, true);
      cursorY -= 20;

      expenseBreakdown.forEach((e) => {
        if (cursorY < 60) {
          newPage();
          cursorY = marginTop - 20;
        }

        drawText(
          `${e.tipo}: CRC ${e.monto.toLocaleString("es-CR")} (${e.porcentaje.toFixed(1)}%)`,
          marginX + 20,
          cursorY,
          10,
          helvetica
        );
        cursorY -= 18;
      });

      cursorY -= 15;

      // Top 5 servicios
      if (topServices.length > 0) {
        drawText("Top 5 Servicios por Gasto", marginX, cursorY, 11, helvetica, true);
        cursorY -= 20;

        topServices.forEach((s) => {
          if (cursorY < 60) {
            newPage();
            cursorY = marginTop - 20;
          }

          drawText(
            `${s.ser_nombre}: CRC ${s.monto.toLocaleString("es-CR")}`,
            marginX + 20,
            cursorY,
            10,
            helvetica
          );
          cursorY -= 18;
        });
      }

      cursorY -= 30;

      // ============================================
      // SECCIÓN 6: INSIGHTS/ALERTAS
      // ============================================
      if (cursorY < 200) newPage();

      drawText("6. INSIGHTS Y ALERTAS", marginX, cursorY, 14, helvetica, true);
      cursorY -= 25;

      // Alertas
      if (mesesConPerdida.length > 0) {
        drawText(
          `⚠ Meses con Pérdida: ${mesesConPerdida.map((m) => formatInTimeZone(new Date(m.mes + "-01"), "UTC", "MMM yyyy", { locale: es })).join(", ")}`,
          marginX,
          cursorY,
          10,
          helvetica,
          false,
          rgb(0.8, 0, 0)
        );
        cursorY -= 18;
      }

      if (edificiosConMargenNegativo.length > 0) {
        drawText(
          `⚠ Edificios con Margen Negativo: ${edificiosConMargenNegativo.map((e) => e.edi_identificador).join(", ")}`,
          marginX,
          cursorY,
          10,
          helvetica,
          false,
          rgb(0.8, 0, 0)
        );
        cursorY -= 18;
      }

      if (mesesGastosMayorIngresos.length > 0) {
        drawText(
          `⚠ Meses donde Gastos > Ingresos: ${mesesGastosMayorIngresos.map((m) => formatInTimeZone(new Date(m.mes + "-01"), "UTC", "MMM yyyy", { locale: es })).join(", ")}`,
          marginX,
          cursorY,
          10,
          helvetica,
          false,
          rgb(0.8, 0, 0)
        );
        cursorY -= 18;
      }

      if (gastosAltos.length > 0) {
        drawText("⚠ Gastos Altos Detectados:", marginX, cursorY, 10, helvetica, true, rgb(0.8, 0, 0));
        cursorY -= 18;
        gastosAltos.slice(0, 5).forEach((g) => {
          if (cursorY < 60) {
            newPage();
            cursorY = marginTop - 20;
          }
          drawText(
            `  ${g.edificio} (${formatInTimeZone(new Date(g.mes + "-01"), "UTC", "MMM yyyy", { locale: es })}): CRC ${g.gasto.toLocaleString("es-CR")} (Promedio: CRC ${g.promedio.toLocaleString("es-CR")})`,
            marginX + 20,
            cursorY,
            9,
            helvetica
          );
          cursorY -= 16;
        });
      }

      // ============================================
      // FINALIZAR PDF
      // ============================================
      const pdfBytes = await pdf.save();
      const filename = `Reporte_Contable_General_${fromLabel.replace(/\//g, "-")}_a_${toLabel.replace(/\//g, "-")}.pdf`
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
    } catch (error: any) {
      console.error("Error generando reporte contable general:", error);
      return new Response(
        JSON.stringify({ error: "Error interno del servidor" }),
        { status: 500 }
      );
    }
  })(req, new NextResponse());
}

