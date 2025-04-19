"use client";

import { useEffect, useState } from "react";
import cookie from "js-cookie";
import axios from "axios";
import { Plus } from "lucide-react";
import useBuildingStore from "@/lib/zustand/buildStore";
import useTypeStore from "@/lib/zustand/typeStore";
import { AvaEdificio } from "@/lib/types";
import { ModeToggle } from "@/components/modeToggle";
import { columns } from "./columnBuild";
import { DataTable } from "@/components/dataTable/data-table";
import ManageActions from "@/components/dataTable/manageActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BuildForm from "./buildFormProps";
import { columnsProperty } from "./mantProperty/columnProperty";
import PropertyForm from "./mantProperty/propertyFormProps";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreadcrumbResponsive } from "../breadcrumbResponsive";
import { Skeleton } from "../ui/skeleton";

const BodyMantBuild: React.FC = () => {
  const { setBuildings, buildings } = useBuildingStore();
  const { fetchTypes, types } = useTypeStore();
  const [selectedBuilding, setSelectedBuilding] = useState<AvaEdificio | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBuildings = async () => {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        const response = await axios.get("/api/building", { headers });
        if (response.data.data) {
          setBuildings(response.data.data);
        }
      } catch (error) {
        console.error("Error al buscar usuarios: " + error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuildings();
  }, [setBuildings]);

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      if (types.length === 0) {
        await fetchTypes();
      }
    };
    fetchPropertyTypes();
  }, [fetchTypes, types]);

  useEffect(() => {
    if (
      selectedBuilding &&
      !buildings.some((b) => b.edi_id === selectedBuilding.edi_id)
    ) {
      setSelectedBuilding(null);
    }
  }, [buildings, selectedBuilding]);

  useEffect(() => {
    const building = buildings.find(
      (b) => b.edi_id === selectedBuilding?.edi_id
    );
    if (building) {
      setSelectedBuilding(building);
    }
  }, [buildings, selectedBuilding?.edi_id]);

  return (
    <div className="mx-auto p-4 space-y-8">
      {isLoading ? (
        <>
          <div className="space-y-4 mb-3">
            <div className="h-4 w-40 sm:w-56 rounded-md bg-muted animate-pulse" />{" "}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-8">
              <div className="w-60 h-8 rounded-md bg-muted animate-pulse" />{" "}
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 w-[120px] rounded-md bg-muted animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-8 m-10"
              >
                <Skeleton className="w-full sm:w-[200px] h-[30px] rounded-full" />
                <Skeleton className="w-full sm:w-[100px] h-[30px] rounded-full" />
                <Skeleton className="w-full sm:w-[150px] h-[30px] rounded-full" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <Card className="flex flex-col sm:flex-row justify-between items-center">
            <CardHeader className="">
              <BreadcrumbResponsive
                items={[
                  { label: "Inicio", href: "/homePage" },
                  { label: "Gestión de edificios" },
                ]}
              />
              <CardTitle className="text-2xl text-primary font-bold mb-4 sm:mb-0">
                Gestión de Edificios
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap justify-center gap-2 p-4">
              <ManageActions
                variant="default"
                titleButton="Nuevo Edificio"
                icon={<Plus className="mr-2 h-4 w-4" />}
                title="Nuevo Edificio"
                description="Ingresa un nuevo Edificio"
                FormComponent={
                  <BuildForm action={"create"} onSuccess={() => {}} />
                }
              />
              <Button variant="outline">Exportar Edificios</Button>
              <Button variant="outline">Descargar Plantilla</Button>
              <Button variant="outline">Importar</Button>
              <ModeToggle />
            </div>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary font-semibold">
                  Edificios
                </CardTitle>
                <CardDescription>
                  Listado de edificios registrados. Haz clic en un edificio para
                  ver más detalles.
                </CardDescription>
              </CardHeader>
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary font-semibold">
                    Detalles del Edificio
                  </CardTitle>
                  <CardDescription>
                    Información y propiedades del edificio seleccionado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="info">Información</TabsTrigger>
                      <TabsTrigger value="properties">Propiedades</TabsTrigger>
                    </TabsList>
                    <div className="mt-4">
                      <TabsContent value="info" className="mt-0">
                        <BuildForm
                          building={selectedBuilding ?? undefined}
                          action="edit"
                          onSuccess={() => {}}
                        />
                      </TabsContent>
                      <TabsContent value="properties" className="mt-0">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-xl text-primary font-semibold">
                              Propiedades
                            </CardTitle>
                            <CardDescription>
                              Listado de propiedades del edificio seleccionado.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ManageActions
                              variant="default"
                              titleButton="Nueva propiedad"
                              icon={<Plus className="mr-2 h-4 w-4" />}
                              title="Nueva Propiedad"
                              description="Ingresa una nueva propiedad"
                              FormComponent={
                                <PropertyForm
                                  action={"create"}
                                  onSuccess={() => {}}
                                  entity={selectedBuilding?.edi_id}
                                />
                              }
                            />
                            <div className="overflow-x-auto">
                              <DataTable
                                columns={columnsProperty}
                                data={selectedBuilding?.ava_propiedad || []}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BodyMantBuild;
