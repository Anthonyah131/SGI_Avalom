"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";
// import UserAlertDialog from "./userAlertDialog";
// import ManageUserActions from "./manageUserActions";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import axios from "axios";
import cookie from "js-cookie";
// import useUserStore from "@/lib/userStore";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "usu_nombre",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "usu_papellido",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Primer Apellido
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "usu_cedula",
    header: "Cédula",
  },
  {
    accessorKey: "usu_correo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Correo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "usu_estado",
    header: "Estado",
  },
  {
    accessorKey: "usu_rol",
    header: "Rol",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
    //   const { removeUser } = useUserStore((state) => ({
    //     removeUser: state.removeUser,
    //   }));

      const handleAction = async () => {
        try {
          const token = cookie.get("token");
          if (!token) {
            console.error("No hay token disponible");
            return;
          }

          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          const response = await axios.delete(`/api/user/${user.usu_id}`, {
            headers,
          });
          if (response.data) {
            // removeUser(user.usu_id);
          }
        } catch (error) {
          console.error("Error al borrar usuario:", error);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir Menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(event) => {
                navigator.clipboard.writeText(user.usu_id.toString());
              }}
            >
              Copiar ID usuario
            </DropdownMenuItem>
            {/* <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <ManageUserActions
                title={"Ver usuario"}
                titleButtom="Ver Usuario"
                description={"Visualiza los datos del usuario"}
                action={"view"}
                classn={"p-4 m-0 h-8 w-full"}
                variant={"ghost"}
                user={user}
              />
            </div>
            <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <ManageUserActions
                title={"Editar Usuario"}
                titleButtom="Editar Usuario"
                description={"Edita los datos del usuario"}
                action={"edit"}
                classn={"p-4 m-0 h-8 w-full"}
                variant={"ghost"}
                user={user}
              />
            </div>
            <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <UserAlertDialog
                title="Está seguro?"
                description="Esta acción no se puede deshacer. Está seguro de que desea borrar este usuario?"
                triggerText="Borrar Usuario"
                cancelText="Cancelar"
                actionText="Continuar"
                classn={"p-4 m-0 h-8 w-full"}
                variant={"ghost"}
                onAction={handleAction}
              />
            </div> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
