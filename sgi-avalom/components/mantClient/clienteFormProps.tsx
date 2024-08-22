"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import cookie from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useClientStore from "@/lib/zustand/clientStore";
import { Cliente } from "@/lib/types";
import axios from "axios";

// Define schema using zod
const clienteFormSchema = z.object({
  cli_nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(30, "El nombre no puede tener más de 30 caracteres"),
  cli_papellido: z
    .string()
    .min(1, "El primer apellido es requerido")
    .max(30, "El primer apellido no puede tener más de 30 caracteres"),
  cli_sapellido: z
    .string()
    .max(30, "El segundo apellido no puede tener más de 30 caracteres"),
  cli_cedula: z
    .string()
    .min(1, "La cédula es requerida")
    .max(15, "La cédula no puede tener más de 20 caracteres"),
  cli_telefono: z
    .string()
    .min(1, "El teléfono es requerido")
    .max(15, "El teléfono no puede tener más de 15 caracteres"),
  cli_correo: z
    .string()
    .min(1, "El correo es requerido")
    .email("Correo inválido")
    .max(50, "El correo no puede tener más de 50 caracteres"),
});

interface ClienteFormProps {
  action: "create" | "edit" | "view";
  entity?: Cliente;
  onSuccess: () => void;
}

const ClienteForm: React.FC<ClienteFormProps> = ({
  action,
  entity,
  onSuccess,
}) => {
  const { addClient, updateClient } = useClientStore((state) => ({
    addClient: state.addClient,
    updateClient: state.updateClient,
  }));

  const defaultValues = entity || {
    cli_nombre: "",
    cli_papellido: "",
    cli_sapellido: "",
    cli_cedula: "",
    cli_telefono: "",
    cli_correo: "",
  };

  const form = useForm<z.infer<typeof clienteFormSchema>>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues,
  });

  const { handleSubmit } = form;

  const onSubmit = async (formData: z.infer<typeof clienteFormSchema>) => {
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
        const response = await axios.post("/api/client", formData, { headers });
        if (response.data) {
          addClient(response.data);
          onSuccess && onSuccess();
        }
      } else if (action === "edit" && entity?.cli_id) {
        const response = await axios.put(
          `/api/client/${entity.cli_id}`,
          formData,
          { headers }
        );
        if (response.data) {
          updateClient(response.data);
          onSuccess && onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error al guardar el cliente:", error);
      const errorMessage = error.response?.data?.error || "Error desconocido";
      console.error("Error al guardar el cliente: " + errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4"
      >
        <FormField
          control={form.control}
          name="cli_nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={30} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cli_papellido"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primer Apellido</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={30} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cli_sapellido"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Segundo Apellido</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={30} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cli_cedula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cédula</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={15} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cli_telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={15} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cli_correo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={50} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {action !== "view" && (
          <div className="pt-4">
            <Button type="submit">
              {action === "create" ? "Crear Cliente" : "Guardar Cambios"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default ClienteForm;
