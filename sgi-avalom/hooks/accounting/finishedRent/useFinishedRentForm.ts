import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import cookie from "js-cookie";
import { useParams } from "next/navigation";
import useFinishedRentalStore from "@/lib/zustand/useFinishedRentalStore";

const finishedRentSchema = z.object({
  depo_montodevuelto: z
    .string()
    .min(1, "El monto devuelto es requerido")
    .refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
      message: "El monto debe ser un número y mayor o igual a 0",
    }),
  depo_descmontodevuelto: z
    .string()
    .max(50, "La descripción no puede exceder los 50 caracteres")
    .optional(),
  depo_montocastigo: z
    .string()
    .min(1, "El monto de castigo es requerido, puede ser 0 si no aplica")
    .refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
      message: "El monto debe ser un número y mayor o igual a 0",
    }),
  depo_descrmontocastigo: z
    .string()
    .max(50, "La descripción no puede exceder los 50 caracteres")
    .optional(),
  depo_fechadevolucion: z.string().optional(),
});

type FinishedRentFormData = z.infer<typeof finishedRentSchema>;

export const useFinishedRentForm = () => {
  const { alqId } = useParams();
  const { deposito, selectedRental } = useFinishedRentalStore();
  const form = useForm<FinishedRentFormData>({
    resolver: zodResolver(finishedRentSchema),
    defaultValues: {
      depo_montodevuelto: "",
      depo_descmontodevuelto: "",
      depo_montocastigo: "",
      depo_descrmontocastigo: "",
      depo_fechadevolucion: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleFinishSubmit = async (data: FinishedRentFormData) => {
    const montoDevuelto = Number(data.depo_montodevuelto);
    const montoCastigo = Number(data.depo_montocastigo || 0);
    const montoDisponible = Number(deposito?.depo_montoactual || 0);

    if (deposito?.depo_id === undefined || deposito?.depo_id === null) {
      throw new Error("No hay un depósito asociado a este alquiler.");
    }

    if (montoDevuelto > montoDisponible) {
      throw new Error(
        "El monto devuelto no puede ser mayor al depósito disponible."
      );
    }

    if (montoDevuelto + montoCastigo > montoDisponible) {
      throw new Error(
        "La suma del monto devuelto y castigo no puede exceder el depósito actual."
      );
    }

    if (data.depo_fechadevolucion && selectedRental?.alq_fechapago) {
      const fechaDev = new Date(data.depo_fechadevolucion);
      const fechaInicio = new Date(selectedRental.alq_fechapago);

      if (fechaDev < fechaInicio) {
        throw new Error(
          "La fecha de devolución no puede ser anterior al inicio del alquiler."
        );
      }
    }

    try {
      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      const response = await axios.put(
        `/api/accounting/finishedrent/${alqId}`,
        {
          ...data,
          depo_fechadevolucion: data.depo_fechadevolucion
            ? new Date(`${data.depo_fechadevolucion}T00:00:00`).toISOString()
            : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.success) {
        form.reset();
      } else {
        throw new Error(response?.data?.error || "Error desconocido");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || "Error desconocido";
      throw new Error(message);
    }
  };

  return {
    form,
    handleFinishSubmit,
    isSubmitting,
  };
};
