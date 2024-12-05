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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PropertyFormProps } from "@/lib/typesForm";
import { usePropertyForm } from "@/hooks/mantBuild/usePropertyForm";
import { CardFooter } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon } from "lucide-react";

const PropertyForm: React.FC<PropertyFormProps> = ({
  action,
  property,
  entity,
  onSuccess,
}) => {
  const { form, handleSubmit, onSubmit, handleClear, types } = usePropertyForm({
    action,
    property,
    entity,
    onSuccess,
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      await onSubmit(data);
      toast({
        title: "Éxito",
        description:
          action === "create"
            ? "Propiedad creada exitosamente."
            : "Propiedad actualizada exitosamente.",
        typet: "success",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Ocurrió un error al guardar la Propiedad.",
        typet: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="prop_identificador"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identificador</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={action === "view"}
                    className="bg-background"
                  />
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
                  <Input
                    {...field}
                    disabled={action === "view"}
                    className="bg-background"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipp_id"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Tipo de Propiedad</FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => field.onChange(value)}
                    disabled={action === "view"}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Seleccionar Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.tipp_id} value={type.tipp_id}>
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
        </div>
        {action !== "view" && (
          <div className="col-span-2 flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {action === "create" ? "Crear Propiedad" : "Guardar Cambios"}
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

export default PropertyForm;
