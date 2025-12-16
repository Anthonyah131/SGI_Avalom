import { Decimal } from "@prisma/client/runtime/library";

export const stringifyWithBigInt = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map((item) => stringifyWithBigInt(item)); // Procesa cada elemento del array
  } else if (typeof data === "object" && data !== null) {
    if (data instanceof Date) {
      return data.toISOString(); // Devuelve las fechas en formato ISO
    }
    if (data instanceof Decimal) {
      return data.toString(); // Convierte Decimal a string
    }
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === "bigint"
          ? value.toString() // Convierte BigInt a string
          : typeof value === "object"
          ? stringifyWithBigInt(value) // Procesa objetos anidados
          : value, // Devuelve valores simples sin cambios
      ])
    );
  } else {
    return data; // Devuelve valores primitivos (string, number, boolean, null)
  }
};

