"use client";

import { act, useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { AvaAlquilerMensual } from "@/lib/types";
import { convertToUTC } from "@/utils/dateUtils";
import axios from "axios";
import cookie from "js-cookie";

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
  mode,
  onSuccess,
}: {
  action: "create" | "edit";
  alqm_id?: string | null;
  mode: "view" | "create";
  onSuccess: () => void;
}) => {
  const {
    selectedRental,
    monthlyRents,
    createMonthlyRents,
    addRent,
    updateRent,
    validateRentDates,
    calculateNextDates,
  } = useRentalStore();

  const rents = mode === "create" ? createMonthlyRents : monthlyRents;

  const rent = useMemo(
    () => rents.find((r) => r.alqm_id === alqm_id),
    [alqm_id, rents]
  );

  const defaultValues = useMemo(() => {
    let startDate, endDate;
    if (mode === "view") {
      ({ startDate, endDate } = calculateNextDates("monthlyRents"));
    } else {
      ({ startDate, endDate } = calculateNextDates("createMonthlyRents"));
    }
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
  }, [calculateNextDates, monthlyRents.length, rent, rents]);

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

  const onSubmit: SubmitHandler<MonthlyRentFormInputs> = async (formData) => {
    try {
      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      let isDuplicateIdentifier = false;
      let isValid;

      if (mode === "view") {
        isValid = validateRentDates(
          "monthlyRents",
          formData.alqm_fechainicio,
          formData.alqm_fechafin,
          formData.alqm_identificador
        );
        isDuplicateIdentifier = monthlyRents.some(
          (rent) =>
            rent.alqm_identificador === formData.alqm_identificador &&
            rent.alqm_id !== alqm_id
        );
      } else if (mode === "create") {
        isValid = validateRentDates(
          "createMonthlyRents",
          formData.alqm_fechainicio,
          formData.alqm_fechafin,
          formData.alqm_identificador
        );

        isDuplicateIdentifier = createMonthlyRents.some(
          (rent) =>
            rent.alqm_identificador === formData.alqm_identificador &&
            rent.alqm_fechafin !== formData.alqm_fechafin &&
            rent.alqm_fechainicio !== formData.alqm_fechainicio
        );
      }

      if (!isValid) {
        throw new Error("Las fechas no son válidas.");
      }

      if (isDuplicateIdentifier) {
        throw new Error(
          "El identificador ya está en uso. Por favor, elige otro."
        );
      }

      let Rent: AvaAlquilerMensual | undefined;

      if (action === "edit" && rent) {
        Rent = {
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

        if (mode === "view") {
          const response = await axios.put(
            `/api/monthlyrent/${Rent.alqm_id}`,
            Rent,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!response?.data?.success) {
            throw new Error(response?.data?.error || "Error al actualizar.");
          }

          updateRent("monthlyRents", response.data.data);
        } else {
          updateRent("createMonthlyRents", Rent);
        }
      } else if (action === "create") {
        Rent = {
          alqm_id: formData.alqm_identificador,
          ava_pago: [],
          alqm_identificador: formData.alqm_identificador,
          alqm_montototal: formData.alqm_montototal,
          alqm_fechainicio: convertToUTC(formData.alqm_fechainicio),
          alqm_fechafin: convertToUTC(formData.alqm_fechafin),
          alqm_fechapago: formData.alqm_fechapago
            ? convertToUTC(formData.alqm_fechapago)
            : undefined,
          alqm_estado: formData.alqm_estado,
          alqm_montopagado: "0",
          alq_id: selectedRental?.alq_id || "",
        };

        if (mode === "view") {
          const response = await axios.post(`/api/monthlyrent`, Rent, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response?.data?.success) {
            throw new Error(response?.data?.error || "Error al crear.");
          }

          addRent("monthlyRents", response.data.data);
        } else {
          addRent("createMonthlyRents", Rent);
        }
      }

      onSuccess();
    } catch (error: any) {
      throw new Error(error.message || "Error en el envío del formulario.");
    }
  };

  return {
    form,
    handleSubmit: form.handleSubmit,
    onSubmit,
  };
};
