"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/dataTable/data-table";
import { columnsClient } from "@/components/mantClient/columnsClient";
import ManageActions from "@/components/dataTable/manageActions";
import ClienteForm from "@/components/mantClient/clienteFormProps";
import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbResponsive } from "../breadcrumbResponsive";
import { ExportButton } from "./exportButton";
import { ImportClients } from "./importClients";
import useClientStore from "@/lib/zustand/clientStore";

const BodyMantClient: React.FC = () => {
  const { clients, setClients } = useClientStore((state) => ({
    clients: state.clients,
    setClients: state.setClients,
  }));
  const [isLoading, setIsLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const token = cookie.get("token");
      if (!token) return;
      const response = await axios.get("/api/client", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data.data);
    } catch (err) {
      console.error("Error al buscar clientes:", err);
      toast.error("No se pudo cargar la lista de clientes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="mx-auto p-4 space-y-8 max-w-7xl">
      {isLoading ? (
        <>
          {/* Skeletons */}
          <div className="space-y-4 mb-3">
            <div className="h-4 w-40 sm:w-56 rounded-md bg-muted animate-pulse" />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-8">
              <div className="w-60 h-8 rounded-md bg-muted animate-pulse" />
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
            <CardHeader>
              <BreadcrumbResponsive
                items={[
                  { label: "Inicio", href: "/homePage" },
                  { label: "Gestión de clientes" },
                ]}
              />
              <CardTitle className="text-2xl font-bold text-primary mb-4 sm:mb-0">
                Gestión de Clientes
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap justify-center gap-2 p-4">
              {/* Nuevo cliente */}
              <ManageActions
                variant="default"
                titleButton="Nuevo Cliente"
                icon={<Plus className="mr-2 h-4 w-4" />}
                title="Nuevo Cliente"
                description="Ingresa un nuevo cliente"
                open={openNew}
                onOpenChange={setOpenNew}
                FormComponent={
                  <ClienteForm
                    action="create"
                    onSuccess={() => {
                      setOpenNew(false);
                    }}
                  />
                }
              />

              {/* Exportar */}
              <ExportButton />

              {/* Descargar plantilla */}
              {/* <Button variant="outline">Descargar Plantilla</Button> */}

              {/* Importar y refrescar */}
              <ImportClients onSuccess={fetchClients} />

            </div>
          </Card>

          {/* Tabla de clientes */}
          <Card>
            <CardContent>
              <DataTable columns={columnsClient} data={clients} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BodyMantClient;
