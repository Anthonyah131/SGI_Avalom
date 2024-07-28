import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import cookie from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
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
  usu_nombre: z.string().min(1, "Nombre es requerido"),
  usu_papellido: z.string().min(1, "Primer Apellido es requerido"),
  usu_sapellido: z.string().optional(),
  usu_cedula: z.string().min(1, "Cédula es requerida"),
  usu_telefono: z.string().optional(),
  usu_correo: z.string().email("Correo no válido"),
  usu_contrasena: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
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

  const [error, setError] = useState<string | null>(null);

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

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const onSubmit = async (formData: z.infer<typeof userFormSchema>) => {
    try {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
        setError("No hay token disponible");
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
        const response = await axios.put(`/api/users/${entity.usu_id}`, formData, { headers });
        if (response.data) {
          updateUser(response.data);
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error al guardar el usuario:", error);
      const errorMessage = error.response?.data?.error || "Error desconocido";
      setError("Error al guardar el usuario: " + errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-4 m-3">
        <div>
          <Label htmlFor="usu_nombre">Nombre</Label>
          <Controller
            name="usu_nombre"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="usu_nombre"
                type="text"
                required
                disabled={action === "view"}
              />
            )}
          />
          {errors.usu_nombre && <Alert variant="destructive">{errors.usu_nombre.message}</Alert>}
        </div>
        <div>
          <Label htmlFor="usu_papellido">Primer Apellido</Label>
          <Controller
            name="usu_papellido"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="usu_papellido"
                type="text"
                required
                disabled={action === "view"}
              />
            )}
          />
          {errors.usu_papellido && <Alert variant="destructive">{errors.usu_papellido.message}</Alert>}
        </div>
        <div>
          <Label htmlFor="usu_sapellido">Segundo Apellido</Label>
          <Controller
            name="usu_sapellido"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="usu_sapellido"
                type="text"
                disabled={action === "view"}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor="usu_cedula">Cédula</Label>
          <Controller
            name="usu_cedula"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="usu_cedula"
                type="text"
                required
                disabled={action === "view"}
              />
            )}
          />
          {errors.usu_cedula && <Alert variant="destructive">{errors.usu_cedula.message}</Alert>}
        </div>
        <div>
          <Label htmlFor="usu_telefono">Teléfono</Label>
          <Controller
            name="usu_telefono"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="usu_telefono"
                type="text"
                disabled={action === "view"}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor="usu_correo">Correo</Label>
          <Controller
            name="usu_correo"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="usu_correo"
                type="email"
                required
                disabled={action === "view"}
              />
            )}
          />
          {errors.usu_correo && <Alert variant="destructive">{errors.usu_correo.message}</Alert>}
        </div>
        <div>
          <Label htmlFor="usu_contrasena">Contraseña</Label>
          <Controller
            name="usu_contrasena"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="usu_contrasena"
                type="password"
                required
                disabled={action === "view"}
              />
            )}
          />
          {errors.usu_contrasena && <Alert variant="destructive">{errors.usu_contrasena.message}</Alert>}
        </div>
        <div>
          <Label htmlFor="usu_estado">Estado</Label>
          <Controller
            name="usu_estado"
            control={control}
            render={({ field }) => (
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
            )}
          />
          {errors.usu_estado && <Alert variant="destructive">{errors.usu_estado.message}</Alert>}
        </div>
        <div>
          <Label htmlFor="usu_rol">Rol</Label>
          <Controller
            name="usu_rol"
            control={control}
            render={({ field }) => (
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
            )}
          />
          {errors.usu_rol && <Alert variant="destructive">{errors.usu_rol.message}</Alert>}
        </div>
      </div>
      {action !== "view" && (
        <div className="pt-4 m-3">
          <Button type="submit">
            {action === "create" ? "Crear Usuario" : "Guardar Cambios"}
          </Button>
        </div>
      )}
      {error && <Alert variant="destructive">{error}</Alert>}
    </form>
  );
};

export default UserForm;
