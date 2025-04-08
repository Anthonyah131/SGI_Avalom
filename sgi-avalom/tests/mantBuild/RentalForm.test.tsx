import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RentalForm from "@/components/mantBuild/mantProperty/mantRent/rentForm";
import { RentalFormProps } from "@/lib/typesForm";
import { act } from "react-dom/test-utils";

jest.mock("@/lib/zustand/propertyStore", () => ({
  __esModule: true,
  default: () => ({
    addRental: jest.fn(),
    updateRental: jest.fn(),
    removeRental: jest.fn(),
    selectedProperty: { prop_id: "1" },
    selectedRental: null,
    setSelectedRental: jest.fn(),
  }),
}));

jest.mock("@/lib/zustand/clientStore", () => ({
  __esModule: true,
  default: () => ({
    clients: [],
    setClients: jest.fn(),
  }),
}));

jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: { data: [] } })),
  post: jest.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
  put: jest.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
}));

jest.mock("js-cookie", () => ({
  get: () => "fake-token",
}));

const setup = (props: Partial<RentalFormProps> = {}) => {
  const defaultProps: RentalFormProps = {
    action: "create",
    onSuccess: jest.fn(),
    ...props,
  };
  return render(<RentalForm {...defaultProps} />);
};

describe("RentalForm Component", () => {
  it("renderiza campos esenciales", () => {
    setup();
    expect(screen.getByLabelText(/Monto/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha de Pago/i)).toBeInTheDocument();
    expect(screen.getByText(/Estado/i)).toBeInTheDocument();
  });

  it("valida campos requeridos", async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/Monto/i), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /crear alquiler/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/requerido/i).length).toBeGreaterThan(0);
    });
  });

  it("deshabilita todo en modo 'view'", () => {
    setup({ action: "view" });

    expect(screen.getByLabelText(/Monto/i)).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: (_c, el) =>
          el?.textContent?.includes("Seleccione una fecha") ?? false,
      })
    ).toBeDisabled();
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /crear/i })
    ).not.toBeInTheDocument();
  });
});
