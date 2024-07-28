"use client";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import useBuildingStore from "@/lib/zustand/buildStore";
import { AvaPropiedad } from "@/lib/types"; // Importa AvaProperty si lo defines
import AlertDialog from "@/components/alertDialog";
// import BuildForm from "./buildFormProps";
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

export const columnsProperty: ColumnDef<AvaPropiedad>[] = [
  {
    accessorKey: "prop_id",
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
    accessorKey:"ava_tipopropiedad.tipp_nombre",
    header: "Tipo",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const property = row.original;
      const { removeProperty } = useBuildingStore();

      const handleAction = async () => {
        try {
          removeProperty(property.edi_id ?? 0, property.prop_id);
        } catch (error) {
          console.error("Error al borrar propiedad:", error);
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
              {/* <ManageActions<AvaProperty>
                title={"Ver Propiedad"}
                titleButton="Ver Propiedad"
                description={"Visualiza los datos de la propiedad"}
                action={"view"}
                classn={"p-4 m-0 h-8 w-full"}
                variant={"ghost"}
                entity={property}
                FormComponent={BuildForm}
              /> */}
            </div>
            <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              {/* <ManageActions<AvaProperty>
                title={"Editar Propiedad"}
                titleButton="Editar Propiedad"
                description={"Edita los datos de la propiedad"}
                action={"edit"}
                classn={"p-4 m-0 h-8 w-full"}
                variant={"ghost"}
                entity={property}
                FormComponent={BuildForm}
              /> */}
            </div>
            <div className="h-8 relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <AlertDialog
                title="Está seguro?"
                description="Esta acción no se puede deshacer. Está seguro de que desea borrar esta propiedad?"
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