import { render, screen, waitFor } from "@testing-library/react";
import cookie from "js-cookie";
import axios from "axios";
import React from "react";

jest.mock("axios");
jest.mock("js-cookie");

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

let tokenValue: string | undefined = "fake-token";
(cookie.get as jest.Mock).mockImplementation(() => tokenValue);

const setRentalsMock = jest.fn();
jest.mock("@/lib/zustand/rentalStore", () => ({
  __esModule: true,
  default: () => ({
    rentals: tokenValue ? [{ alq_id: 1, alq_estado: "A" }] : [],
    setRentals: setRentalsMock,
  }),
}));

jest.mock("@/components/mantRent/data_table_filter", () => ({
  DataTable: ({ data }: any) => (
    <div data-testid="datatable">DataTable con {data?.length ?? 0} filas</div>
  ),
}));

import BodyRent from "@/components/mantRent/bodyRent";

describe("BodyRent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tokenValue = "fake-token";

    (axios.get as jest.Mock).mockResolvedValue({
      data: { data: [{ alq_id: 1, alq_estado: "A" }] },
    });
  });

  it("muestra título y breadcrumbs", () => {
    render(<BodyRent />);
    expect(screen.getByText("Gestión de Alquileres")).toBeInTheDocument();
    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("realiza fetch de alquileres y muestra DataTable", async () => {
    render(<BodyRent />);
    await waitFor(() => {
      expect(screen.getByTestId("datatable")).toHaveTextContent("DataTable con 1 filas");
    });

    expect(setRentalsMock).toHaveBeenCalledWith([{ alq_id: 1, alq_estado: "A" }]);
    expect(axios.get).toHaveBeenCalled();
  });

  it("no llama a axios si no hay token", async () => {
    tokenValue = undefined;
    render(<BodyRent />);

    await waitFor(() => {
      expect(screen.getByTestId("datatable")).toHaveTextContent("DataTable con 0 filas");
    });

    expect(axios.get).not.toHaveBeenCalled();
  });
});
