import {
  format,
  addMonths,
  isSameDay,
  isAfter,
  parseISO,
  isValid,
} from "date-fns";
import { toDate } from "date-fns-tz";

export function getMonthsBetween(
  startDate: Date,
  endDate: Date
): { start: Date; end: Date }[] {
  const months: { start: Date; end: Date }[] = [];
  let currentStart = startDate;
  let currentEnd = addMonths(currentStart, 1);

  while (isSameDay(currentEnd, endDate) || isAfter(endDate, currentEnd)) {
    months.push({ start: currentStart, end: currentEnd });
    currentStart = currentEnd;
    currentEnd = addMonths(currentStart, 1);
  }

  if (isAfter(endDate, currentStart)) {
    months.push({ start: currentStart, end: endDate });
  }

  return months;
}

export function formatDateRange(start: Date, end: Date): string {
  return `${format(start, "dd/MM/yyyy")} - ${format(end, "dd/MM/yyyy")}`;
}

// Convertir de UTC a Costa Rica
export function convertToCostaRicaTime(isoDate: string): string {
  const costaRicaTime = toDate(new Date(isoDate), {
    timeZone: "America/Costa_Rica",
  });
  return format(costaRicaTime, "yyyy-MM-dd");
}

// Convertir fecha local a UTC (como ISO string)
export function convertToUTC(localDate: string): string {
  if (!localDate) {
    console.error("La fecha local está vacía o nula:", localDate);
    return ""; // Manejo de error
  }

  try {
    // Si la fecha ya es ISO válida, no la alteres
    if (!isNaN(Date.parse(localDate))) {
      return new Date(localDate).toISOString();
    }

    // Para fechas locales sin tiempo (por ejemplo: '2024-01-28')
    const date = new Date(`${localDate}T00:00:00`);
    return date.toISOString();
  } catch (error) {
    console.error("Error al convertir fecha local a UTC:", error, {
      localDate,
    });
    return ""; // Manejo de error
  }
}

export function safeParseISO(dateString: string): Date | null {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      throw new Error("Fecha inválida.");
    }
    return date;
  } catch (error) {
    console.error("Error al analizar fecha ISO:", error, { dateString });
    return null;
  }
}
