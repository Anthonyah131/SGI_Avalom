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
import { useUserForm } from "@/hooks/mantUser/useUserForm";
import { UserFormProps } from "@/lib/typesForm";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";

const UserForm: React.FC<UserFormProps> = ({ action, entity, onSuccess }) => {
  const { form, handleSubmit, onSubmit, handleClear, disableRoleSelection } =
    useUserForm({ action, entity, onSuccess });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      await onSubmit(data);

      toast({
        title: "Éxito",
        description:
          action === "create"
            ? "Usuario creado exitosamente."
            : "Usuario actualizado exitosamente.",
        typet: "success",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al guardar el usuario.",
        typet: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="grid grid-cols-2 gap-4 m-3"
      >
        <FormField
          control={form.control}
          name="usu_nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={30} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usu_papellido"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primer Apellido</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={30} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usu_sapellido"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Segundo Apellido</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={30} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usu_cedula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cédula</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={15} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usu_telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={15} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usu_correo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input {...field} disabled={action === "view"} maxLength={50} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usu_contrasena"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Ingresa una contraseña"
                  disabled={action === "view"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usu_estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={action === "view"}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Activo</SelectItem>
                    <SelectItem value="I">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="usu_rol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disableRoleSelection || action === "view"}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Admin</SelectItem>
                    <SelectItem value="J">Jefe</SelectItem>
                    <SelectItem value="E">Empleado</SelectItem>
                    <SelectItem value="R">Auditor</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {action !== "view" && (
          <div className="col-span-2 flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {action === "create" ? "Crear Usuario" : "Guardar Cambios"}
            </Button>
            {action !== "edit" && (
              <Button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                variant="outline"
              >
                Limpiar
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  );
};

export default UserForm;
