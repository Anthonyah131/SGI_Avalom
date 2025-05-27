"use client";

import { useEffect, useState } from "react";
import cookie from "js-cookie";
import axios from "axios";
import { Plus } from "lucide-react";
import { ModeToggle } from "@/components/modeToggle";
import { columns } from "./columnsUser";
import { DataTable } from "@/components/dataTable/data-table";
import ManageActions from "@/components/dataTable/manageActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { ExportUsers } from "./exportUsers";
import UserForm from "./UserFormProps";
import useUserStore from "@/lib/zustand/userStore";

const BodyMantUser: React.FC = () => {
  const { users, setUsers } = useUserStore((state) => ({
    users: state.users,
    setUsers: state.setUsers,
  }));
  const [isLoading, setIsLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    const token = cookie.get("token");
    if (!token) {
      console.error("No hay token disponible");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="mx-auto p-4 space-y-8">
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
                  { label: "Gestión de usuarios" },
                ]}
              />
              <CardTitle className="text-2xl font-bold text-primary mb-4 sm:mb-0">
                Gestión de Usuarios
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap justify-center gap-2 p-4">
              {/* Nuevo Usuario */}
              <ManageActions
                open={openNew}
                onOpenChange={setOpenNew}
                variant="default"
                titleButton="Nuevo Usuario"
                icon={<Plus className="mr-2 h-4 w-4" />}
                title="Nuevo Usuario"
                description="Ingresa un nuevo usuario"
                FormComponent={
                  <UserForm
                    action="create"
                    onSuccess={() => {
                      setOpenNew(false);
                    }}
                  />
                }
              />

              {/* Exportar, importar y toggle */}
              <ExportUsers />
              {/* <Button variant="outline">Descargar Plantilla</Button> */}
              <Button variant="outline">Importar</Button>
              <ModeToggle />
            </div>
          </Card>

          <Card>
            <CardContent>
              <DataTable columns={columns} data={users} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BodyMantUser;
