"use client";
import { useEffect, useState } from "react";
import cookie from "js-cookie";
import axios from "axios";
import { Plus } from "lucide-react";
import useBuildingStore from "@/lib/zustand/buildStore";
import { AvaEdificio } from "@/lib/types";
import { ModeToggle } from "@/components/modeToggle";
import { columns } from "./columnBuild";
import { DataTable } from "@/components/dataTable/data-table";
import ManageActions from "@/components/dataTable/manageActions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BuildForm from "./buildFormProps";
import { columnsProperty } from "./columnProperty";
import PropertyManager from "./mantProperty/propertyManager";

const BodyMantBuild: React.FC = () => {
  const { setBuildings, buildings } = useBuildingStore();
  const [selectedBuilding, setSelectedBuilding] = useState<AvaEdificio | null>(
    null
  );

  useEffect(() => {
    const token = cookie.get("token");
    if (!token) {
      console.error("No hay token disponible");
      return;
    }
    const fetch = async () => {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.get("/api/building", { headers });
      if (response.data) {
        setBuildings(response.data);
      }
    };
    fetch();
  }, [setBuildings]);

  return (
    <div className="flex flex-col w-full space-y-10 md:flex-row md:space-y-0 md:space-x-10">
      <section className="p-4 md:px-5 md:py-10 mx-auto w-full flex flex-col space-y-10">
        <Card className="flex flex-col md:flex-row justify-between items-center w-full p-2">
          <h1 className="text-xl md:text-2xl font-bold">
            Gestión de Edificios
          </h1>
          <div className="flex flex-wrap justify-center md:justify-end">
            <ManageActions<AvaEdificio>
              variant={"nuevo"}
              titleButton={"Nuevo Edificio"}
              icon={<Plus />}
              title={"Nuevo Edificio"}
              description={"Ingresa un nuevo Edificio"}
              action={"create"}
              classn={"m-2"}
              FormComponent={BuildForm}
            />
            <Button className="m-2">Exportar Edificios</Button>
            <Button className="m-2">Descargar Plantilla</Button>
            <Button className="m-2">Importar</Button>
            <ModeToggle />
          </div>
        </Card>
        <div className="flex flex-col md:flex-row space-y-10 md:space-y-0 md:space-x-10">
          <Card className="flex-1">
            <CardContent>
              <DataTable
                data={buildings}
                columns={columns}
                onRowClick={(building: AvaEdificio) =>
                  setSelectedBuilding(building)
                }
              />
            </CardContent>
          </Card>
          {selectedBuilding && (
            <div className="flex-1">
              <Card>
                <CardContent>
                  <BuildForm
                    building={selectedBuilding}
                    action={"edit"}
                    onSuccess={() => {}}
                  />
                  <DataTable
                    columns={columnsProperty}
                    data={selectedBuilding.ava_propiedad || []}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        {/* <PropertyManager propertyId={1}></PropertyManager> */}
      </section>
    </div>
  );
};

export default BodyMantBuild;
