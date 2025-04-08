import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import PropertyForm from "@/components/mantBuild/mantProperty/propertyFormProps";
import { PropertyFormProps } from "@/lib/typesForm";

jest.mock("@/lib/zustand/buildStore", () => ({
  __esModule: true,
  default: () => ({
    addProperty: jest.fn(),
    updateProperty: jest.fn(),
  }),
}));

jest.mock("@/lib/zustand/propertyStore", () => ({
  __esModule: true,
  default: () => ({
    setSelectedProperty: jest.fn(),
    updateSelectedProperty: jest.fn(),
  }),
}));

jest.mock("@/lib/zustand/typeStore", () => ({
  __esModule: true,
  default: () => ({
    types: [
      { tipp_id: "1", tipp_nombre: "Apartamento" },
      { tipp_id: "2", tipp_nombre: "Local Comercial" },
    ],
    fetchTypes: jest.fn(),
  }),
}));

jest.mock("js-cookie", () => ({
  get: () => "fake-token",
}));

jest.mock("axios", () => ({
  post: jest.fn(() =>
    Promise.resolve({ data: { success: true, data: {} } })
  ),
  put: jest.fn(() =>
    Promise.resolve({ data: { success: true, data: {} } })
  ),
}));

const setup = (props: Partial<PropertyFormProps> = {}) => {
  const defaultProps: PropertyFormProps = {
    action: "create",
    entity: "1",
    property: undefined,
    onSuccess: jest.fn(),
    ...props,
  };

  return render(<PropertyForm {...defaultProps} />);
};

describe("PropertyForm Component", () => {
  it("renderiza todos los campos", () => {
    setup();

    expect(screen.getByLabelText(/Identificador/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByText(/Tipo de Propiedad/i)).toBeInTheDocument();
    expect(screen.getByText(/Seleccionar Tipo/i)).toBeInTheDocument();
  });

  it("valida campos requeridos", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /crear propiedad/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/obligatorio/i).length).toBeGreaterThan(0);
    });
  });

  it("deshabilita campos en modo 'view'", () => {
    const mockProperty = {
      prop_id: "1",
      prop_identificador: "P-001",
      prop_descripcion: "Propiedad X",
      tipp_id: "1",
      edi_id: "1",
      ava_alquiler: [],
      ava_pagoservicio: [],
      ava_reservacion: [],
    };

    setup({ action: "view", property: mockProperty });

    expect(screen.getByLabelText(/Identificador/i)).toBeDisabled();
    expect(screen.getByLabelText(/Descripción/i)).toBeDisabled();
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /crear/i })
    ).not.toBeInTheDocument();
  });
});
