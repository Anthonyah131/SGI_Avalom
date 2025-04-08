import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BodyMantClient from "@/components/mantClient/bodyMantClient";
import axios from "axios";

jest.mock("axios", () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: {
        data: [
          {
            cli_id: "1",
            cli_nombre: "Juan Pérez",
            cli_cedula: "123456789",
            cli_telefono: "88889999",
            cli_correo: "juan@example.com",
            cli_direccion: "San José, Costa Rica",
          },
        ],
      },
    })
  ),
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(() => "fake-token"),
}));

jest.mock("@/components/dataTable/data-table", () => ({
  __esModule: true,
  DataTable: ({ data }: { data: any }) => (
    <div>
      <p>Tabla de Clientes</p>
      {data?.length > 0 && <p>Cliente: {data[0].cli_nombre}</p>}
    </div>
  ),
}));

jest.mock("@/components/mantClient/clienteFormProps", () => ({
  __esModule: true,
  default: () => <div>Mocked Form</div>,
}));

jest.mock("@/components/dataTable/manageActions", () => ({
  __esModule: true,
  default: ({ FormComponent }: { FormComponent: React.ReactNode }) => (
    <div>{FormComponent}</div>
  ),
}));

jest.mock("@/components/modeToggle", () => ({
  __esModule: true,
  ModeToggle: () => <div>ModeToggle</div>,
}));

jest.mock("@/components/breadcrumbResponsive", () => ({
  __esModule: true,
  BreadcrumbResponsive: () => <div>Breadcrumb</div>,
}));

jest.mock("@/lib/zustand/clientStore", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((selector) =>
    selector({
      clients: [
        {
          cli_id: "1",
          cli_nombre: "Juan Pérez",
          cli_cedula: "123456789",
          cli_telefono: "88889999",
          cli_correo: "juan@example.com",
          cli_direccion: "San José, Costa Rica",
        },
      ],
      setClients: jest.fn(),
      addClient: jest.fn(),
      updateClient: jest.fn(),
      removeClient: jest.fn(),
    })
  ),
}));

describe("BodyMantClient", () => {
  it("muestra título y tabla con datos cargados", async () => {
    render(<BodyMantClient />);
    expect(screen.getByText(/Gestión de Clientes/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Tabla de Clientes/i)).toBeInTheDocument();
      expect(screen.getByText(/Cliente: Juan Pérez/i)).toBeInTheDocument();
    });
  });
});
