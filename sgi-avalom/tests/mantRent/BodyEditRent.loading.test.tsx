import { render, screen } from "@testing-library/react";
import React from "react";
import cookie from "js-cookie";

// Mocks generales
jest.mock("js-cookie", () => ({
  get: jest.fn(() => "fake-token"),
}));

jest.mock("@/lib/zustand/useRentalStore", () => ({
  __esModule: true,
  default: () => ({
    isLoading: true,
    setLoadingState: jest.fn(),
    setSelectedRental: jest.fn(),
    setRents: jest.fn(),
    setDeposit: jest.fn(),
    monthlyRents: [],
    createMonthlyRents: [],
  }),
}));

jest.mock("next/navigation", () => ({
  useParams: () => ({ alqId: "123" }),
}));

// 🔒 Mockeamos los componentes pesados para evitar el error de ESM
jest.mock("@/components/mantRent/edit/DateRangeCalculator", () => ({
  __esModule: true,
  DateRangeCalculator: () => <div>Mock DateRangeCalculator</div>,
}));
jest.mock("@/components/mantRent/edit/MonthsBetween", () => ({
  __esModule: true,
  default: () => <div>Mock MonthsBetween</div>,
}));

jest.mock("@/components/mantRent/edit/depositForm", () => ({
  __esModule: true,
  default: () => <div>Mock DepositForm</div>,
}));
jest.mock("@/components/mantRent/edit/rentalForm", () => ({
  __esModule: true,
  default: () => <div>Mock RentalForm</div>,
}));
jest.mock("@/components/breadcrumbResponsive", () => ({
  __esModule: true,
  BreadcrumbResponsive: () => <div>Mock Breadcrumb</div>,
}));
jest.mock("@/components/modeToggle", () => ({
  __esModule: true,
  ModeToggle: () => <div>Mock ModeToggle</div>,
}));

// ⚠️ Importamos después de los mocks
import BodyEditRent from "@/components/mantRent/edit/bodyEditRent";

describe("BodyEditRent - loading", () => {
  it("muestra mensaje de carga si isLoading es true", () => {
    render(<BodyEditRent />);
    expect(screen.getByText(/Cargando datos/i)).toBeInTheDocument();
  });
});
