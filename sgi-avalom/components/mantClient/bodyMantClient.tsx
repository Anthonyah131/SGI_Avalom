"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/dataTable/data-table";
import { columnsClient } from "@/components/mantClient/columnsClient";
import { ModeToggle } from "@/components/modeToggle";
import axios from "axios";
import { useEffect, useState } from "react";
import useClientStore from "@/lib/zustand/clientStore";
import ManageActions from "@/components/dataTable/manageActions";
import { Plus } from "lucide-react";
import cookie from "js-cookie";
import ClienteForm from "@/components/mantClient/clienteFormProps";
import { Cliente } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const BodyMantClient: React.FC = () => {
  const { clients, setClients } = useClientStore((state) => ({
    clients: state.clients,
    setClients: state.setClients,
    addClient: state.addClient,
  }));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      try {
        const response = await axios.get("/api/client", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setClients(response.data.data);
      } catch (error) {
        console.error("Error al buscar clientes: " + error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [setClients]);

  return (
    <div className="mx-auto p-4 space-y-8">
      <Card className="bg-background flex flex-col sm:flex-row justify-between items-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">
            Gestión de Clientes
          </CardTitle>
        </CardHeader>
        <div className="flex flex-wrap justify-center gap-2 p-4">
          <ManageActions<Cliente>
            variant="default"
            titleButton={"Nuevo Cliente"}
            icon={<Plus className="mr-2 h-4 w-4" />}
            title={"Nuevo Cliente"}
            description={"Ingresa un nuevo cliente"}
            action={"create"}
            FormComponent={ClienteForm}
          />
          <Button variant="outline">Exportar Clientes</Button>
          <Button variant="outline">Descargar Plantilla</Button>
          <Button variant="outline">Importar</Button>
          <ModeToggle />
        </div>
      </Card>
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-8 m-10"
                >
                  <Skeleton className="w-full sm:w-[200px] h-[20px] rounded-full" />
                  <Skeleton className="w-full sm:w-[100px] h-[20px] rounded-full" />
                  <Skeleton className="w-full sm:w-[150px] h-[20px] rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <DataTable columns={columnsClient} data={clients} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyMantClient;
