"use client";
import { useEffect, useState } from "react";
import cookie from "js-cookie";
import axios from "axios";
import { Plus } from "lucide-react";
import useUserStore from "@/lib/zustand/userStore";
import { User } from "@/lib/types";
import { ModeToggle } from "@/components/modeToggle";
import { columns } from "./columnsUser";
import { DataTable } from "@/components/dataTable/data-table";
import ManageActions from "@/components/dataTable/manageActions";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserForm from "./UserFormProps";
import { Skeleton } from "../ui/skeleton";
import { BreadcrumbResponsive } from "../breadcrumbResponsive";

const BodyMantUser: React.FC = () => {
  const { users, setUsers } = useUserStore((state) => ({
    users: state.users,
    setUsers: state.setUsers,
    addUser: state.addUser,
  }));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
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
        console.error("Error al buscar usuarios: " + error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [setUsers]);

  return (
    <div className="mx-auto p-4 space-y-8">
      <Card className="bg-background flex flex-col sm:flex-row justify-between items-center">
        <CardHeader className="">
          <BreadcrumbResponsive
            items={[
              { label: "Inicio", href: "/homePage" },
              { label: "Gesteión de usuarios" },
            ]}
          />
          <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">
            Gestión de Usuarios
          </CardTitle>
        </CardHeader>
        <div className="flex flex-wrap justify-center gap-2 p-4">
          <ManageActions
            variant="default"
            titleButton={"Nuevo Usuario"}
            icon={<Plus className="mr-2 h-4 w-4" />}
            title={"Nuevo Usuario"}
            description={"Ingresa un nuevo Usuario"}
            FormComponent={<UserForm action={"create"} onSuccess={() => {}} />}
          />
          <Button variant="outline">Exportar Usuarios</Button>
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
            <DataTable columns={columns} data={users} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyMantUser;
