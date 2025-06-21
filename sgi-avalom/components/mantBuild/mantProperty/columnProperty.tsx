"use client";
import { useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
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
import PropertyManager from "./propertyManager";
import ManageActions from "@/components/dataTable/manageActions";
import useBuildingStore from "@/lib/zustand/buildStore";
import useTypeStore from "@/lib/zustand/typeStore";
import { AvaPropiedad } from "@/lib/types";
import DateRangeDialog from "@/components/DateRangeDialog";

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
          <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
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
        <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
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
      const [dropdownOpen, setDropdownOpen] = useState(false);
      const [openEdit, setOpenEdit] = useState(false);
      const [openDateDialog, setOpenDateDialog] = useState(false);

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
              description: `La propiedad ${property.prop_identificador} ha sido borrada.`,
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
        <>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir Menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-center">
                Acciones
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <ManageActions
                  open={openEdit}
                  onOpenChange={setOpenEdit}
                  titleButton={"Editar Propiedad"}
                  title={"Editar Propiedad"}
                  description={"Editar la Propiedad seleccionada"}
                  variant={"ghost"}
                  classn={"p-4 m-0 h-8 w-full"}
                  FormComponent={
                    <PropertyManager
                      propertyId={property.prop_id}
                      onSuccess={() => {
                        setOpenEdit(false);
                        setDropdownOpen(false);
                      }}
                    />
                  }
                />
              </DropdownMenuItem>

              <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
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
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setOpenDateDialog(true)}
                className="p-4 m-0 h-8 w-full"
              >
                Generar Reporte
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DateRangeDialog
            open={openDateDialog}
            onOpenChange={setOpenDateDialog}
            onGenerate={async (from, to) => {
              try {
                const token = cookie.get("token");
                const response = await axios.get(
                  `/api/propertytypes/report/${property.prop_id}?from=${from}&to=${to}`,
                  {
                    responseType: "blob",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                const url = window.URL.createObjectURL(
                  new Blob([response.data])
                );
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute(
                  "download",
                  `reporte_propiedad_${property.prop_id}_rango.pdf`
                );
                document.body.appendChild(link);
                link.click();
                link.remove();
                setOpenDateDialog(false);
              } catch (error) {
                toast.error("Error al generar el reporte por rango");
                console.error(error);
              }
            }}
          />
        </>
      );
    },
  },
];
