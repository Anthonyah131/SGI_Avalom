import { stringifyWithBigInt } from "@/utils/converters";
import { formatCurrency, parseCurrency } from "@/utils/currencyConverter";
import {
  calculateMonthsBetween,
  convertToCostaRicaTime,
  convertToUTC,
  formatDateRange,
  safeParseISO,
} from "@/utils/dateUtils";
import { Decimal } from "@prisma/client/runtime/library";

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("stringifyWithBigInt", () => {
  it("convierte BigInt, Decimal y Date", () => {
    const now = new Date();
    const input = {
      id: BigInt(123),
      total: new Decimal("2500.75"),
      fecha: now,
    };
    const result = stringifyWithBigInt(input);
    expect(result).toEqual({
      id: "123",
      total: "2500.75",
      fecha: now.toISOString(),
    });
  });
});

describe("formatCurrency y parseCurrency", () => {
  it("formatea número en colones", () => {
    const formatted = formatCurrency(1234567.89);
    expect(typeof formatted).toBe("string");
    expect(formatted).toMatch(/₡\s?\d/);
  });

  it("parsea string de colones a número", () => {
    expect(parseCurrency("₡1,234.56")).toBeCloseTo(1234.56, 2);
  });

  it("retorna 0 con string inválido", () => {
    expect(parseCurrency("texto inválido")).toBe(0);
  });
});

describe("funciones de fechas", () => {
  it("convierte UTC a fecha local de CR", () => {
    const iso = "2024-04-01T06:00:00Z";
    const result = convertToCostaRicaTime(iso);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("convierte fecha local a UTC", () => {
    const result = convertToUTC("2024-04-01");
    expect(result).toBe("2024-04-01T00:00:00.000Z");
  });

  it("maneja error en convertToUTC", () => {
    const result = convertToUTC("fecha inválida");
    expect(result).toBe("");
  });

  it("safeParseISO válida", () => {
    const parsed = safeParseISO("2024-04-01");
    expect(parsed?.toISOString()).toContain("2024-04-01T");
  });

  it("safeParseISO inválida", () => {
    expect(safeParseISO("no-es-fecha")).toBeNull();
  });

  it("formatea rango de fechas", () => {
    const inicio = new Date(Date.UTC(2024, 3, 1, 12));
    const fin = new Date(Date.UTC(2024, 3, 30, 12));

    const result = formatDateRange(inicio, fin);
    expect(result).toBe("01/04/2024 - 30/04/2024");
  });

  it("genera rangos mensuales entre fechas", () => {
    const result = calculateMonthsBetween(
      new Date("2024-01-15"),
      new Date("2024-04-15")
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("startDate");
    expect(result[0]).toHaveProperty("endDate");
  });
});
