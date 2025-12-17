"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { serviceFormSchema, type ServiceFormValues } from "@/lib/schemas/expenseSchemas";
import type { AvaServicio } from "@/lib/types/entities";

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: AvaServicio | null;
  onSubmit: (data: ServiceFormValues) => Promise<void>;
  existingCodes: string[];
}

export function ServiceFormDialog({ open, onOpenChange, service, onSubmit, existingCodes }: ServiceFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!service;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      ser_codigo: "",
      ser_nombre: "",
      ser_servicio: "",
      ser_negocio: "",
      ser_mediopago: "",
    },
  });

  useEffect(() => {
    if (service) {
      form.reset({
        ser_codigo: service.ser_codigo,
        ser_nombre: service.ser_nombre,
        ser_servicio: service.ser_servicio || "",
        ser_negocio: service.ser_negocio || "",
        ser_mediopago: service.ser_mediopago || "",
      });
    } else {
      form.reset({
        ser_codigo: "",
        ser_nombre: "",
        ser_servicio: "",
        ser_negocio: "",
        ser_mediopago: "",
      });
    }
  }, [service, form, open]);

  const handleSubmit = async (data: ServiceFormValues) => {
    // Check for duplicate code
    if (!isEditing || data.ser_codigo !== service?.ser_codigo) {
      if (existingCodes.includes(data.ser_codigo)) {
        form.setError("ser_codigo", {
          type: "manual",
          message: "Este código ya está en uso",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting service:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Servicio" : "Nuevo Servicio"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza la información del servicio"
              : "Completa el formulario para registrar un nuevo servicio"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="ser_codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="LUZ-001"
                        {...field}
                        maxLength={30}
                        className="font-mono"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Debe ser único (letras mayúsculas, números y guiones)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ser_nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Electricidad" {...field} maxLength={30} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ser_servicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Servicio</FormLabel>
                  <FormControl>
                    <Input placeholder="Luz, Agua, Internet, etc." {...field} maxLength={40} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ser_negocio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor/Negocio</FormLabel>
                  <FormControl>
                    <Input placeholder="ICE, AyA, Tigo, etc." {...field} maxLength={80} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ser_mediopago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medio de Pago</FormLabel>
                  <FormControl>
                    <Input placeholder="Transferencia, Débito automático, etc." {...field} maxLength={30} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {isEditing ? "Actualizar" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
