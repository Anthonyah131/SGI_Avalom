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
import { BuildFormProps } from "@/lib/typesForm";
import { useBuildForm } from "@/hooks/mantBuild/useBuildForm";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

const BuildForm: React.FC<BuildFormProps> = ({
  action,
  building,
  onSuccess,
}) => {
  const { form, handleSubmit, onSubmit, handleClear } = useBuildForm({
    action,
    building,
    onSuccess,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      await onSubmit(data);
      toast.success("Exito", {
        description:
          action === "create"
            ? "Edificio creado exitosamente."
            : "Edificio actualizado exitosamente.",
      });

      onSuccess();
    } catch (error: any) {
      toast.error("Error", {
        description:
          error.message || "Ocurrió un error al guardar el Edificio.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
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
          <div className="col-span-2 flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {action === "create" ? "Crear Edificio" : "Guardar Cambios"}
            </Button>
            {action !== "edit" && (
              <Button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                variant="outline"
              >
                Limpiar
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  );
};

export default BuildForm;
