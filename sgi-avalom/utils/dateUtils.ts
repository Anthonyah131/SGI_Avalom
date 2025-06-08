import {
  format,
  addMonths,
  isSameDay,
  isAfter,
  parseISO,
  isValid,
  endOfMonth,
} from "date-fns";
import { toDate, toZonedTime  } from "date-fns-tz";
import { es } from "date-fns/locale";

export function calculateMonthsBetween(
  startDate: Date,
  endDate: Date,
  timeZone: string = "America/Costa_Rica"
): { startDate: string; endDate: string }[] {
  const months: { startDate: string; endDate: string }[] = [];
  let currentStart = toDate(startDate, { timeZone });
  const dayOfMonth = currentStart.getDate();

  while (isAfter(endDate, currentStart)) {
    const potentialEndDate = addMonths(currentStart, 1);

    const daysInMonth = new Date(
      potentialEndDate.getFullYear(),
      potentialEndDate.getMonth() + 1,
      0
    ).getDate();
    const adjustedDay = Math.min(dayOfMonth, daysInMonth);

    const currentEndDate = new Date(
      potentialEndDate.getFullYear(),
      potentialEndDate.getMonth(),
      adjustedDay
    );

    if (isAfter(currentEndDate, endDate)) {
      months.push({
        startDate: currentStart.toISOString(),
        endDate: toDate(endDate, { timeZone }).toISOString(),
      });
      break;
    }

    months.push({
      startDate: currentStart.toISOString(),
      endDate: currentEndDate.toISOString(),
    });

    currentStart = new Date(
      currentEndDate.getFullYear(),
      currentEndDate.getMonth(),
      adjustedDay
    );
  }

  return months;
}

export function formatDateRange(start: Date, end: Date): string {
  return `${format(start, "dd/MM/yyyy")} - ${format(end, "dd/MM/yyyy")}`;
}

export function formatLongDateEs(isoDate: string): string {
  const date = parseISO(isoDate);
  return format(date, "PPP", { locale: es });
}

export function formatToCR(date: string): string {
  try {
    const zoned = toZonedTime(parseISO(date), "America/Costa_Rica");
    return format(toDate(zoned), "PPP", { locale: es });
  } catch {
    return "Fecha inválida";
  }
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

export function convertToUTCSV(localDate: string): string {
  if (!localDate) {
    console.error("La fecha local está vacía o nula:", localDate);
    return "";
  }

  try {

    const date = new Date(`${localDate}T00:00:00`);
    return date.toISOString();
  } catch (error) {
    console.error("Error al convertir fecha local a UTC:", error, {
      localDate,
    });
    return "";
  }
}

export function safeParseISO(dateString: string): Date | null {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      throw new Error("Fecha inválida.");
    }
    date.setHours(0, 0, 0, 0);
    return date;
  } catch (error) {
    console.error("Error al analizar fecha ISO:", error, { dateString });
    return null;
  }
}
