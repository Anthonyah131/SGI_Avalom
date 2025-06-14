"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { usePaymentForm } from "@/hooks/accounting/monthlyRentPayment/usePaymentForm";
import { toast } from "sonner";
import {
  convertToCostaRicaTime,
  convertToUTC,
  formatToCR,
} from "@/utils/dateUtils";

type PaymentFormProps = {};

export function PaymentForm({
  amountToPay,
  setAmountToPay,
}: {
  amountToPay: string;
  setAmountToPay: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { form, handlePaymentSubmit, isSubmitting } = usePaymentForm();

  const handleFormSubmit = async (data: any) => {
    try {
      const paymentAmount = Number(amountToPay);
      if (paymentAmount <= 0) {
        throw new Error("El monto a pagar debe ser mayor a 0.");
      }
      await handlePaymentSubmit({ ...data, amountToPay: paymentAmount });
      toast.success("Pago realizado con éxito.");
      setAmountToPay("");
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Error al realizar el pago.");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary font-semibold">
              Detalles del Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pag_fechapago"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Fecha de pago</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
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
              name="pag_cuenta"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Cuenta</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese la cuenta"
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pag_banco"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Banco</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese el banco"
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pag_metodopago"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Método de Pago</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese el método de pago"
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pag_referencia"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Referencia</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese la referencia"
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="pag_descripcion"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Ingrese la descripción del pago"
                        rows={4}
                        disabled={isSubmitting}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-between items-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            {isSubmitting && <Loader2Icon className="h-4 w-4 animate-spin" />}
            Guardar Pago
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
