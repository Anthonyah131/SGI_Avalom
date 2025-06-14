import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import React from "react";
import { useState } from "react";
import {
  Loader2Icon,
  AlertCircle,
  X,
  CalendarIcon,
  CreditCard,
  User,
} from "lucide-react";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ClientComboBox } from "./ClientComboBox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import FileUploader from "@/components/ui/fileUploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RentalFormProps } from "@/lib/typesForm";
import { useRentalForm } from "@/hooks/mantBuild/useRentalForm";
import { formatToCR } from "@/utils/dateUtils";
import { Badge } from "@/components/ui/badge";

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
  const getFullName = (client: any) => {
    return `${client.cli_nombre} ${client.cli_papellido} ${
      client.cli_sapellido || ""
    }`.trim();
  };

  const getInitials = (client: any) => {
    const nombre = client.cli_nombre.charAt(0).toUpperCase();
    const apellido = client.cli_papellido.charAt(0).toUpperCase();
    return `${nombre}${apellido}`;
  };

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
                          {field.value
                            ? formatToCR(field.value)
                            : "Seleccione una fecha"}
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
              <div className="flex flex-wrap gap-4">
                {clientsInRental.map((client) => (
                  <Card
                    key={client.cli_id}
                    className="group relative w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.5rem)] min-w-[220px] transition-all duration-200 hover:shadow-md hover:shadow-primary/5 border-border/50 hover:border-primary/20 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                    <CardHeader className="relative p-4 pb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                          <span className="text-sm font-semibold text-primary">
                            {getInitials(client)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <CardTitle className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors duration-200 break-words line-clamp-3">
                            {getFullName(client)}
                          </CardTitle>

                          <div className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <CardDescription className="text-xs font-medium break-all text-muted-foreground">
                              {client.cli_cedula}
                            </CardDescription>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end justify-end mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleClientRemove(client.cli_id)}
                          disabled={isFormDisabled}
                        >
                          <X className="w-4 h-4" />
                          <span className="sr-only">Remover cliente</span>
                        </Button>
                      </div>
                    </CardHeader>
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
