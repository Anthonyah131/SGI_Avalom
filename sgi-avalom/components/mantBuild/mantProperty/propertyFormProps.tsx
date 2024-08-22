"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import usePropertyStore from "@/lib/zustand/propertyStore";
import useBuildingStore from "@/lib/zustand/buildStore";
import useTypeStore from "@/lib/zustand/typeStore";
import { AvaPropiedad } from "@/lib/types";

// Define schema using zod
const propertyFormSchema = z.object({
  prop_identificador: z
    .string()
    .min(1, "El identificador es obligatorio")
    .max(15, "El identificador no puede tener más de 15 caracteres"),
  prop_descripcion: z
    .string()
    .max(50, "La descripción no puede tener más de 50 caracteres"),
  tipp_id: z.number().min(1, "Selecciona un tipo de propiedad"),
});

interface PropertyFormProps {
  action: "create" | "edit" | "view";
  property?: AvaPropiedad;
  entity?: number;
  onSuccess: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  action,
  property,
  entity,
  onSuccess,
}) => {
  const { setSelectedProperty, updateSelectedProperty } = usePropertyStore();
  const { updateProperty, addProperty } = useBuildingStore();
  const { types, fetchTypes } = useTypeStore();
  const [error, setError] = useState<string | null>(null);

  const defaultValues = property || {
    prop_identificador: "",
    prop_descripcion: "",
    tipp_id: undefined,
  };

  const form = useForm<z.infer<typeof propertyFormSchema>>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset(property);
  }, [property, reset]);

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      if (types.length === 0) {
        await fetchTypes();
      }
    };
    fetchPropertyTypes();
  }, [fetchTypes, types]);

  const onSubmit = async (data: z.infer<typeof propertyFormSchema>) => {
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

      if (action === "create") {
        const response = await axios.post(`/api/property`, propertyData, {
          headers,
        });
        if (response.data) {
          setSelectedProperty(response.data);
          addProperty(entity || 0, response.data);
          onSuccess();
        }
      } else if (action === "edit" && property?.prop_id) {
        const response = await axios.put(
          `/api/property/${property.prop_id}`,
          propertyData,
          { headers }
        );
        if (response.data) {
          updateSelectedProperty(response.data);
          updateProperty(property?.edi_id || 0, response.data);
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error al guardar propiedad:", error);
      setError("Hubo un error al guardar la propiedad.");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4 m-3"
      >
        <FormField
          control={form.control}
          name="prop_identificador"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identificador</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="prop_descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tipp_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Propiedad</FormLabel>
              <FormControl>
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  disabled={action === "view"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem
                        key={type.tipp_id}
                        value={type.tipp_id.toString()}
                      >
                        {type.tipp_nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {action !== "view" && (
          <div className="pt-4 m-3">
            <Button type="submit">
              {action === "create" ? "Crear Propiedad" : "Guardar Cambios"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default PropertyForm;
