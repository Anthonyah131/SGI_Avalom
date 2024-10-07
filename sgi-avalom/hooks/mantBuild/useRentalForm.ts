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
    .min(1, "Monto es requerido")
    .max(20, "Monto no puede ser mayor a 20 caracteres"),
  alq_fechapago: z.string().optional(),
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

  // Estado local para los clientes en el alquiler
  const [clientsInRental, setClientsInRental] = useState<Cliente[]>([]);

  // Inicializar clientsInRental cuando selectedRental cambie
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

  // Función auxiliar para obtener el valor de alq_estado
  const getAlqEstado = (value: string | undefined): "A" | "F" | "C" => {
    if (value === "A" || value === "F" || value === "C") {
      return value;
    }
    return "A";
  };

  const defaultValues = useMemo(() => {
    return action === "create"
      ? {
          alq_monto: "",
          alq_fechapago: "",
          alq_estado: "A" as const,
        }
      : {
          alq_monto: selectedRental?.alq_monto || "",
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
      alq_monto: "",
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
        console.error("No hay token disponible");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (action === "create") {
        const newRental = {
          ...formData,
          alq_fechapago: formData.alq_fechapago
            ? new Date(`${formData.alq_fechapago}T00:00:00`).toISOString()
            : null,
          prop_id: selectedProperty?.prop_id,
        };
        const response = await axios.post("/api/rent", newRental, { headers });
        if (response.data) {
          addRental(response.data);
          onSuccess();
          clearForm();
        }
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

        const response = await axios.put(
          `/api/rent/${selectedRental.alq_id}`,
          updatedRentalData,
          { headers }
        );
        if (response.data) {
          updateRental(selectedRental.alq_id, response.data);
          setSelectedRental(response.data);
          onSuccess();
          clearForm();
        }
      }
    } catch (error: any) {
      console.error("Error al guardar el alquiler:", error);
      const errorMessage = error.response?.data?.error || "Error desconocido";
      console.error("Error al guardar el alquiler: " + errorMessage);
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

  const handleClientRemove = (clientId: number) => {
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
        setClients(response.data);
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
