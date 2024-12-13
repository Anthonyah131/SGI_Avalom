"use client";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import useBuildingStore from "@/lib/zustand/buildStore";
import useTypeStore from "@/lib/zustand/typeStore";
import { AvaPropiedad } from "@/lib/types";
import AlertDialog from "@/components/alertDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ManageActionsProperty from "./manageActionProperty";
import { toast } from "sonner";

export const columnsProperty: ColumnDef<AvaPropiedad>[] = [
  {
    accessorKey: "prop_identificador",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Identificador
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "prop_descripcion",
    header: "Descripción",
  },
  {
    accessorKey: "tipp_id",
    header: ({ column }) => (
      <Button
        variant="table"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tipo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const { types } = useTypeStore();
      const type = types.find((type) => type.tipp_id === row.original.tipp_id);
      return <span>{type ? type.tipp_nombre : "Desconocido"}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const property = row.original;
      const { removeProperty } = useBuildingStore();

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

          const response = await axios.delete(
            `/api/property/${property.prop_id}`,
            { headers }
          );
          if (response?.data?.success) {
            removeProperty(property.edi_id || "0", property.prop_id);
            toast.success("Propiedad eliminada", {
              description: `La propiedad ${property.prop_identificador} ha sido borrado.`,
            });
          }
        } catch (error: any) {
          toast.error("Error", {
            description: "Error al borrar la propiedad",
          });
          console.error("Error al borrar la propiedad:", error);
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
                navigator.clipboard.writeText(property.prop_id.toString());
              }}
            >
              Copiar ID Propiedad
            </DropdownMenuItem>
            <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <ManageActionsProperty<AvaPropiedad>
                title={"Editar Propiedad"}
                titleButton="Editar Propiedad"
                description={"Edita los datos de la propiedad"}
                classn={"p-4 m-0 h-8 w-full"}
                variant={"ghost"}
                propId={property.prop_id}
              />
            </div>
            <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <AlertDialog
                title="Está seguro?"
                description="Esta acción no se puede deshacer. Está seguro de que desea borrar esta Propiedad?"
                triggerText="Borrar Propiedad"
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
