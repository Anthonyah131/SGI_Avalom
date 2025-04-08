import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserForm from "@/components/mantUser/UserFormProps";
import { UserFormProps } from "@/lib/typesForm";
import "@testing-library/jest-dom";

jest.mock("@/lib/UserContext", () => ({
  useUser: () => ({
    user: {
      usu_rol: "A",
    },
  }),
}));

jest.mock("@/lib/zustand/userStore", () => ({
  __esModule: true,
  default: () => ({
    addUser: jest.fn(),
    updateUser: jest.fn(),
  }),
}));

jest.mock("js-cookie", () => ({
  get: () => "fake-token",
}));

jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
  put: jest.fn(() => Promise.resolve({ data: { success: true, data: {} } })),
}));

const setup = (props: Partial<UserFormProps> = {}) => {
  const defaultProps: UserFormProps = {
    action: "create",
    entity: undefined,
    onSuccess: jest.fn(),
    ...props,
  };

  return render(<UserForm {...defaultProps} />);
};

describe("UserForm Component", () => {
  it("renderiza todos los campos", () => {
    setup();
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Primer Apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Segundo Apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cédula/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo/i)).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText("Rol")).toBeInTheDocument();
  });

  it("valida campos requeridos", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /crear usuario/i }));
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
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), {
      target: { value: "88889999" },
    });
    fireEvent.change(screen.getByLabelText(/Correo/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "" }));
    fireEvent.change(screen.getByPlaceholderText(/Ingresa una contraseña/i), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /crear usuario/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("deshabilita campos en modo 'view'", () => {
    const userEntity = {
      usu_id: "1",
      usu_nombre: "Ana",
      usu_papellido: "Lopez",
      usu_sapellido: "Martínez",
      usu_cedula: "11223344",
      usu_telefono: "88889999",
      usu_correo: "ana@test.com",
      usu_estado: "A" as const,
      usu_rol: "E" as const,
      usu_contrasena: "",
    };

    setup({ action: "view", entity: userEntity });

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
