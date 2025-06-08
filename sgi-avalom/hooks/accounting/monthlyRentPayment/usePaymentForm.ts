"use client";

import { useState } from "react";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import usePaymentStore from "@/lib/zustand/monthlyPaymentStore";
import { convertToUTC, convertToUTCSV } from "@/utils/dateUtils";

const paymentFormSchema = z.object({
  pag_descripcion: z
    .string()
    .max(50, "La descripción debe tener como máximo 50 caracteres.")
    .optional(),
  pag_cuenta: z
    .string()
    .min(1, "La cuenta es obligatoria.")
    .max(50, "La cuenta debe tener como máximo 50 caracteres."),
  pag_metodopago: z
    .string()
    .min(1, "El método de pago es obligatorio.")
    .max(30, "El método de pago debe tener como máximo 30 caracteres."),
  pag_banco: z
    .string()
    .max(50, "El banco debe tener como máximo 50 caracteres.")
    .optional(),
  pag_fechapago: z.string().min(1, "La fecha de pago es obligatoria."),
  pag_referencia: z
    .string()
    .max(100, "La referencia debe tener como máximo 100 caracteres.")
    .optional(),
});

type PaymentFormInputs = z.infer<typeof paymentFormSchema>;

interface PaymentFormData extends PaymentFormInputs {
  amountToPay: number;
}

export const usePaymentForm = () => {
  const { selectedMonthlyRent, selectMonthlyRent, addPayment } =
    usePaymentStore();
  const form = useForm<PaymentFormInputs>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      pag_descripcion: "",
      pag_cuenta: "",
      pag_metodopago: "",
      pag_banco: "",
      pag_fechapago: "",
      pag_referencia: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountToPay, setAmountToPay] = useState<string>("");

  const handlePaymentSubmit = async (formData: PaymentFormData) => {
    try {
      const {
        pag_descripcion,
        pag_cuenta,
        amountToPay,
        pag_banco,
        pag_metodopago,
        pag_referencia,
        pag_fechapago,
      } = formData;

      if (!selectedMonthlyRent) {
        throw new Error("No hay alquiler mensual seleccionado.");
      }

      const paymentData = {
        pag_monto: amountToPay,
        pag_fechapago: convertToUTCSV(pag_fechapago),
        pag_estado: "A",
        pag_descripcion,
        pag_cuenta,
        pag_metodopago,
        pag_banco,
        pag_referencia,
        alqm_id: selectedMonthlyRent.alqm_id,
      };

      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      setIsSubmitting(true);

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(
        `/api/accounting/payment`,
        paymentData,
        { headers }
      );

      if (response?.data?.success) {
        addPayment(response.data.data.payment);
        selectMonthlyRent(response.data.data.updatedMonthlyRent);
      } else {
        throw new Error(response?.data?.error || "Error desconocido.");
      }
    } catch (error: any) {
      throw new Error(error.message || "Error al realizar el pago.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handlePaymentSubmit,
    amountToPay,
    setAmountToPay,
  };
};
