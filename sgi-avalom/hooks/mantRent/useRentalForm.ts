"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { Cliente, AvaAlquilerMensual } from "@/lib/types";
import { format, toDate, toZonedTime } from "date-fns-tz";

const rentalFormSchema = z.object({
  alq_monto: z.string().refine((value) => !isNaN(Number(value)), {
    message: "El monto debe ser un número",
  }),
  alq_fechapago: z.string(),
  alq_estado: z.enum(["A", "F", "C"]),
});

export type RentalFormInputs = z.infer<typeof rentalFormSchema>;

export const useRentalForm = ({
  action,
  onSuccess,
}: {
  action: string;
  onSuccess: () => void;
}) => {
  const {
    selectedRental,
    setSelectedRental,
    monthlyRents,
    setMonthlyRents,
    addMonthlyRent,
    updateMonthlyRent,
    deleteMonthlyRent,
  } = useRentalStore();

  const [clients, setClients] = useState<Cliente[]>([]);
  const [clientsInRental, setClientsInRental] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RentalFormInputs>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues: {
      alq_monto: "0",
      alq_fechapago: "",
      alq_estado: "A",
    },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (selectedRental) {
      const formattedValues = {
        alq_monto: selectedRental.alq_monto?.toString() || "0",
        alq_fechapago: format(
          toDate(
            toZonedTime(
              new Date(selectedRental.alq_fechapago),
              "America/Costa_Rica"
            )
          ),
          "yyyy-MM-dd"
        ),
        alq_estado: ["A", "F", "C"].includes(selectedRental.alq_estado)
          ? (selectedRental.alq_estado as "A" | "F" | "C")
          : "A", // Valor por defecto seguro
      };

      reset(formattedValues); // Sincroniza el formulario con el estado de Zustand
      setClientsInRental(
        selectedRental.ava_clientexalquiler?.map((rel) => rel.ava_cliente) || []
      );
      setMonthlyRents(selectedRental.ava_alquilermensual || []);
    }
  }, [selectedRental, reset, setMonthlyRents]);

  const fetchClients = async () => {
    try {
      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      const response = await axios.get("/api/client", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setClients(response.data.data || []);
    } catch (error: any) {
      console.error("Error al cargar clientes:", error.message);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onSubmit: SubmitHandler<RentalFormInputs> = async (formData) => {
    try {
      setIsLoading(true);
      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      const headers = { Authorization: `Bearer ${token}` };

      let response;
      if (selectedRental?.alq_id) {
        response = await axios.put(
          `/api/rent/${selectedRental.alq_id}`,
          {
            ...formData,
            alq_fechapago: formData.alq_fechapago
            ? new Date(`${formData.alq_fechapago}T00:00:00`).toISOString()
            : null,
            ava_clientexalquiler: clientsInRental.map((c) => ({
              cli_id: c.cli_id,
            })),
          },
          { headers }
        );
      }

      if (response?.data?.success) {
        setSelectedRental(response.data.data);
        onSuccess();
      } else {
        throw new Error(response?.data?.error || "Error desconocido");
      }
    } catch (error: any) {
      throw new Error(error.message || "Error en el envío del formulario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientSelect = (client: Cliente) => {
    if (client && !clientsInRental.some((c) => c.cli_id === client.cli_id)) {
      setClientsInRental((prev) => [...prev, client]);
    }
  };

  const handleClientRemove = (clientId: string) => {
    setClientsInRental((prev) =>
      prev.filter((client) => client.cli_id !== clientId)
    );
  };

  const handleClear = () => {
    reset({
      alq_monto: "0",
      alq_fechapago: "",
      alq_estado: "A",
    });
    setClientsInRental([]);
    setSelectedRental(null);
    setMonthlyRents([]);
  };

  const isFormDisabled = action === "view";

  return {
    form,
    handleSubmit,
    onSubmit,
    handleClear,
    clients,
    clientsInRental,
    handleClientSelect,
    handleClientRemove,
    isLoading,
    selectedRental,
    isFormDisabled,
  };
};
