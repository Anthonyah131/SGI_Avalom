"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import { format } from "date-fns";
import { toDate, toZonedTime } from "date-fns-tz";
import usePropertyStore from "@/lib/zustand/propertyStore";
import useClientStore from "@/lib/zustand/clientStore";
import { Cliente } from "@/lib/types";
import { RentalFormProps } from "@/lib/typesForm";

const rentalFormSchema = z.object({
  alq_monto: z
    .string()
    .min(1, "El monto es requerido")
    .refine((value) => !isNaN(Number(value)) && Number(value) > 0, {
      message: "Monto inválido",
    }),
  alq_fechapago: z.string().min(1, "La fecha de pago es requerida"),
  alq_estado: z.enum(["A", "F", "C"]),
});

export type RentalFormInputs = z.infer<typeof rentalFormSchema>;

export const useRentalForm = ({ action, onSuccess }: RentalFormProps) => {
  const {
    addRental,
    updateRental,
    removeRental,
    selectedProperty,
    selectedRental,
    setSelectedRental,
  } = usePropertyStore();

  const { clients, setClients } = useClientStore();
  const [clientsInRental, setClientsInRental] = useState<Cliente[]>([]);
  const [hasPayments, setHasPayments] = useState(false);

  const fetchHasPayments = async (alqId: string) => {
    try {
      const token = cookie.get("token");
      if (!token) return;

      const response = await axios.get(`/api/rent/haspayments/${alqId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.success) {
        setHasPayments(response.data.data.hasPayments);
      }
    } catch (error) {
      console.error("Error verificando pagos del alquiler:", error);
    }
  };

  useEffect(() => {
    if (action === "edit" && selectedRental?.alq_id) {
      setClientsInRental(
        selectedRental.ava_clientexalquiler?.map((rel) => rel.ava_cliente) || []
      );
      fetchHasPayments(selectedRental.alq_id);
    } else {
      setClientsInRental([]);
    }
  }, [action, selectedRental]);

  const getAlqEstado = (value: string | undefined): "A" | "F" | "C" => {
    if (["A", "F", "C"].includes(value || "")) {
      return value as "A" | "F" | "C";
    }
    return "A";
  };

  const defaultValues = useMemo(() => {
    return action === "create"
      ? {
          alq_monto: "100000",
          alq_fechapago: "",
          alq_estado: "A" as const,
        }
      : {
          alq_monto: selectedRental?.alq_monto || "0",
          alq_fechapago: selectedRental?.alq_fechapago
            ? format(
                toDate(
                  toZonedTime(
                    new Date(selectedRental.alq_fechapago),
                    "America/Costa_Rica"
                  )
                ),
                "yyyy-MM-dd"
              )
            : "",
          alq_estado: getAlqEstado(selectedRental?.alq_estado),
        };
  }, [action, selectedRental]);

  const form = useForm<RentalFormInputs>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (action === "edit") {
      reset(defaultValues);
    }
  }, [selectedRental, action, reset, defaultValues]);

  const clearForm = () => {
    reset({
      alq_monto: "0",
      alq_fechapago: "",
      alq_estado: "A",
    });
    setSelectedRental(null);
    setClientsInRental([]);
  };

  const onSubmit: SubmitHandler<RentalFormInputs> = async (formData) => {
    try {
      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let response;

      if (action === "create") {
        const activeRents = selectedProperty?.ava_alquiler?.filter(
          (r) => r.alq_estado === "A"
        );

        if (activeRents && activeRents.length > 0) {
          throw new Error("Ya existe un alquiler activo en esta propiedad.");
        }

        const newRental = {
          ...formData,
          alq_fechapago: formData.alq_fechapago
            ? new Date(`${formData.alq_fechapago}T00:00:00`).toISOString()
            : null,
          alq_monto: Number(formData.alq_monto),
          prop_id: selectedProperty?.prop_id,
        };

        response = await axios.post("/api/rent", newRental, { headers });
      } else if (action === "edit" && selectedRental?.alq_id) {
        const updatedRental = {
          ...formData,
          alq_fechapago: formData.alq_fechapago
            ? new Date(`${formData.alq_fechapago}T00:00:00`).toISOString()
            : null,
          ava_clientexalquiler: clientsInRental.map((c) => ({
            cli_id: c.cli_id,
          })),
        };

        response = await axios.put(
          `/api/rent/${selectedRental.alq_id}`,
          updatedRental,
          { headers }
        );
      }

      if (response?.data?.success) {
        if (action === "create") {
          addRental(response.data.data);
        } else {
          updateRental(selectedRental?.alq_id!, response.data.data);
          setSelectedRental(response.data.data);
        }

        onSuccess();
        clearForm();
      }
    } catch (error: any) {
      throw new Error(error.message || "Error al guardar el alquiler");
    }
  };

  const handleClientSelect = (client: Cliente) => {
    if (
      client &&
      clientsInRental.length < 2 &&
      !clientsInRental.some((c) => c.cli_id === client.cli_id)
    ) {
      setClientsInRental([...clientsInRental, client]);
    }
  };

  const handleClientRemove = (cliId: string) => {
    setClientsInRental(clientsInRental.filter((c) => c.cli_id !== cliId));
  };

  useEffect(() => {
    const fetchClients = async () => {
      const token = cookie.get("token");
      if (!token) return;

      const res = await axios.get("/api/client", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClients(res.data.data);
    };

    if (action === "edit") {
      fetchClients();
    }
  }, [setClients]);

  const isFormDisabled = action === "edit" && !selectedRental;
  const disableEstadoField = action === "edit" && hasPayments;

  return {
    form,
    handleSubmit,
    onSubmit,
    handleClear: clearForm,
    handleClientSelect,
    handleClientRemove,
    isFormDisabled,
    disableEstadoField,
    clients,
    clientsInRental,
    selectedRental,
  };
};
