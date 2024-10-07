"use client";
import { useEffect } from "react";
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

const BodyMantUser: React.FC = () => {
  const { users, setUsers } = useUserStore((state) => ({
    users: state.users,
    setUsers: state.setUsers,
    addUser: state.addUser,
  }));

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
        setUsers(response.data);
      } catch (error) {
        console.error("Error al buscar usuarios: " + error);
      }
    };

    fetchUsers();
  }, [setUsers]);

  return (
    <div className="mx-auto p-4 space-y-8">
      <Card className="bg-background flex flex-col sm:flex-row justify-between items-center">
        <CardHeader className="">
          <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">
            Gestión de Edificios
          </CardTitle>
        </CardHeader>
        <div className="flex flex-wrap justify-center gap-2 p-4">
          <ManageActions<User>
            variant="default"
            titleButton={"Nuevo Usuario"}
            icon={<Plus className="mr-2 h-4 w-4" />}
            title={"Nuevo Usuario"}
            description={"Ingresa un nuevo Usuario"}
            action={"create"}
            FormComponent={UserForm}
          />
          <Button variant="outline">Exportar Usuarios</Button>
          <Button variant="outline">Descargar Plantilla</Button>
          <Button variant="outline">Importar</Button>
          <ModeToggle />
        </div>
      </Card>
      <Card>
        <CardContent>
          <DataTable data={users} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyMantUser;
