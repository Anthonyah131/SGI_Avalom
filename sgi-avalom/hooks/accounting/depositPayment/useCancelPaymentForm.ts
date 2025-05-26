"use client";

import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import { useForm, SubmitHandler } from "react-hook-form";
import { CancelPaymentFormProps } from "@/lib/typesForm";
import { zodResolver } from "@hookform/resolvers/zod";
import useDepositStore from "@/lib/zustand/useDepositStore";

const cancelPaymentFormSchema = z.object({
  anp_motivo: z
    .string()
    .min(1, "Debes ingresar un motivo.")
    .max(50, "El motivo no puede tener más de 50 caracteres."),
  anp_descripcion: z
    .string()
    .max(50, "La descripción no puede tener más de 50 caracteres.")
    .optional(),
});

type CancelPaymentFormInputs = z.infer<typeof cancelPaymentFormSchema>;

export const useCancelPaymentForm = ({
  payment,
  onSuccess,
}: CancelPaymentFormProps) => {
  const form = useForm<CancelPaymentFormInputs>({
    resolver: zodResolver(cancelPaymentFormSchema),
    defaultValues: {
      anp_motivo: "",
      anp_descripcion: "",
    },
  });
  const { updateAnnulment, updatePayment } = useDepositStore();
  const { reset, handleSubmit } = form;

  const onSubmit: SubmitHandler<CancelPaymentFormInputs> = async (data) => {
    try {
      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(
        `/api/accounting/deposit/canceledpayment`,
        {
          ...data,
          anp_montooriginal: "0",
          anp_montofinal: "0",
          anp_fechaanulacion: new Date().toISOString(),
          pag_id: payment.pag_id,
        },
        { headers }
      );

      if (response?.data?.success) {
        updatePayment({
          ...payment,
          pag_estado: "D",
        });
        updateAnnulment(response.data.data);
        onSuccess();
        reset();
      } else {
        throw new Error(response?.data?.error || "Error desconocido");
      }
    } catch (error: any) {
      throw new Error(error.message || "Error al anular el pago");
    }
  };

  const handleClear = () => {
    reset();
  };

  return {
    form,
    onSubmit,
    handleSubmit,
    handleClear,
  };
};
