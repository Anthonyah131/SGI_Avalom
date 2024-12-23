"use client";

import { useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addMonths, format } from "date-fns";
import { toDate, toZonedTime } from "date-fns-tz";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { AvaAlquilerMensual } from "@/lib/types";
import { toast } from "sonner";
import { convertToCostaRicaTime, convertToUTC } from "@/utils/dateUtils";
import { FORMERR } from "dns";

const monthlyRentSchema = z.object({
  alqm_identificador: z.string().min(1, { message: "Identificador requerido" }),
  alqm_montototal: z
    .string()
    .refine((value) => !isNaN(Number(value)) && Number(value) > 0, {
      message: "El monto debe ser un número positivo",
    }),
  alqm_fechainicio: z.string().refine((value) => !!value, {
    message: "Fecha de inicio requerida",
  }),
  alqm_fechafin: z.string().refine((value) => !!value, {
    message: "Fecha de fin requerida",
  }),
  alqm_fechapago: z.string().optional(),
  alqm_estado: z.enum(["A", "P", "I"]),
});

export type MonthlyRentFormInputs = z.infer<typeof monthlyRentSchema>;

export const useMonthlyRentForm = ({
  action,
  alqm_id,
  onSuccess,
}: {
  action: "create" | "edit" | "view";
  alqm_id?: string | null;
  onSuccess: () => void;
}) => {
  const {
    monthlyRents,
    addMonthlyRent,
    updateMonthlyRent,
    validateRentDates,
    selectedRental,
    calculateNextDates,
  } = useRentalStore();

  const rent = useMemo(
    () => monthlyRents.find((r) => r.alqm_id === alqm_id),
    [alqm_id, monthlyRents]
  );

  const defaultValues = useMemo(() => {
    const { startDate, endDate } = calculateNextDates();
    console.log("End Date: ", endDate);
    return rent
      ? {
          alqm_identificador: rent.alqm_identificador,
          alqm_montototal: rent.alqm_montototal.toString(),
          alqm_fechainicio: rent.alqm_fechainicio,
          alqm_fechafin: rent.alqm_fechafin,
          alqm_fechapago: rent.alqm_fechapago,
          alqm_estado: rent.alqm_estado as "A" | "P" | "I",
        }
      : {
          alqm_identificador: `Mes ${monthlyRents.length + 1}`,
          alqm_montototal: selectedRental?.alq_monto || "",
          alqm_fechainicio: startDate,
          alqm_fechafin: endDate,
          alqm_fechapago: selectedRental?.alq_fechapago || "",
          alqm_estado: "A" as "A" | "P" | "I",
        };
  }, [calculateNextDates, rent, monthlyRents.length]);

  const form = useForm<MonthlyRentFormInputs>({
    resolver: zodResolver(monthlyRentSchema),
    defaultValues,
  });

  const { reset } = form;

  useEffect(() => {
    if (action === "edit" && rent) {
      reset(defaultValues);
    }
  }, [rent, reset, action, defaultValues]);

  const onSubmit: SubmitHandler<MonthlyRentFormInputs> = (formData) => {
    try {
      const isValid = validateRentDates(
        formData.alqm_fechainicio,
        formData.alqm_fechafin
      );

      if (!isValid) {
        throw new Error(
          "Las fechas ingresadas se superponen con un alquiler existente."
        );
      }

      if (action === "edit" && rent) {
        const updatedRent: AvaAlquilerMensual = {
          ...rent,
          alqm_identificador: formData.alqm_identificador,
          alqm_montototal: formData.alqm_montototal,
          alqm_fechainicio: convertToUTC(formData.alqm_fechainicio),
          alqm_fechafin: convertToUTC(formData.alqm_fechafin),
          alqm_fechapago: formData.alqm_fechapago
            ? convertToUTC(formData.alqm_fechapago)
            : undefined,
          alqm_estado: formData.alqm_estado,
        };

        updateMonthlyRent(updatedRent);
      } else if (action === "create") {
        const newRent: AvaAlquilerMensual = {
          alqm_id: formData.alqm_identificador, // or set an appropriate default value
          ava_pago: [], // or set an appropriate default value
          alqm_identificador: formData.alqm_identificador,
          alqm_montototal: formData.alqm_montototal,
          alqm_fechainicio: convertToUTC(formData.alqm_fechainicio),
          alqm_fechafin: convertToUTC(formData.alqm_fechafin),
          alqm_fechapago: formData.alqm_fechapago
            ? convertToUTC(formData.alqm_fechapago)
            : undefined,
          alqm_estado: formData.alqm_estado,
          alqm_montopagado: "",
        };

        addMonthlyRent(newRent);
      }
      onSuccess();
    } catch (error: any) {
      throw new Error(error.message || "Error en el envío del formulario");
    }
  };

  return {
    form,
    handleSubmit: form.handleSubmit,
    onSubmit,
  };
};
