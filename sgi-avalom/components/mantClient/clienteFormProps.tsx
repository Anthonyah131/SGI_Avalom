import * as React from "react";
import { useState } from "react";
import { Cliente } from "@/lib/types";
import axios from "axios";
import cookie from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import useClientStore from "@/lib/clientStore";

interface ClienteFormProps {
  action: "create" | "edit" | "view";
  cliente?: Cliente;
  onSuccess?: () => void;
}

const ClienteForm: React.FC<ClienteFormProps> = ({
  action,
  cliente,
  onSuccess,
}) => {
  const initialFormData = cliente || {
    cli_nombre: "",
    cli_papellido: "",
    cli_sapellido: "",
    cli_cedula: "",
    cli_telefono: "",
    cli_correo: "",
  };
  const [formData, setFormData] = useState<Partial<Cliente>>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const { addClient, updateClient } = useClientStore((state) => ({
    addClient: state.addClient,
    updateClient: state.updateClient,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const response = await axios.post("/api/client", formData, { headers });
        if (response.data) {
          addClient(response.data);
          console.log("Cliente creado:", response.data);
          onSuccess && onSuccess();
        }
      } else if (action === "edit") {
        const response = await axios.put(
          `/api/client/${formData.cli_id}`,
          formData,
          { headers }
        );
        if (response.data) {
          updateClient(response.data);
          console.log("Cliente Actualizado:", response.data);
          onSuccess && onSuccess();
        }
      }
    } catch (error) {
      setError("Error al guardar el cliente: " + error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cli_nombre">Nombre</Label>
          <Input
            id="cli_nombre"
            name="cli_nombre"
            type="text"
            value={formData.cli_nombre}
            onChange={handleChange}
            required
            disabled={action === "view"}
          />
        </div>
        <div>
          <Label htmlFor="cli_papellido">Primer Apellido</Label>
          <Input
            id="cli_papellido"
            name="cli_papellido"
            type="text"
            value={formData.cli_papellido}
            onChange={handleChange}
            required
            disabled={action === "view"}
          />
        </div>
        <div>
          <Label htmlFor="cli_sapellido">Segundo Apellido</Label>
          <Input
            id="cli_sapellido"
            name="cli_sapellido"
            type="text"
            value={formData.cli_sapellido}
            onChange={handleChange}
            disabled={action === "view"}
          />
        </div>
        <div>
          <Label htmlFor="cli_cedula">Cédula</Label>
          <Input
            id="cli_cedula"
            name="cli_cedula"
            type="text"
            value={formData.cli_cedula}
            onChange={handleChange}
            required
            disabled={action === "view"}
          />
        </div>
        <div>
          <Label htmlFor="cli_telefono">Teléfono</Label>
          <Input
            id="cli_telefono"
            name="cli_telefono"
            type="text"
            value={formData.cli_telefono}
            onChange={handleChange}
            disabled={action === "view"}
          />
        </div>
        <div>
          <Label htmlFor="cli_correo">Correo</Label>
          <Input
            id="cli_correo"
            name="cli_correo"
            type="email"
            value={formData.cli_correo}
            onChange={handleChange}
            disabled={action === "view"}
          />
        </div>
      </div>
      {action !== "view" && (
        <div className="pt-4">
          <Button type="submit">
            {action === "create" ? "Crear Cliente" : "Guardar Cambios"}
          </Button>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default ClienteForm;
