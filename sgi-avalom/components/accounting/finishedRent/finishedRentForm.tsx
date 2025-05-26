"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { useFinishedRentForm } from "@/hooks/accounting/finishedRent/useFinishedRentForm";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";

export const FinishedRentForm = () => {
  const { form, handleFinishSubmit, isSubmitting } = useFinishedRentForm();
  const router = useRouter();

  const handleFormSubmit = async (data: any) => {
    try {
      await handleFinishSubmit(data);
      toast.success("Éxito", {
        description: "Alquiler finalizado correctamente",
      });
      router.push("/accounting");
    } catch (error: any) {
      toast.error("Error", {
        description:
          error.message ||
          "Ocurrió un error inesperado. Por favor, inténtelo de nuevo.",
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
            <CardTitle className="text-xl font-semibold">
              Finalizar Alquiler
            </CardTitle>
            <CardDescription>
              Aquí puedes finalizar el alquiler y registrar los datos de la
              devolución. En caso de que no haya castigo, dejar los campos de
              castigo vacíos.
            </CardDescription>
          </CardHeader>

          <CardContent>
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
                        placeholder="₡"
                        type="number"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="depo_descmontodevuelto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del monto devuelto</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ej: devolución por meses adelantados"
                        disabled={isSubmitting}
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
                        placeholder="₡"
                        type="number"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="depo_descrmontocastigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del castigo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ej: daños a la propiedad"
                        disabled={isSubmitting}
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de devolución</FormLabel>
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
                            {field.value ? (
                              format(parseISO(field.value), "PPP", {
                                locale: es,
                              })
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
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
              )}
              Finalizar Alquiler
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
