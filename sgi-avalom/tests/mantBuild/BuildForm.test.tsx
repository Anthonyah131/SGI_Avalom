import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BuildForm from "@/components/mantBuild/buildFormProps";
import { BuildFormProps } from "@/lib/typesForm";

jest.mock("@/lib/zustand/buildStore", () => ({
  __esModule: true,
  default: () => ({
    addBuilding: jest.fn(),
    updateBuilding: jest.fn(),
  }),
}));

jest.mock("js-cookie", () => ({
  get: () => "fake-token",
}));

jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
  put: jest.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
}));

const setup = (props: Partial<BuildFormProps> = {}) => {
  const defaultProps: BuildFormProps = {
    action: "create",
    building: undefined,
    onSuccess: jest.fn(),
    ...props,
  };

  return render(<BuildForm {...defaultProps} />);
};

describe("BuildForm Component", () => {
  it("renderiza todos los campos", () => {
    setup();
    expect(screen.getByLabelText(/Identificador/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
  });

  it("valida campos requeridos", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /crear edificio/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/es requerido/i).length).toBeGreaterThan(0);
    });
  });

  it("llama a onSuccess en creación exitosa", async () => {
    const onSuccess = jest.fn();
    setup({ onSuccess });

    fireEvent.change(screen.getByLabelText(/Identificador/i), {
      target: { value: "B01" },
    });
    fireEvent.change(screen.getByLabelText(/Descripción/i), {
      target: { value: "Edificio Central" },
    });

    fireEvent.click(screen.getByRole("button", { name: /crear edificio/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("deshabilita campos en modo 'view'", () => {
    const buildingEntity = {
      edi_id: "1",
      edi_identificador: "B01",
      edi_descripcion: "Edificio Central",
      ava_propiedad: [],
    };

    setup({ action: "view", building: buildingEntity });

    expect(screen.getByLabelText(/Identificador/i)).toBeDisabled();
    expect(screen.getByLabelText(/Descripción/i)).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /crear/i })
    ).not.toBeInTheDocument();
  });

  it("limpia el formulario con el botón 'Limpiar'", async () => {
    setup();

    const input = screen.getByLabelText(/Identificador/i);
    fireEvent.change(input, { target: { value: "TEMP" } });
    expect(input).toHaveValue("TEMP");

    fireEvent.click(screen.getByRole("button", { name: /limpiar/i }));

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });
});
