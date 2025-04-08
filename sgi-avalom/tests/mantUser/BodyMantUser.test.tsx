import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BodyMantUser from "@/components/mantUser/bodyMantUser";
import axios from "axios";

jest.mock("axios", () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: {
        data: [
          {
            usu_id: "1",
            usu_nombre: "Juan",
            usu_papellido: "Pérez",
            usu_cedula: "123",
            usu_correo: "juan@mail.com",
            usu_estado: "A",
            usu_rol: "A",
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
      <p>Tabla de Usuarios</p>
      {data && data.length > 0 && <p>Usuario: {data[0]?.usu_nombre}</p>}
    </div>
  ),
}));

jest.mock("@/components/mantUser/UserFormProps", () => ({
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

jest.mock("@/lib/zustand/userStore", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((selector) =>
    selector({
      users: [
        {
          usu_id: "1",
          usu_nombre: "Juan",
          usu_papellido: "Pérez",
          usu_cedula: "123",
          usu_correo: "juan@mail.com",
          usu_estado: "A",
          usu_rol: "A",
        },
      ],
      setUsers: jest.fn(),
      addUser: jest.fn(),
      removeUser: jest.fn(),
    })
  ),
}));

describe("BodyMantUser", () => {
  it("muestra la tabla cuando se cargan los usuarios", async () => {
    render(<BodyMantUser />);

    expect(screen.getByText(/Gestión de Usuarios/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Tabla de Usuarios/i)).toBeInTheDocument();
      expect(screen.getByText(/Usuario: Juan/i)).toBeInTheDocument();
    });
  });
});
