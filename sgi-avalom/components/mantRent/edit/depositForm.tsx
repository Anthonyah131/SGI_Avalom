"use client";

import React, { useState } from "react";
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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2Icon } from "lucide-react";
import { useDepositForm } from "@/hooks/mantRent/useDepositForm";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currencyConverter";

const DepositForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { form, onSubmit, isFormDisabled, isEditing, deposit } =
    useDepositForm();

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      toast.success("Depósito guardado con éxito");
      onSuccess();
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Error al guardar el depósito",
      });
    } finally {
      setIsLoading(false);
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
            <CardTitle className="text-xl text-primary font-bold">
              Depósito
            </CardTitle>
            <CardDescription>
              {isEditing ? "Edite el depósito del alquiler" : "Cree un nuevo depósito para el alquiler"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.isArray(deposit?.ava_pago) &&
              deposit?.ava_pago.length > 0 && (
                <Alert className="border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
                  <AlertTitle className="text-yellow-800 dark:text-yellow-100">
                    No se puede modificar
                  </AlertTitle>
                  <AlertDescription className="text-yellow-700 dark:text-yellow-200">
                    Este depósito tiene pagos asociados y no puede ser
                    modificado.
                  </AlertDescription>
                </Alert>
              )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="depo_total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Total del Depósito</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Ingrese el monto total"
                        disabled={isFormDisabled || isLoading}
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {deposit && (
                <FormItem>
                  <FormLabel>Monto Actual del Depósito</FormLabel>
                  <Input
                    value={formatCurrency(Number(deposit.depo_montoactual))}
                    disabled
                    className="bg-muted font-semibold"
                  />
                </FormItem>
              )}
            </div>
            
            {!isFormDisabled && (
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
                  {isEditing ? "Actualizar Depósito" : "Crear Depósito"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default DepositForm;
