import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ClienteForm from "@/components/mantClient/clienteFormProps";
import { ClienteFormProps } from "@/lib/typesForm";

jest.mock("@/lib/zustand/clientStore", () => ({
  __esModule: true,
  default: () => ({
    addClient: jest.fn(),
    updateClient: jest.fn(),
  }),
}));

jest.mock("js-cookie", () => ({
  get: () => "fake-token",
}));

jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
  put: jest.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
}));

const setup = (props: Partial<ClienteFormProps> = {}) => {
  const defaultProps: ClienteFormProps = {
    action: "create",
    entity: undefined,
    onSuccess: jest.fn(),
    ...props,
  };

  return render(<ClienteForm {...defaultProps} />);
};

describe("ClienteForm Component", () => {
  it("renderiza todos los campos", () => {
    setup();
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Primer Apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Segundo Apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cédula/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo/i)).toBeInTheDocument();
  });

  it("valida campos requeridos", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /crear cliente/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/es requerido/i).length).toBeGreaterThan(0);
    });
  });

  it("llama a onSuccess en creación exitosa", async () => {
    const onSuccess = jest.fn();
    setup({ onSuccess });

    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: "Carlos" },
    });
    fireEvent.change(screen.getByLabelText(/Primer Apellido/i), {
      target: { value: "Ramírez" },
    });
    fireEvent.change(screen.getByLabelText(/Segundo Apellido/i), {
      target: { value: "Jiménez" },
    });
    fireEvent.change(screen.getByLabelText(/Cédula/i), {
      target: { value: "123456789" },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), {
      target: { value: "88889999" },
    });
    fireEvent.change(screen.getByLabelText(/Correo/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /crear cliente/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("deshabilita campos en modo 'view'", () => {
    const clienteEntity = {
      cli_id: "1",
      cli_nombre: "Ana",
      cli_papellido: "Lopez",
      cli_sapellido: "Martínez",
      cli_cedula: "11223344",
      cli_telefono: "88889999",
      cli_correo: "ana@test.com",
      ava_clientexalquiler: [],
    };

    setup({ action: "view", entity: clienteEntity });

    expect(screen.getByLabelText(/Nombre/i)).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /crear/i })
    ).not.toBeInTheDocument();
  });

  it("limpia el formulario con el botón 'Limpiar'", async () => {
    setup();

    const input = screen.getByLabelText(/Nombre/i);
    fireEvent.change(input, { target: { value: "Texto" } });
    expect(input).toHaveValue("Texto");

    fireEvent.click(screen.getByRole("button", { name: /limpiar/i }));

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });
});
