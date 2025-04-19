"use client";

import { useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import usePropertyStore from "@/lib/zustand/propertyStore";
import useBuildingStore from "@/lib/zustand/buildStore";
import useTypeStore from "@/lib/zustand/typeStore";
import { PropertyFormProps } from "@/lib/typesForm";

const propertyFormSchema = z.object({
  prop_identificador: z
    .string()
    .min(1, "El identificador es obligatorio")
    .max(15, "El identificador no puede tener más de 15 caracteres"),
  prop_descripcion: z
    .string()
    .max(50, "La descripción no puede tener más de 50 caracteres"),
  tipp_id: z.string().min(1, "Selecciona un tipo de propiedad"),
});

type PropertyFormInputs = z.infer<typeof propertyFormSchema>;

export const usePropertyForm = ({
  action,
  property,
  entity,
  onSuccess,
}: PropertyFormProps) => {
  const { setSelectedProperty, updateSelectedProperty } = usePropertyStore();
  const { updateProperty, addProperty } = useBuildingStore();
  const { types, fetchTypes } = useTypeStore();

  const defaultValues = useMemo(() => {
    return action === "create"
      ? {
          prop_identificador: "",
          prop_descripcion: "",
          tipp_id: undefined,
        }
      : {
          prop_identificador: property?.prop_identificador || "",
          prop_descripcion: property?.prop_descripcion || "",
          tipp_id: property?.tipp_id || undefined,
        };
  }, [action, property]);

  const form = useForm<PropertyFormInputs>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (action === "edit" && property) {
      reset(defaultValues);
    }
  }, [property, action, reset, defaultValues]);

  useEffect(() => {
    if (types.length === 0) {
      fetchTypes();
    }
  }, [types, fetchTypes]);

  const onSubmit: SubmitHandler<PropertyFormInputs> = async (data) => {
    try {
      const token = cookie.get("token");
      if (!token) {
        throw new Error("No hay token disponible");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const propertyData = {
        ...data,
        tipp_id: data.tipp_id || undefined,
        edi_id: entity,
      };

      let response;

      if (action === "create") {
        response = await axios.post(`/api/property`, propertyData, {
          headers,
        });
        if (response.data.data) {
        }
      } else if (action === "edit" && property?.prop_id) {
        response = await axios.put(
          `/api/property/${property.prop_id}`,
          propertyData,
          { headers }
        );
        if (response.data.data) {
        }
      }
      if (response?.data?.success) {
        if (action === "create") {
          setSelectedProperty(response.data.data);
          addProperty(entity?.toString() || "0", response.data.data);
        } else {
          updateSelectedProperty(response.data.data);
          updateProperty(property?.edi_id || "0", response.data.data);
        }
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
    setSelectedProperty(null);
  };

  return {
    form,
    handleSubmit,
    onSubmit,
    handleClear,
    types,
  };
};
