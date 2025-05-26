import { useState } from "react";
import {
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  UnlockIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useUser } from "@/lib/UserContext";
import { UserFormProps } from "@/lib/typesForm";
import { useUserForm } from "@/hooks/mantUser/useUserForm";

const UserForm: React.FC<UserFormProps> = ({ action, entity, onSuccess }) => {
  const { form, handleSubmit, onSubmit, handleClear, disableRoleSelection } =
    useUserForm({ action, entity, onSuccess });
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await onSubmit(data);

      toast.success("Éxito", {
        description:
          action === "create"
            ? "Usuario creado exitosamente."
            : "Usuario actualizado exitosamente.",
      });

      onSuccess();
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Ocurrió un error al guardar el usuario.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordInput = () => {
    setShowPasswordInput(!showPasswordInput);
    if (!showPasswordInput) {
      setPasswordVisible(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-2 space-y-6">
        <div className="bg-background grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="usu_nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={action === "view"}
                    maxLength={30}
                  />
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
                  <Input
                    {...field}
                    disabled={action === "view"}
                    maxLength={30}
                  />
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
                  <Input
                    {...field}
                    disabled={action === "view"}
                    maxLength={30}
                  />
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
                  <Input
                    {...field}
                    disabled={action === "view"}
                    maxLength={15}
                  />
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
                  <Input
                    {...field}
                    disabled={action === "view"}
                    maxLength={15}
                  />
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
                  <Input
                    {...field}
                    disabled={action === "view"}
                    maxLength={50}
                  />
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
                <div className="relative flex items-center">
                  {!showPasswordInput && (
                    <button
                      type="button"
                      onClick={togglePasswordInput}
                      disabled={action === "view"}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {showPasswordInput ? (
                        <UnlockIcon className="h-4 w-4" />
                      ) : (
                        <LockIcon className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  {showPasswordInput && (
                    <div className="relative flex-1">
                      <Input
                        {...field}
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Ingresa una contraseña"
                        disabled={action === "view"}
                        className="pr-8"
                      />
                      <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {passwordVisible ? (
                            <EyeIcon className="h-4 w-4" />
                          ) : (
                            <EyeOffIcon className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={togglePasswordInput}
                          disabled={action === "view"}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {showPasswordInput ? (
                            <UnlockIcon className="h-4 w-4" />
                          ) : (
                            <LockIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
                      <SelectItem
                        disabled={
                          user?.usu_rol === "E" || user?.usu_rol === "R"
                        }
                        value="A"
                      >
                        Admin
                      </SelectItem>
                      <SelectItem
                        disabled={
                          user?.usu_rol === "A" ||
                          user?.usu_rol === "E" ||
                          user?.usu_rol === "R"
                        }
                        value="J"
                      >
                        Jefe
                      </SelectItem>
                      <SelectItem disabled={user?.usu_rol === "R"} value="E">
                        Empleado
                      </SelectItem>
                      <SelectItem value="R">Auditor</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
            <Button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              variant="green"
            >
              Limpiar
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default UserForm;
