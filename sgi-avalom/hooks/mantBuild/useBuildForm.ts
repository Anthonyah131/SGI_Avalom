"use client";

import { useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import useBuildingStore from "@/lib/zustand/buildStore";
import { BuildFormProps } from "@/lib/typesForm";

const buildingFormSchema = z.object({
  edi_identificador: z
    .string()
    .min(1, "Identificador es requerido")
    .max(15, "El identificador no puede tener más de 15 caracteres"),
  edi_descripcion: z
    .string()
    .max(50, "La descripción no puede tener más de 50 caracteres"),
});

type BuildingFormInputs = z.infer<typeof buildingFormSchema>;

export const useBuildForm = ({
  action,
  building,
  onSuccess,
}: BuildFormProps) => {
  const { addBuilding, updateBuilding } = useBuildingStore();

  const defaultValues = useMemo(() => {
    return action === "create"
      ? {
          edi_identificador: "",
          edi_descripcion: "",
        }
      : {
          edi_identificador: building?.edi_identificador || "",
          edi_descripcion: building?.edi_descripcion || "",
        };
  }, [action, building]);

  const form = useForm<BuildingFormInputs>({
    resolver: zodResolver(buildingFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (action === "edit") {
      reset(defaultValues);
    }
  }, [building, action, reset, defaultValues]);

  const onSubmit: SubmitHandler<BuildingFormInputs> = async (data) => {
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
        response = await axios.post("/api/building", data, { headers });
      } else if (action === "edit" && building?.edi_id) {
        response = await axios.put(`/api/building/${building.edi_id}`, data, {
          headers,
        });
      }

      if (response?.data?.success) {
        action === "create"
          ? addBuilding(response.data.data)
          : updateBuilding(response.data.data);
        onSuccess();
        reset(defaultValues);
      } else {
        throw new Error(response?.data?.error || "Error desconocido");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || "Error desconocido";
      throw new Error(message);
    }
  };

  const handleClear = () => {
    reset(defaultValues);
  };

  return {
    form,
    handleSubmit,
    onSubmit,
    handleClear,
  };
};
