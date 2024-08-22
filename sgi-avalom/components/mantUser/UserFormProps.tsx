"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import useUserStore from "@/lib/zustand/userStore";
import { User } from "@/lib/types";

// Define schema using zod
const userFormSchema = z.object({
  usu_nombre: z
    .string()
    .min(1, "Nombre es requerido")
    .max(30, "El nombre no puede tener más de 30 caracteres"),
  usu_papellido: z
    .string()
    .min(1, "Primer Apellido es requerido")
    .max(30, "El primer apellido no puede tener más de 30 caracteres"),
  usu_sapellido: z
    .string()
    .max(30, "El segundo apellido no puede tener más de 30 caracteres"),
  usu_cedula: z
    .string()
    .min(1, "Cédula es requerida")
    .max(15, "La cédula no puede tener más de 15 caracteres"),
  usu_telefono: z
    .string()
    .max(15, "El teléfono no puede tener más de 15 caracteres"),
  usu_correo: z
    .string()
    .min(1, "Correo es requerido")
    .email("Correo no válido")
    .max(50, "El correo no puede tener más de 50 caracteres"),
  usu_contrasena: z
    .string()
    .min(1, "Contraseña es requerida")
    .max(500, "La contraseña no puede tener más de 30 caracteres"),
  usu_estado: z.enum(["A", "I"]),
  usu_rol: z.enum(["A", "J", "E", "R"]),
});

interface UserFormProps {
  action: "create" | "edit" | "view";
  entity?: User;
  onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ action, entity, onSuccess }) => {
  const { addUser, updateUser } = useUserStore((state) => ({
    addUser: state.addUser,
    updateUser: state.updateUser,
  }));

  const defaultValues = entity || {
    usu_nombre: "",
    usu_papellido: "",
    usu_sapellido: "",
    usu_cedula: "",
    usu_telefono: "",
    usu_correo: "",
    usu_contrasena: "",
    usu_estado: "A",
    usu_rol: "R",
  };

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });

  const { handleSubmit } = form;

  const onSubmit = async (formData: z.infer<typeof userFormSchema>) => {
    try {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (action === "create") {
        const response = await axios.post("/api/users", formData, { headers });
        if (response.data) {
          addUser(response.data);
          onSuccess();
        }
      } else if (action === "edit" && entity?.usu_id) {
        const response = await axios.put(
          `/api/users/${entity.usu_id}`,
          formData,
          { headers }
        );
        if (response.data) {
          updateUser(response.data);
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error al guardar el usuario:", error);
      const errorMessage = error.response?.data?.error || "Error desconocido";
      console.error("Error al guardar el usuario: " + errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
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
        {(action === "create" || action === "edit") && (
          <FormField
            control={form.control}
            name="usu_contrasena"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input {...field} type="password" maxLength={30} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
                  disabled={action === "view"}
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
          <div className="pt-4 m-3">
            <Button type="submit">
              {action === "create" ? "Crear Usuario" : "Guardar Cambios"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default UserForm;
