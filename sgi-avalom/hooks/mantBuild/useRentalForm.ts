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
    .refine((value) => !isNaN(Number(value)), {
      message: "El monto debe ser un número",
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
  } = usePropertyStore((state) => ({
    addRental: state.addRental,
    updateRental: state.updateRental,
    removeRental: state.removeRental,
    selectedProperty: state.selectedProperty,
    selectedRental: state.selectedRental,
    setSelectedRental: state.setSelectedRental,
  }));

  const { clients, setClients } = useClientStore((state) => ({
    clients: state.clients,
    setClients: state.setClients,
  }));

  const [clientsInRental, setClientsInRental] = useState<Cliente[]>([]);

  useEffect(() => {
    if (action === "edit" && selectedRental) {
      setClientsInRental(
        selectedRental.ava_clientexalquiler?.map(
          (relation) => relation.ava_cliente
        ) || []
      );
    } else {
      setClientsInRental([]);
    }
  }, [action, selectedRental]);

  const getAlqEstado = (value: string | undefined): "A" | "F" | "C" => {
    if (value === "A" || value === "F" || value === "C") {
      return value;
    }
    return "A";
  };

  const defaultValues = useMemo(() => {
    return action === "create"
      ? {
          alq_monto: "0",
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
      alq_estado: "A" as const,
    });
    setSelectedRental(null);
    setClientsInRental([]);
  };

  const onSubmit: SubmitHandler<RentalFormInputs> = async (formData) => {
    try {
      const token = cookie.get("token");
      if (!token) {
        throw new Error("Token no disponible");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let response;

      if (action === "create") {
        const newRental = {
          ...formData,
          alq_fechapago: formData.alq_fechapago
            ? new Date(`${formData.alq_fechapago}T00:00:00`).toISOString()
            : null,
          alq_monto: Number(formData.alq_monto) || 0,
          prop_id: selectedProperty?.prop_id,
        };
        response = await axios.post("/api/rent", newRental, { headers });
      } else if (action === "edit" && selectedRental?.alq_id) {
        const updatedRentalData = {
          ...formData,
          alq_fechapago: formData.alq_fechapago
            ? new Date(`${formData.alq_fechapago}T00:00:00`).toISOString()
            : null,
          ava_clientexalquiler: clientsInRental.map((client) => ({
            cli_id: client.cli_id,
          })),
        };

        response = await axios.put(
          `/api/rent/${selectedRental.alq_id}`,
          updatedRentalData,
          { headers }
        );
      }
      if (response?.data?.success) {
        if (action === "create") {
          addRental(response.data.data);
        } else if (action === "edit" && selectedRental?.alq_id) {
          updateRental(selectedRental?.alq_id, response.data.data);
          setSelectedRental(response.data.data);
        } else {
          throw new Error(response?.data?.error || "Error desconocido");
        }
        onSuccess();
        clearForm();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || "Error desconocido";
      throw new Error(message);
    }
  };

  const handleClear = () => {
    clearForm();
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

  const handleClientRemove = (clientId: string) => {
    setClientsInRental(
      clientsInRental.filter((client) => client.cli_id !== clientId)
    );
  };

  useEffect(() => {
    const fetchClients = async () => {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      try {
        const response = await axios.get("/api/client", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setClients(response.data.data);
      } catch (error) {
        console.error("Error al buscar clientes: " + error);
      }
    };

    fetchClients();
  }, [setClients]);

  const isFormDisabled = action === "edit" && !selectedRental;

  return {
    form,
    handleSubmit,
    onSubmit,
    handleClear,
    handleClientSelect,
    handleClientRemove,
    isFormDisabled,
    clients,
    clientsInRental,
    selectedRental,
  };
};
