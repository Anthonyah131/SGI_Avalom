import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BodyMantBuild from "@/components/mantBuild/bodyMantBuild";
import { AvaEdificio } from "@/lib/types";

jest.mock("axios", () => ({
  get: jest.fn((url: string) => {
    if (url.includes("/api/building")) {
      return Promise.resolve({
        data: {
          data: [
            {
              edi_id: "1",
              edi_identificador: "ED-001",
              edi_descripcion: "Edificio Central",
              ava_propiedad: [],
            },
          ],
        },
      });
    } else if (url.includes("/api/propertytypes")) {
      return Promise.resolve({
        data: {
          data: [
            { tip_id: "1", tip_nombre: "Apartamento" },
            { tip_id: "2", tip_nombre: "Local Comercial" },
          ],
        },
      });
    }
    return Promise.resolve({ data: { data: [] } });
  }),
}));

jest.mock("js-cookie", () => ({
  get: () => "fake-token",
}));

jest.mock("@/components/breadcrumbResponsive", () => ({
  __esModule: true,
  BreadcrumbResponsive: () => <div>Breadcrumb</div>,
}));

jest.mock("@/components/modeToggle", () => ({
  __esModule: true,
  ModeToggle: () => <div>ModeToggle</div>,
}));

jest.mock("@/components/mantBuild/buildFormProps", () => ({
  __esModule: true,
  default: () => <div>Formulario Edificio</div>,
}));

jest.mock("@/components/mantBuild/mantProperty/propertyFormProps", () => ({
  __esModule: true,
  default: () => <div>Formulario Propiedad</div>,
}));

jest.mock("@/components/dataTable/manageActions", () => ({
  __esModule: true,
  default: ({ FormComponent }: { FormComponent: React.ReactNode }) => (
    <div>{FormComponent}</div>
  ),
}));

jest.mock("@/components/dataTable/data-table", () => ({
  __esModule: true,
  DataTable: ({ data }: { data: AvaEdificio[] }) => (
    <div>
      <p>Tabla de Edificios</p>
      {data.length > 0 && <p>Edificio: {data[0].edi_identificador}</p>}
    </div>
  ),
}));

jest.mock("@/lib/zustand/buildStore", () => {
  const actual = jest.requireActual("zustand");
  return {
    __esModule: true,
    default: actual.create(() => ({
      buildings: [
        {
          edi_id: "1",
          edi_identificador: "ED-001",
          edi_descripcion: "Edificio Central",
          ava_propiedad: [],
        },
      ],
      setBuildings: jest.fn(),
      addBuilding: jest.fn(),
      updateBuilding: jest.fn(),
      removeBuilding: jest.fn(),
      addProperty: jest.fn(),
      updateProperty: jest.fn(),
      removeProperty: jest.fn(),
    })),
  };
});

jest.mock("@/lib/zustand/typeStore", () => {
  const actual = jest.requireActual("zustand");
  return {
    __esModule: true,
    default: actual.create(() => ({
      types: [],
      fetchTypes: jest.fn(),
      setTypes: jest.fn(),
    })),
  };
});

describe("BodyMantBuild", () => {
  it("muestra título y tabla al cargar edificios", async () => {
    render(<BodyMantBuild />);

    expect(
      screen.getByRole("heading", { name: /Gestión de Edificios/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Tabla de Edificios/i)).toBeInTheDocument();
      expect(screen.getByText(/Edificio: ED-001/i)).toBeInTheDocument();
    });
  });

  it("muestra botón de nuevo edificio y tabs al seleccionar", async () => {
    render(<BodyMantBuild />);

    await waitFor(() => {
      expect(screen.getByText("Formulario Edificio")).toBeInTheDocument();
    });
  });
});
