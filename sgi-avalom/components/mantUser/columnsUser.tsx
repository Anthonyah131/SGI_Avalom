"use client";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import useUserStore from "@/lib/zustand/userStore";
import { User } from "@/lib/types";
import AlertDialog from "@/components/alertDialog";
import UserForm from "@/components/mantUser/UserFormProps";
import ManageActions from "@/components/dataTable/manageActions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/UserContext";
import { useToast } from "@/hooks/use-toast";

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
      const { toast } = useToast();
      const { removeUser } = useUserStore((state) => ({
        removeUser: state.removeUser,
      }));

      const { user: currentUser } = useUser();

      const canEdit =
        (currentUser?.usu_rol === "A" &&
          ["A", "E", "R"].includes(user.usu_rol)) ||
        (currentUser?.usu_rol === "J" &&
          ["A", "J", "E", "R"].includes(user.usu_rol)) ||
        (currentUser?.usu_rol === "E" && ["E", "R"].includes(user.usu_rol));

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

          const response = await axios.delete(`/api/users/${user.usu_id}`, {
            headers,
          });
          if (response?.data?.success) {
            removeUser(user.usu_id);
            toast({
              title: "Usuario eliminado",
              description: `El usuario ${user.usu_nombre} fue eliminado correctamente.`,
              typet: "success",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "No se pudo eliminar el usuario.",
            typet: "error",
          });
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
              onClick={() => {
                navigator.clipboard.writeText(user.usu_id.toString());
              }}
            >
              Copiar ID usuario
            </DropdownMenuItem>
            {canEdit && (
              <>
                <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  <ManageActions<User>
                    title={"Ver usuario"}
                    titleButton="Ver Usuario"
                    description={"Visualiza los datos del usuario"}
                    action={"view"}
                    classn={"p-4 m-0 h-8 w-full"}
                    variant={"ghost"}
                    entity={user}
                    FormComponent={UserForm}
                  />
                </div>
                <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  <ManageActions<User>
                    title={"Editar Usuario"}
                    titleButton="Editar Usuario"
                    description={"Edita los datos del usuario"}
                    action={"edit"}
                    classn={"p-4 m-0 h-8 w-full"}
                    variant={"ghost"}
                    entity={user}
                    FormComponent={UserForm}
                  />
                </div>
                <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  <AlertDialog
                    title="Está seguro?"
                    description="Esta acción no se puede deshacer. Está seguro de que desea borrar este usuario?"
                    triggerText="Borrar Usuario"
                    cancelText="Cancelar"
                    actionText="Continuar"
                    classn={"p-4 m-0 h-8 w-full"}
                    variant={"ghost"}
                    onAction={handleAction}
                  />
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
