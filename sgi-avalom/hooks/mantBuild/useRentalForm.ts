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
  alq_contrato: z.string().optional(),
  alq_estado: z.enum(["A", "F", "C"]),
});

type RentalFormInputs = z.infer<typeof rentalFormSchema>;

export const useRentalForm = ({ action, onSuccess }: RentalFormProps) => {
  const {
    addRental,
    updateRental,
    removeRental,
    selectedProperty,
    selectedRental,
    setSelectedRental,
    addClientToRental,
    removeClientFromRental,
  } = usePropertyStore((state) => ({
    addRental: state.addRental,
    updateRental: state.updateRental,
    removeRental: state.removeRental,
    selectedProperty: state.selectedProperty,
    selectedRental: state.selectedRental,
    setSelectedRental: state.setSelectedRental,
    addClientToRental: state.addClientToRental,
    removeClientFromRental: state.removeClientFromRental,
  }));

  const { clients, setClients } = useClientStore((state) => ({
    clients: state.clients,
    setClients: state.setClients,
  }));

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const defaultValues = useMemo(() => {
    if (action === "create") {
      return {
        alq_monto: "",
        alq_fechapago: "",
        alq_contrato: "",
        alq_estado: "A" as const,
      };
    } else {
      return {
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
        alq_contrato: selectedRental?.alq_contrato || "",
        alq_estado: selectedRental?.alq_estado as "A" | "F" | "C",
      };
    }
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
      alq_contrato: "",
      alq_estado: "A",
    });
    setSelectedFile(null);
    setSelectedRental(null);
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

      let fileUrl = selectedRental?.alq_contrato || "";

      if (selectedFile) {
        const formDataFile = new FormData();
        formDataFile.append("file", selectedFile);

        const response = await axios.post(
          "/api/cloudinary/upload",
          formDataFile,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const { url } = response.data;
        fileUrl = url;
      }

      if (action === "create") {
        const newRental = {
          ...formData,
          alq_fechapago: formData.alq_fechapago
            ? new Date(`${formData.alq_fechapago}T00:00:00`).toISOString()
            : null,
          prop_id: selectedProperty?.prop_id,
          alq_contrato: fileUrl,
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
          ava_clientexalquiler:
            selectedRental?.ava_clientexalquiler.map(({ ava_cliente }) => ({
              cli_id: ava_cliente.cli_id,
            })) || [],
          alq_contrato: fileUrl,
        };

        const response = await axios.put(
          `/api/rent/${selectedRental.alq_id}`,
          updatedRentalData,
          { headers }
        );
        if (response.data) {
          updateRental(selectedRental.alq_id, response.data);
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

  const handleDelete = async () => {
    if (selectedRental?.alq_id) {
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

        const response = await axios.delete(
          `/api/rent/${selectedRental.alq_id}`,
          { headers }
        );
        if (response.data) {
          removeRental(selectedRental.alq_id);
          onSuccess();
          clearForm();
        }
      } catch (error: any) {
        console.error("Error al borrar el alquiler:", error);
        const errorMessage = error.response?.data?.error || "Error desconocido";
        console.error("Error al borrar el alquiler: " + errorMessage);
      }
    }
  };

  const handleClear = () => {
    clearForm();
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleClientSelect = (client: Cliente) => {
    if (
      client &&
      (selectedRental?.ava_clientexalquiler?.length ?? 0) < 2 &&
      !selectedRental?.ava_clientexalquiler.some(
        (relation) => relation.cli_id === client.cli_id
      )
    ) {
      addClientToRental(client);
    }
  };

  const handleClientRemove = (clientId: number) => {
    removeClientFromRental(clientId);
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
    handleDelete,
    handleClear,
    handleFileSelect,
    handleClientSelect,
    handleClientRemove,
    isFormDisabled,
    clients,
    selectedRental,
  };
};
