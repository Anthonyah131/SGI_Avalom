"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useBuildingStore from "@/lib/zustand/buildStore";
import { AvaEdificio } from "@/lib/types";

// Define schema using zod
const buildingFormSchema = z.object({
  edi_identificador: z
    .string()
    .min(1, "Identificador es requerido")
    .max(15, "El identificador no puede tener más de 15 caracteres"),
  edi_descripcion: z
    .string()
    .max(50, "La descripción no puede tener más de 50 caracteres"),
});

interface BuildFormProps {
  action: "create" | "edit" | "view";
  building?: AvaEdificio;
  onSuccess: () => void;
}

const BuildForm: React.FC<BuildFormProps> = ({
  action,
  building,
  onSuccess,
}) => {
  const { addBuilding, updateBuilding } = useBuildingStore((state) => ({
    addBuilding: state.addBuilding,
    updateBuilding: state.updateBuilding,
  }));

  const defaultValues = building || {
    edi_identificador: "",
    edi_descripcion: "",
  };

  const form = useForm<z.infer<typeof buildingFormSchema>>({
    resolver: zodResolver(buildingFormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (formData: z.infer<typeof buildingFormSchema>) => {
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
        const response = await axios.post("/api/building", formData, {
          headers,
        });
        if (response.data) {
          addBuilding(response.data);
          onSuccess();
        }
      } else if (action === "edit" && building?.edi_id) {
        const response = await axios.put(
          `/api/building/${building.edi_id}`,
          formData,
          { headers }
        );
        if (response.data) {
          updateBuilding(response.data);
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error al guardar el Edificio:", error);
      const errorMessage = error.response?.data?.error || "Error desconocido";
      console.error("Error al guardar el Edificio: " + errorMessage);
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
          name="edi_identificador"
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
          name="edi_descripcion"
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
        {action !== "view" && (
          <div className="pt-4 m-3">
            <Button type="submit">
              {action === "create" ? "Crear Edificio" : "Guardar Cambios"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default BuildForm;
