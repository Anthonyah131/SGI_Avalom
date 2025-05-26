"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCanceledRentForm } from "@/hooks/accounting/canceledRent/useCanceledRentForm";
import { Loader2Icon, CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

export const CanceledRentForm = () => {
  const { form, handleCancelSubmit, isSubmitting } = useCanceledRentForm();
  const router = useRouter();

  const handleFormSubmit = async (data: any) => {
    try {
      await handleCancelSubmit(data);
      toast.success("Alquiler cancelado correctamente");
      router.push("/accounting");
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
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
            <CardTitle>Cancelar Alquiler</CardTitle>
            <CardDescription>
              Aquí puedes cancelar un alquiler. Asegúrate de detallar los
              motivos y montos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Sección del Depósito */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  Datos del Depósito
                </h3>
                <FormDescription className="text-muted-foreground">
                  Detalla cómo se devuelve o castiga el monto del depósito. El
                  total no puede exceder el depósito actual.
                </FormDescription>
                <Separator className="my-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="depo_montodevuelto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto devuelto</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          disabled={isSubmitting}
                          placeholder="₡"
                        />
                      </FormControl>
                      <FormDescription>Ej: 100000</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="depo_descmontodevuelto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción monto devuelto</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting}
                          placeholder=" Ej: devolución por meses adelantados"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="depo_montocastigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto castigo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          disabled={isSubmitting}
                          placeholder="₡"
                        />
                      </FormControl>
                      <FormDescription>
                        Solo si aplica una penalización
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="depo_descrmontocastigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción castigo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting}
                          placeholder="Ej: penalización por daños"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="depo_fechadevolucion"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Fecha de devolución del depósito</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                            >
                              {field.value
                                ? format(parseISO(field.value), "PPP", {
                                    locale: es,
                                  })
                                : "Seleccionar fecha"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? parseISO(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(
                                date?.toISOString().split("T")[0] ?? ""
                              )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sección del Alquiler Cancelado */}
            <div className="space-y-4 pt-6">
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  Detalles de Cancelación
                </h3>
                <FormDescription className="text-muted-foreground">
                  Información que se registra cuando se cancela formalmente el
                  alquiler.
                </FormDescription>
                <Separator className="my-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="alqc_motivo"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Motivo de cancelación</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting}
                          placeholder="Ej: cliente no pagó"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alqc_montodevuelto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto devuelto registrado</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          disabled={isSubmitting}
                          placeholder="₡"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alqc_motivomontodevuelto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo monto devuelto</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting}
                          placeholder="Ej: devolución por meses adelantados"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alqc_castigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto castigo registrado</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          disabled={isSubmitting}
                          placeholder="₡"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alqc_motivocastigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo castigo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting}
                          placeholder="Ej: penalización por daños"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alqc_fecha_cancelacion"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Fecha de cancelación</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                            >
                              {field.value
                                ? format(parseISO(field.value), "PPP", {
                                    locale: es,
                                  })
                                : "Seleccionar fecha"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? parseISO(field.value) : undefined
                            }
                            onSelect={(date) =>
                              field.onChange(
                                date?.toISOString().split("T")[0] ?? ""
                              )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
              )}
              Cancelar Alquiler
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
