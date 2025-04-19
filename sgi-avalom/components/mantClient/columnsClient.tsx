"use client";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import useClientStore from "@/lib/zustand/clientStore";
import { Cliente } from "@/lib/types";
import ClientAlertDialog from "@/components/alertDialog";
import ClienteForm from "@/components/mantClient/clienteFormProps";
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
import { toast } from "sonner";

export const columnsClient: ColumnDef<Cliente>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "cli_nombre",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "cli_papellido",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Apellido
          <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "cli_cedula",
    header: "Cedula",
  },
  {
    accessorKey: "cli_correo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Correo
          <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const cliente = row.original;
      const { removeClient } = useClientStore((state) => ({
        removeClient: state.removeClient,
      }));

      const handleAction = async () => {
        try {
          const token = cookie.get("token");
          if (!token) {
            throw new Error("No hay token disponible");
          }

          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          const response = await axios.delete(`/api/client/${cliente.cli_id}`, {
            headers,
          });

          if (response?.data?.success) {
            removeClient(cliente.cli_id);
            toast.success("Cliente eliminado", {
              description: `El cliente ${cliente.cli_nombre} fue eliminado correctamente.`,
            });
          }
        } catch (error: any) {
          toast.error("Error", {
            description: error.message || "No se pudo eliminar el cliente.",
          });
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
                navigator.clipboard.writeText(cliente.cli_id.toString());
              }}
            >
              Copiar ID cliente
            </DropdownMenuItem>
            <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <ManageActions
                title={"Ver cliente"}
                titleButton={"Ver Cliente"}
                description={"Visualiza los datos del cliente"}
                classn={"p-4 m-0 h-8 w-full"}
                variant={"ghost"}
                FormComponent={
                  <ClienteForm
                    entity={cliente}
                    action={"view"}
                    onSuccess={() => {}}
                  />
                }
              />
            </div>
            <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <ManageActions
                titleButton="Editar Cliente"
                title="Editar Cliente"
                description="Modifica la información del cliente"
                classn={"p-4 m-0 h-8 w-full"}
                variant={"ghost"}
                FormComponent={
                  <ClienteForm
                    entity={cliente}
                    action={"edit"}
                    onSuccess={() => {}}
                  />
                }
              />
            </div>
            <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <ClientAlertDialog
                title="Está seguro?"
                description="Esta acción no se puede deshacer. Esta seguro de que desea borrar este cliente?"
                triggerText="Borrar Cliente"
                cancelText="Cancelar"
                actionText="Continuar"
                classn={"p-4 m-0 h-8 w-full"}
                variant={"ghost"}
                onAction={handleAction}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
