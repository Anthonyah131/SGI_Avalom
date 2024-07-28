"use client";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import useBuildingStore from "@/lib/zustand/buildStore";
import { AvaEdificio } from "@/lib/types";
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

export const columns: ColumnDef<AvaEdificio>[] = [
  {
    accessorKey: "edi_identificador",
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
    accessorKey: "edi_descripcion",
    header: "Descripción",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const building = row.original;
      const { removeBuilding } = useBuildingStore();

      const handleAction = async () => {
        try {
          // const token = cookie.get("token");
          // if (!token) {
          //   console.error("No hay token disponible");
          //   return;
          // }

          // const headers = {
          //   Authorization: `Bearer ${token}`,
          //   "Content-Type": "application/json",
          // };

          // const response = await axios.delete(`/api/building/${building.edi_id}`, {
          //   headers,
          // });
          // if (response.data) {
          // removeBuilding(building.edi_id);
          // }
          removeBuilding(building.edi_id);
        } catch (error) {
          console.error("Error al borrar Edificio:", error);
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
                navigator.clipboard.writeText(building.edi_id.toString());
              }}
            >
              Copiar ID Edificio
            </DropdownMenuItem>
            <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <AlertDialog
                title="Está seguro?"
                description="Esta acción no se puede deshacer. Está seguro de que desea borrar este Edificio?"
                triggerText="Borrar Edificio"
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
