"use client";

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
import { useClientForm } from "@/hooks/mantClient/useClientForm";
import { ClienteFormProps } from "@/lib/typesForm";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ClienteForm: React.FC<ClienteFormProps> = ({
  action,
  entity,
  onSuccess,
}) => {
  const { form, handleSubmit, onSubmit, handleClear } = useClientForm({
    action,
    entity,
    onSuccess,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      await onSubmit(data);

      toast.success("Éxito", {
        description:
          action === "create"
            ? "Cliente creado exitosamente."
            : "Cliente actualizado exitosamente.",
      });

      onSuccess();
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Ocurrió un error al guardar el cliente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="grid grid-cols-2 gap-4"
      >
        <FormField
          control={form.control}
          name="cli_nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isLoading || action === "view"}
                  maxLength={30}
                />
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
                <Input
                  {...field}
                  disabled={isLoading || action === "view"}
                  maxLength={30}
                />
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
                <Input
                  {...field}
                  disabled={isLoading || action === "view"}
                  maxLength={30}
                />
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
                <Input
                  {...field}
                  disabled={isLoading || action === "view"}
                  maxLength={15}
                />
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
                <Input
                  {...field}
                  disabled={isLoading || action === "view"}
                  maxLength={15}
                />
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
                <Input
                  {...field}
                  disabled={isLoading || action === "view"}
                  maxLength={50}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {action !== "view" && (
          <div className="col-span-2 flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {action === "create" ? "Crear Cliente" : "Guardar Cambios"}
            </Button>
            <Button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              variant="outline"
            >
              Limpiar
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default ClienteForm;
