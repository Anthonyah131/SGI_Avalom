import React from "react";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PencilIcon, TrashIcon } from "lucide-react";
import MonthlyRentForm from "./monthlyRentForm";
import { toast } from "sonner";
import ManageActions from "@/components/dataTable/manageActions";
import { convertToCostaRicaTime } from "@/utils/dateUtils";

const MonthsBetween: React.FC = () => {
  const { monthlyRents, deleteMonthlyRent } = useRentalStore();

  const handleDelete = (alqm_id: string) => {
    const { success, message } = deleteMonthlyRent(alqm_id);

    if (success) {
      toast.success("Éxito", { description: message });
    } else {
      toast.error("Error", { description: message });
    }
  };

  return (
    <>
      <ManageActions
        titleButton="Crear Alquiler Mensual"
        title="Crear Alquiler Mensual"
        description="Ingrese los datos del alquiler mensual."
        variant="default"
        classn="ml-4 mb-4"
        icon={<PencilIcon className="h-4 w-4" />}
        FormComponent={
          <MonthlyRentForm action="create" alqmId={null} onSuccess={() => {}} />
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {monthlyRents.map((rent) => (
          <Card key={rent.alqm_id} className="bg-background relative">
            <div className="absolute top-2 left-2 z-10">
              <ManageActions
                titleButton=""
                title="Editar Alquiler Mensual"
                description="Modifique los datos del alquiler mensual."
                variant="ghost"
                classn="p-1"
                icon={<PencilIcon className="h-4 w-4" />}
                FormComponent={
                  <MonthlyRentForm
                    action="edit"
                    alqmId={rent.alqm_id}
                    onSuccess={() => {}}
                  />
                }
              />
            </div>
            <div className="absolute top-2 right-2 z-10">
              <Button
                variant="ghost"
                onClick={() => handleDelete(rent.alqm_id)}
                className="p-1"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-semibold truncate mt-6">
                {rent.alqm_identificador}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default MonthsBetween;
