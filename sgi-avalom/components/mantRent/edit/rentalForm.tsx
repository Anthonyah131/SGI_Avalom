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
import { X, CalendarIcon, AlertCircle } from "lucide-react";
import { ClientComboBox } from "@/components/mantBuild/mantProperty/mantRent/ClientComboBox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useRentalForm } from "@/hooks/mantRent/useRentalForm";
import FileUploader from "@/components/ui/fileUploader";
import React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    disableEstadoField,
  } = useRentalForm({ action, onSuccess });

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      await onSubmit(data);
      toast.success("Éxito", {
        description: "Alquiler actualizado exitosamente.",
      });

      onSuccess();
    } catch (error: any) {
      toast.error("Error", {
        description:
          error.message || "Ocurrió un error al guardar el Alquiler.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Card único que contiene Editar Alquiler y Clientes */}
        <Card>
          {disableEstadoField && (
            <div className="p-4 pb-0">
              <Alert
                variant="default"
                className="border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800"
              >
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-100">
                  Este alquiler tiene pagos registrados. El estado solo puede
                  modificarse desde la vista de <strong>Contabilidad</strong>.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="text-xl text-primary font-bold">
              Editar Alquiler
            </CardTitle>
            <CardDescription>
              Modifique los detalles del alquiler y gestione los clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="alq_monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Mensual</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isFormDisabled}
                        maxLength={20}
                        className="bg-background"
                        placeholder="Ingrese el monto"
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
                  <FormItem>
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
                            disabled={isFormDisabled}
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
                          defaultMonth={
                            field.value ? parseISO(field.value) : new Date()
                          }
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
                    <FormLabel>Estado del Alquiler</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isFormDisabled || disableEstadoField}
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
            </div>

            {/* Sección de Clientes dentro del mismo card */}
            {action !== "create" && (
              <div className="pt-6 border-t space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Clientes Asociados
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Agregue o elimine clientes de este alquiler
                  </p>
                </div>
                <div>
                  <FormLabel>Agregar Cliente</FormLabel>
                  <ClientComboBox
                    clients={clients}
                    onClientSelect={handleClientSelect}
                    disabled={isFormDisabled}
                  />
                </div>
                {clientsInRental.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clientsInRental.map((client) => (
                      <Card 
                        key={client.cli_id} 
                        className="relative p-3 hover:shadow-md transition-shadow border-2"
                      >
                        <CardHeader className="p-0 mb-2">
                          <CardTitle className="text-sm font-medium truncate">
                            {client.cli_nombre} {client.cli_papellido}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {client.cli_cedula}
                          </CardDescription>
                        </CardHeader>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 hover:bg-red-100 dark:hover:bg-red-900"
                          onClick={() => handleClientRemove(client.cli_id)}
                          disabled={isFormDisabled}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {action !== "view" && (
          <div className="col-span-2 flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
            {action !== "edit" && (
              <Button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                variant="green"
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
