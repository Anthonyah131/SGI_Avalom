import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useMonthlyRentForm } from "@/hooks/mantRent/useMonthlyRentForm";
import { Loader2Icon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { convertToCostaRicaTime, convertToUTC } from "@/utils/dateUtils";

const MonthlyRentForm: React.FC<{
  action: "create" | "edit";
  alqmId?: string | null;
  mode: "view" | "create";
  onSuccess: () => void;
}> = ({ action, alqmId, mode, onSuccess }) => {
  const { form, handleSubmit, onSubmit } = useMonthlyRentForm({
    action,
    alqm_id: alqmId,
    mode,
    onSuccess,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      toast.success(alqmId ? "Alquiler actualizado" : "Alquiler creado");
      onSuccess();
    } catch (error: any) {
      toast.error("Error", {
        description: error.message
          ? error.message
          : "Error al guardar el alquiler",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="bg-background grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="alqm_identificador"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identificador</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alqm_montototal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto Total</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alqm_fechainicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value
                          ? convertToCostaRicaTime(field.value)
                          : "Seleccione una fecha"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    sideOffset={-40}
                  >
                    <Calendar
                      mode="single"
                      selected={field.value ? parseISO(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(
                          date ? convertToUTC(date.toISOString()) : ""
                        )
                      }
                      disabled={(date) =>
                        date < new Date("1900-01-01")
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
            name="alqm_fechafin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value
                          ? convertToCostaRicaTime(field.value)
                          : "Seleccione una fecha"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    sideOffset={-40}
                  >
                    <Calendar
                      mode="single"
                      selected={field.value ? parseISO(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(
                          date ? convertToUTC(date.toISOString()) : ""
                        )
                      }
                      disabled={(date) =>
                        date < new Date("1900-01-01")
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
            name="alqm_fechapago"
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
                        disabled={isLoading}
                      >
                        {field.value
                          ? convertToCostaRicaTime(field.value)
                          : "Seleccione una fecha"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? parseISO(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(
                          date ? convertToUTC(date.toISOString()) : ""
                        )
                      }
                      disabled={(date) =>
                        date < new Date("1900-01-01")
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
            name="alqm_estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Atrasado</SelectItem>
                      <SelectItem value="P">Pagado</SelectItem>
                      <SelectItem value="I">Incompleto</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MonthlyRentForm;
