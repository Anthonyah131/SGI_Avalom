"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { formatCurrency } from "@/utils/currencyConverter";
import { convertToCostaRicaTime, formatToCR } from "@/utils/dateUtils";
import { useUser } from "@/lib/UserContext";
import { useCancelPaymentForm } from "@/hooks/accounting/depositPayment/useCancelPaymentForm";
import { CancelPaymentFormProps } from "@/lib/typesForm";
import { Loader2Icon } from "lucide-react";

export function CancelPaymentForm({
  payment,
  onSuccess,
}: CancelPaymentFormProps) {
  const { user } = useUser();
  const { form, onSubmit, handleSubmit } = useCancelPaymentForm({
    payment,
    onSuccess,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await onSubmit({ ...data, usu_id: user?.usu_id });
      toast.success("Pago anulado correctamente");
    } catch (error: any) {
      toast.success("Error", {
        description: error.message ? error.message : error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary font-semibold">
              Detalles del Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">ID del Pago:</span>{" "}
                {payment.pag_id}
              </div>
              <div>
                <span className="font-semibold">Monto:</span>{" "}
                {formatCurrency(Number(payment.pag_monto))}
              </div>
              <div>
                <span className="font-semibold">Fecha de Pago:</span>{" "}
                {formatToCR(payment.pag_fechapago)}
              </div>
              <div>
                <span className="font-semibold">Estado:</span>{" "}
                {payment.pag_estado === "A" ? "Activo" : "Anulado"}
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Descripción Original:</span>
                <p className="mt-1">{payment.pag_descripcion}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="anp_motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo de Anulación</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese el motivo de la anulación"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="anp_descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción de Anulación</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ingrese la descripción de la anulación"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading} variant="destructive">
            {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
            Anular Pago
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
