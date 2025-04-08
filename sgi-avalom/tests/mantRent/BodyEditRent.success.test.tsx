import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import cookie from "js-cookie";

jest.mock("axios");
jest.mock("js-cookie");

jest.mock("@/lib/zustand/useRentalStore", () => ({
  __esModule: true,
  default: () => ({
    setSelectedRental: jest.fn(),
    setRents: jest.fn(),
    setLoadingState: jest.fn(),
    setDeposit: jest.fn(),
    isLoading: false,
    monthlyRents: [],
    createMonthlyRents: [],
  }),
}));

jest.mock("@/components/mantRent/edit/rentalForm", () => ({
  __esModule: true,
  default: () => <div>RentalForm</div>,
}));
jest.mock("@/components/mantRent/edit/depositForm", () => ({
  __esModule: true,
  default: () => <div>DepositForm</div>,
}));
jest.mock("@/components/mantRent/edit/DateRangeCalculator", () => ({
  __esModule: true,
  DateRangeCalculator: () => <div>RangeCalculator</div>,
}));
jest.mock("@/components/mantRent/edit/MonthsBetween", () => ({
  __esModule: true,
  default: () => <div>MonthsBetween</div>,
}));
jest.mock("@/components/breadcrumbResponsive", () => ({
  __esModule: true,
  BreadcrumbResponsive: () => <div>Breadcrumb</div>,
}));
jest.mock("@/components/modeToggle", () => ({
  __esModule: true,
  ModeToggle: () => <div>ModeToggle</div>,
}));
jest.mock("next/navigation", () => ({
  useParams: () => ({ alqId: "123" }),
}));

import BodyEditRent from "@/components/mantRent/edit/bodyEditRent";

describe("BodyEditRent - éxito", () => {
  beforeEach(() => {
    (cookie.get as jest.Mock).mockImplementation(() => "fake-token");
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        data: {
          ava_alquilermensual: [],
          ava_deposito: [{ depo_id: "1" }],
        },
      },
    });
  });

  it("renderiza correctamente el componente con datos simulados", async () => {
    render(<BodyEditRent />);
    await waitFor(() => {
      expect(screen.getByText("Modificar alquiler")).toBeInTheDocument();
    });

    expect(screen.getByText("RentalForm")).toBeInTheDocument();
    expect(screen.getByText("DepositForm")).toBeInTheDocument();
    expect(screen.getByText("RangeCalculator")).toBeInTheDocument();
  });
});
