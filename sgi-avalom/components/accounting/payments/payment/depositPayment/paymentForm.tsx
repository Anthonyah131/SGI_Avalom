"use client";

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
import { Loader2Icon } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { usePaymentForm } from "@/hooks/accounting/depositPayment/usePaymentForm";


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
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="pag_cuenta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuenta *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese la cuenta"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pag_descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ingrese la descripción del pago"
                      rows={4}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
