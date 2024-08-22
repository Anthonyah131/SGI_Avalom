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
import usePropertyStore from "@/lib/zustand/propertyStore";
import { AvaAlquiler } from "@/lib/types";
import { useEffect } from "react";

// Define schema using zod
const rentalFormSchema = z.object({
  alq_monto: z
    .string()
    .min(1, "Monto es requerido")
    .max(20, "Monto no puede ser mayor a 20 caracteres"),
  alq_fechapago: z.string().min(1, "Fecha de pago es requerida"),
  alq_contrato: z.string().optional(),
  alq_estado: z.enum(["A", "F", "C"]),
});

interface RentalFormProps {
  action: "create" | "edit" | "view";
  onSuccess: () => void;
}

const RentalForm: React.FC<RentalFormProps> = ({ action, onSuccess }) => {
  const {
    addRental,
    updateRental,
    selectedProperty,
    selectedRental,
    setSelectedRental,
  } = usePropertyStore((state) => ({
    addRental: state.addRental,
    updateRental: state.updateRental,
    selectedProperty: state.selectedProperty,
    selectedRental: state.selectedRental,
    setSelectedRental: state.setSelectedRental,
  }));

  const defaultValues =
    action === "create"
      ? {
          alq_monto: "",
          alq_fechapago: "",
          alq_contrato: "",
          alq_estado: "A" as "A",
        }
      : selectedRental || {
          alq_monto: "",
          alq_fechapago: "",
          alq_contrato: "",
          alq_estado: "A" as "A",
        };

  const form = useForm<z.infer<typeof rentalFormSchema>>({
    resolver: zodResolver(rentalFormSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    if (action === "edit") {
      reset(defaultValues);
    }
  }, [selectedRental, action, reset]);

  const onSubmit = async (formData: z.infer<typeof rentalFormSchema>) => {
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
          prop_id: selectedProperty?.prop_id,
        };
        const response = await axios.post("/api/rent", newRental, { headers });
        if (response.data) {
          addRental(response.data);
          onSuccess();
          reset(); // Reset the form after success
        }
      } else if (action === "edit" && selectedRental?.alq_id) {
        const response = await axios.put(
          `/api/rent/${selectedRental.alq_id}`,
          formData,
          { headers }
        );
        if (response.data) {
          updateRental(selectedRental.alq_id, response.data);
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error al guardar el alquiler:", error);
      const errorMessage = error.response?.data?.error || "Error desconocido";
      console.error("Error al guardar el alquiler: " + errorMessage);
    }
  };

  const handleClear = () => {
    reset(); // Reset the form fields
    setSelectedRental(null); // Clear the selected rental if creating
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4 m-3"
      >
        <FormField
          control={form.control}
          name="alq_monto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={20} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alq_fechapago"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Pago</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alq_contrato"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contrato</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alq_estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={action === "view"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Activo</SelectItem>
                    <SelectItem value="F">Finalizado</SelectItem>
                    <SelectItem value="C">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <Button type="submit" className="mt-4">
            Guardar
          </Button>
          <Button type="button" onClick={handleClear} className="mt-4">
            Limpiar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RentalForm;
