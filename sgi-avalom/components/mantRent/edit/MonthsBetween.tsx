"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { PencilIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MonthlyRentForm from "./monthlyRentForm";
import ManageActions from "@/components/dataTable/manageActions";
import { formatToCR } from "@/utils/dateUtils";
import useRentalStore from "@/lib/zustand/useRentalStore";
import AlertDialog from "@/components/alertDialog";

interface MonthsBetweenProps {
  mode: "view" | "create";
}

const MonthsBetween: React.FC<MonthsBetweenProps> = ({ mode }) => {
  const { monthlyRents, deleteRent, createMonthlyRents } = useRentalStore();
  const [openNew, setOpenNew] = useState(false);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [rents, setRents] = useState(
    mode === "create" ? createMonthlyRents : monthlyRents
  );

  useEffect(() => {
    setRents(mode === "create" ? createMonthlyRents : monthlyRents);
  }, [createMonthlyRents, monthlyRents, mode]);

  const handleDelete = async (alqm_id: string, alqm_identificador: string) => {
    if (mode === "create") {
      const { success } = deleteRent("createMonthlyRents", alqm_id);
      if (success) {
        toast.success(
          `Alquiler mensual ${alqm_identificador} eliminado correctamente.`
        );
      } else {
        toast.error(
          `Error al eliminar el alquiler mensual ${alqm_identificador}.`
        );
      }
    } else {
      try {
        const token = cookie.get("token");
        if (!token) throw new Error("Token no disponible");

        const response = await axios.delete(`/api/monthlyrent/${alqm_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response?.data?.success) {
          deleteRent("monthlyRents", alqm_id);
          toast.success(
            `Alquiler mensual ${alqm_identificador} eliminado correctamente.`
          );
        } else {
          throw new Error(response?.data?.error || "Error al eliminar.");
        }
      } catch (error: any) {
        toast.error(error.message || "Error al eliminar el alquiler mensual.");
      }
    }
  };

  return (
    <>
      {mode === "view" && (
        <ManageActions
          open={openNew}
          onOpenChange={setOpenNew}
          titleButton="Crear Alquiler Mensual"
          title="Crear Alquiler Mensual"
          description="Ingrese los datos del alquiler mensual."
          variant="default"
          classn="ml-4 mb-4"
          icon={<PencilIcon className="h-4 w-4" />}
          FormComponent={
            <MonthlyRentForm
              action="create"
              alqmId={null}
              mode={mode}
              onSuccess={() => {
                setOpenNew(false);
              }}
            />
          }
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {rents
          .sort(
            (a, b) =>
              new Date(a.alqm_fechainicio).getTime() -
              new Date(b.alqm_fechainicio).getTime()
          )
          .map((rent) => {
            const hasPayments = rent.ava_pago && rent.ava_pago.length > 0;
            const isThisOpen = openEditId === rent.alqm_id;

            return (
              <Card key={rent.alqm_id} className="relative">
                <div className="absolute text-primary top-2 left-2 z-10">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-block">
                          <ManageActions
                            open={isThisOpen}
                            onOpenChange={(open) =>
                              setOpenEditId(open ? rent.alqm_id : null)
                            }
                            titleButton=""
                            title="Editar Alquiler Mensual"
                            description="Modifique los datos del alquiler mensual."
                            variant="ghost"
                            classn={`p-1 ${
                              hasPayments ? "pointer-events-none" : ""
                            }`}
                            disabled={hasPayments}
                            icon={<PencilIcon className="h-4 w-4" />}
                            FormComponent={
                              <MonthlyRentForm
                                action="edit"
                                alqmId={rent.alqm_id}
                                mode={mode}
                                onSuccess={() => setOpenEditId(null)}
                              />
                            }
                          />
                        </div>
                      </TooltipTrigger>
                      {hasPayments && (
                        <TooltipContent
                          side="right"
                          sideOffset={6}
                          className="z-[999] text-xs max-w-[180px] text-left"
                        >
                          No se puede editar: tiene pagos registrados.
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="absolute text-destructive top-2 right-2 z-10">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-block">
                          <AlertDialog
                            title="¿Estás seguro?"
                            description="Esta acción no se puede deshacer."
                            cancelText="Cancelar"
                            actionText="Continuar"
                            classn="p-4 m-0 h-8 w-full"
                            variant="ghost"
                            onAction={() =>
                              handleDelete(
                                rent.alqm_id,
                                rent.alqm_identificador
                              )
                            }
                            icon={<TrashIcon className="h-4 w-4" />}
                            triggerText=""
                            disabled={hasPayments}
                          />
                        </div>
                      </TooltipTrigger>
                      {hasPayments && (
                        <TooltipContent
                          side="left"
                          sideOffset={6}
                          className="z-[999] text-xs max-w-[180px] text-left"
                        >
                          No se puede eliminar: tiene pagos registrados.
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <CardHeader>
                  <CardTitle className="text-base text-primary font-semibold truncate mt-6">
                    {rent.alqm_identificador}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>
                    <strong>Inicio:</strong> {formatToCR(rent.alqm_fechainicio)}
                  </p>
                  <p>
                    <strong>Fin:</strong> {formatToCR(rent.alqm_fechafin)}
                  </p>
                  <p>
                    <strong>Total:</strong>{" "}
                    {Number(rent.alqm_montototal).toLocaleString("es-CR", {
                      style: "currency",
                      currency: "CRC",
                    })}
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    {rent.alqm_estado === "P"
                      ? "Pagado"
                      : rent.alqm_estado === "A"
                      ? "Atrasado"
                      : rent.alqm_estado === "I"
                      ? "Incompleto"
                      : rent.alqm_estado === "R"
                      ? "Cortesía"
                      : rent.alqm_estado}
                  </p>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </>
  );
};

export default MonthsBetween;
