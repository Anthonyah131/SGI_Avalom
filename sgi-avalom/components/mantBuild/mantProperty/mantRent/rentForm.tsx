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
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
        description:
          action === "create"
            ? "Alquiler creado exitosamente."
            : "Alquiler actualizado exitosamente.",
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
        {disableEstadoField && (
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
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary font-bold">
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
                        disabled={(date) => date < new Date("1900-01-01")}
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
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={
                        isFormDisabled ||
                        action === "view" ||
                        disableEstadoField
                      }
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
                  <Card key={client.cli_id} className="relative p-3">
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
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  Contrato
                </CardTitle>
                <CardDescription>
                  Adjuntar contrato del alquiler
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    const values = form.getValues();
                    const client = clientsInRental[0];

                    if (!client) {
                      toast.warning("Debe seleccionar un cliente primero.");
                      return;
                    }

                    const payload = {
                      arrendante: "Cesar Avila Prado",
                      cedulaArrendante: "1-0938-0196",
                      arrendatario: `${client.cli_nombre} ${client.cli_papellido}`,
                      cedulaArrendatario: client.cli_cedula,
                      estadoCivil: client.cli_estadocivil ?? "Desconocido",
                      direccion: client.cli_direccion ?? "Desconocida",
                      aptoNumero:
                        selectedRental?.ava_propiedad?.prop_identificador ??
                        "n/a",
                      contratoDesde: values.alq_fechapago,
                      contratoHasta: "",
                      montoTotal: Number(values.alq_monto),
                      diaPago: new Date(values.alq_fechapago).getDate(),
                      duracionAnios: 3,
                    };

                    const res = await fetch("/api/generate-contract", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });

                    if (!res.ok)
                      throw new Error("No se pudo generar el contrato");

                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `contrato_${payload.aptoNumero}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                    toast.success("Contrato generado correctamente.");
                  } catch (err) {
                    console.error(err);
                    toast.error("Ocurrió un error al generar el contrato.");
                  }
                }}
              >
                Generar Contrato
              </Button>
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
            <Button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              variant="green"
            >
              Limpiar
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default RentalForm;
