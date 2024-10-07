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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PropertyForm: React.FC<PropertyFormProps> = ({
  action,
  property,
  entity,
  onSuccess,
}) => {
  const { form, handleSubmit, onSubmit, handleClear, error, types } =
    usePropertyForm({ action, property, entity, onSuccess });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    onValueChange={(value) =>
                      field.onChange(parseInt(value, 10))
                    }
                    disabled={action === "view"}
                  >
                    <SelectTrigger className="w-full bg-background">
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
        </div>
        {action !== "view" && (
          <CardFooter className="flex justify-between">
            <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
              {action === "create" ? "Crear Propiedad" : "Guardar Cambios"}
            </Button>
            {action !== "edit" && (
              <Button type="button" onClick={handleClear} variant="outline">
                Limpiar
              </Button>
            )}
          </CardFooter>
        )}
      </form>
    </Form>
  );
};

export default PropertyForm;
