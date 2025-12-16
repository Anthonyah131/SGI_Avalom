/**
 * Formatea un número como moneda en colones costarricenses con decimales
 * @param amount - El monto a formatear
 * @returns El monto formateado como string (ej: "₡1,234.56")
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  }).format(amount);
};

/**
 * Formatea un número como moneda en colones costarricenses sin decimales
 * Útil para mostrar montos redondeados en gráficos y tablas
 * @param amount - El monto a formatear
 * @returns El monto formateado como string (ej: "₡1,235")
 */
export const formatCurrencyNoDecimals = (amount: number) => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Convierte una cadena de texto con formato de moneda a un número
 * @param value - La cadena de texto a convertir (ej: "₡1,234.56")
 * @returns El número parseado o 0 si no se puede convertir
 */
export const parseCurrency = (value: string): number =>
  parseFloat(value.replace(/[^\d.-]/g, "")) || 0;
