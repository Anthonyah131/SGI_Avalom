"use client";

import React, { useEffect, useState } from "react";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PencilIcon, TrashIcon } from "lucide-react";
import MonthlyRentForm from "./monthlyRentForm";
import { toast } from "sonner";
import ManageActions from "@/components/dataTable/manageActions";
import { convertToCostaRicaTime } from "@/utils/dateUtils";
import axios from "axios";
import cookie from "js-cookie";

interface MonthsBetweenProps {
  mode: "view" | "create";
}

const MonthsBetween: React.FC<MonthsBetweenProps> = ({ mode }) => {
  const { monthlyRents, deleteRent, createMonthlyRents } = useRentalStore();

  const [rents, setRents] = useState(
    mode === "create" ? createMonthlyRents : monthlyRents
  );

  useEffect(() => {
    setRents(mode === "create" ? createMonthlyRents : monthlyRents);
  }, [createMonthlyRents, monthlyRents, mode]);

  const handleDelete = async (alqm_id: string) => {
    if (mode === "create") {
      const { success } = deleteRent("createMonthlyRents", alqm_id);
      if (success) {
        toast.success("Alquiler mensual eliminado localmente.");
      } else {
        toast.error("Error al eliminar alquiler mensual localmente.");
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
          toast.success("Alquiler mensual eliminado correctamente.");
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
              onSuccess={() => {}}
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

            return (
              <Card key={rent.alqm_id} className="relative">
                <div className="absolute text-primary top-2 left-2 z-10">
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-block">
                          <ManageActions
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
                                onSuccess={() => {}}
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
                          <Button
                            variant="ghost"
                            onClick={() => handleDelete(rent.alqm_id)}
                            className="p-1"
                            disabled={hasPayments}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
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
                    <strong>Inicio:</strong>{" "}
                    {convertToCostaRicaTime(rent.alqm_fechainicio)}
                  </p>
                  <p>
                    <strong>Fin:</strong>{" "}
                    {convertToCostaRicaTime(rent.alqm_fechafin)}
                  </p>
                  <p>
                    <strong>Total:</strong> ₡{rent.alqm_montototal}
                  </p>
                  <p>
                    <strong>Estado:</strong> {rent.alqm_estado}
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
