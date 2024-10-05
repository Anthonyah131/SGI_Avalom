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
import { useState } from "react";

const RentalForm: React.FC<RentalFormProps> = ({ action, onSuccess }) => {
  const {
    form,
    handleSubmit,
    onSubmit,
    handleClear,
    handleFileSelect,
    handleClientSelect,
    handleClientRemove,
    isFormDisabled,
    clients,
    selectedRental,
  } = useRentalForm({ action, onSuccess });

  const [resetFile, setResetFile] = useState(false);

  // Llamar a setResetFile(true) después de guardar exitosamente para resetear el uploader
  const handleFormSubmit = async (data: any) => {
    await handleSubmit(onSubmit)(data);
    setResetFile(true); // Resetear el archivo después de guardar
  };

  const onClear = () => {
    setResetFile(true);
    handleClear();
  };

  const onResetComplete = () => {
    setResetFile(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleFormSubmit}
        className="grid grid-cols-2 gap-4 m-3"
      >
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
                        "w-[240px] pl-3 text-left font-normal",
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
                    selected={field.value ? parseISO(field.value) : undefined}
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
          name="alq_contrato"
          render={() => (
            <FormItem>
              <FormLabel>Contrato</FormLabel>
              <FileUploader
                disabled={isFormDisabled || action === "view"}
                onFileSelect={handleFileSelect}
                resetFile={resetFile}
                onResetComplete={onResetComplete}
                existingFileUrl={selectedRental?.alq_contrato}
              />
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

        {action !== "create" && (
          <div className="col-span-2">
            <FormLabel>Agregar Clientes</FormLabel>
            <ClientComboBox
              clients={clients}
              onClientSelect={handleClientSelect}
              disabled={isFormDisabled}
            />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedRental?.ava_clientexalquiler.map(({ ava_cliente }) => (
                <Card key={ava_cliente.cli_id} className="relative p-3">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-sm font-medium">
                      {ava_cliente.cli_nombre} {ava_cliente.cli_papellido}
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">
                      {ava_cliente.cli_cedula}
                    </CardDescription>
                  </CardHeader>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 p-0 m-0"
                    onClick={() => handleClientRemove(ava_cliente.cli_id)}
                    disabled={isFormDisabled}
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 col-span-2">
          <Button type="submit" className="mt-4" disabled={isFormDisabled}>
            Guardar
          </Button>
          <Button type="button" onClick={onClear} className="mt-4">
            Limpiar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RentalForm;
