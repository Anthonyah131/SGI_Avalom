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
import { RentalFormProps } from "@/lib/typesForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { X, CalendarIcon } from "lucide-react";
import { ClientComboBox } from "./ClientComboBox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useRentalForm } from "@/hooks/mantBuild/useRentalForm";
import FileUploader from "@/components/ui/fileUploader";
import React from "react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2Icon } from "lucide-react";

const RentalForm: React.FC<RentalFormProps> = ({ action, onSuccess }) => {
  const {
    form,
    onSubmit,
    handleSubmit,
    handleClear,
    handleClientSelect,
    handleClientRemove,
    isFormDisabled,
    clients,
    clientsInRental,
    selectedRental,
  } = useRentalForm({ action, onSuccess });

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
            ? "Alquiler creado exitosamente."
            : "Alquiler actualizado exitosamente.",
        typet: "success",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Ocurrió un error al guardar el Alquiler.",
        typet: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {action === "create" ? "Nuevo Alquiler" : "Editar Alquiler"}
            </CardTitle>
            <CardDescription>
              {action === "create"
                ? "Ingrese los detalles del nuevo alquiler"
                : "Modifique los detalles del alquiler"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="alq_monto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isFormDisabled || action === "view"}
                      maxLength={20}
                      className="bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alq_fechapago"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Pago</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isFormDisabled || action === "view"}
                        >
                          {field.value ? (
                            format(parseISO(field.value), "PPP", { locale: es })
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? parseISO(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(
                            date ? date.toISOString().split("T")[0] : ""
                          )
                        }
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                      disabled={isFormDisabled || action === "view"}
                    >
                      <SelectTrigger className="w-full bg-background">
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
          </CardContent>
          {action !== "create" && (
            <CardContent>
              <FormLabel>Agregar Clientes</FormLabel>
              <ClientComboBox
                clients={clients}
                onClientSelect={handleClientSelect}
                disabled={isFormDisabled}
              />
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {clientsInRental.map((client) => (
                  <Card
                    key={client.cli_id}
                    className="relative p-3 bg-background"
                  >
                    <CardHeader className="p-0 mb-2">
                      <CardTitle className="text-sm font-medium">
                        {client.cli_nombre} {client.cli_papellido}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {client.cli_cedula}
                      </CardDescription>
                    </CardHeader>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 p-0 m-0"
                      onClick={() => handleClientRemove(client.cli_id)}
                      disabled={isFormDisabled}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
        {action !== "create" && (
          <Card className="bg-background">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Contrato</CardTitle>
              <CardDescription>Adjuntar contrato del alquiler</CardDescription>
            </CardHeader>
            <CardContent>
              <FormItem className="col-span-full">
                <FormLabel>Contrato</FormLabel>
                <FileUploader
                  disabled={isFormDisabled || action === "view"}
                  selectedRental={selectedRental}
                />
                <FormMessage />
              </FormItem>
            </CardContent>
          </Card>
        )}
        {action !== "view" && (
          <div className="col-span-2 flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {action === "create" ? "Crear Alquiler" : "Guardar Cambios"}
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

export default RentalForm;
