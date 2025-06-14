"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import cookie from "js-cookie";
import { useParams } from "next/navigation";
import useCanceledRentalStore from "@/lib/zustand/useCanceledRentalStore";

const schema = z.object({
  depo_montodevuelto: z
    .string()
    .min(1, "El monto devuelto es requerido, puede ser 0 si no hay devolución")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Debe ser un número mayor o igual a 0",
    }),
  depo_descmontodevuelto: z
    .string()
    .max(50, "Descripción no puede exceder 50 caracteres")
    .optional(),
  depo_montocastigo: z
    .string()
    .min(1, "El monto de castigo es requerido, puede ser 0 si no hay castigo")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Debe ser un número mayor o igual a 0",
    }),
  depo_descrmontocastigo: z
    .string()
    .max(50, "Descripción no puede exceder 50 caracteres")
    .optional(),
  depo_fechadevolucion: z.string().optional(),
  alqc_motivo: z
    .string()
    .min(1, "El motivo es requerido")
    .max(50, "El motivo no puede exceder 50 caracteres"),
  alqc_montodevuelto: z
    .string()
    .min(1, "El monto devuelto es requerido, puede ser 0 si no hay devolución")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Debe ser un número mayor o igual a 0",
    }),
  alqc_castigo: z
    .string()
    .min(1, "El monto de castigo es requerido, puede ser 0 si no hay castigo")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Debe ser un número mayor o igual a 0",
    }),
  alqc_motivomontodevuelto: z
    .string()
    .max(50, "Motivo de monto devuelto no puede exceder 50 caracteres")
    .optional(),
  alqc_motivocastigo: z
    .string()
    .max(50, "Motivo de castigo no puede exceder 50 caracteres")
    .optional(),
  alqc_fecha_cancelacion: z
    .string()
    .min(1, "La fecha de cancelación es requerida")
    .refine((val) => !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
});

type FormData = z.infer<typeof schema>;

export const useCanceledRentForm = () => {
  const { alqId } = useParams();
  const { deposito, selectedRental } = useCanceledRentalStore();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      depo_montodevuelto: "",
      depo_descmontodevuelto: "",
      depo_montocastigo: "",
      depo_descrmontocastigo: "",
      depo_fechadevolucion: "",
      alqc_motivo: "",
      alqc_montodevuelto: "",
      alqc_castigo: "",
      alqc_motivomontodevuelto: "",
      alqc_motivocastigo: "",
      alqc_fecha_cancelacion: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleCancelSubmit = async (data: FormData) => {
    const montoActual = Number(deposito?.depo_montoactual || 0);
    const montoDevuelto = Number(data.depo_montodevuelto);
    const montoCastigo = Number(data.depo_montocastigo);
    const totalDevuelto = montoDevuelto + montoCastigo;

    if (deposito?.depo_id === undefined || deposito?.depo_id === null) {
      throw new Error("No hay un depósito asociado a este alquiler.");
    }

    if (totalDevuelto > montoActual) {
      throw new Error(
        "La suma del monto devuelto y castigo no puede superar el depósito actual."
      );
    }

    if (data.alqc_fecha_cancelacion && selectedRental?.alq_fechapago) {
      const cancelDate = new Date(data.alqc_fecha_cancelacion);
      const rentStart = new Date(selectedRental.alq_fechapago);
      if (cancelDate < rentStart) {
        throw new Error(
          "La fecha de cancelación no puede ser anterior al inicio del alquiler."
        );
      }
    }

    try {
      const token = cookie.get("token");
      console.log("alqc_fecha_cancelacion", data.alqc_fecha_cancelacion);
      const response = await axios.put(
        `/api/accounting/canceledrent/${alqId}`,
        {
          ...data,
          depo_fechadevolucion: new Date(
            `${data.depo_fechadevolucion}T00:00:00`
          ).toISOString(),
          alqc_fecha_cancelacion: new Date(
            `${data.alqc_fecha_cancelacion}T00:00:00`
          ).toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response?.data?.success) {
        throw new Error(response?.data?.error || "Error desconocido");
      }

      form.reset();
    } catch (error: any) {
      throw new Error(error.message || "Error al cancelar el alquiler");
    }
  };

  return { form, handleCancelSubmit, isSubmitting };
};
