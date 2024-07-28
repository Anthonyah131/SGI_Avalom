import { useEffect, useState } from "react";
import { AvaEdificio } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import useBuildingStore from "@/lib/zustand/buildStore";

interface BuildFormProps {
  action: "create" | "edit" | "view";
  building?: AvaEdificio;
  onSuccess: () => void;
}

const BuildForm: React.FC<BuildFormProps> = ({
  action,
  building,
  onSuccess,
}) => {
  const initialFormData = building || {
    edi_identificador: "",
    edi_descripcion: "",
  };
  const [formData, setFormData] =
    useState<Partial<AvaEdificio>>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const { addBuilding, updateBuilding } = useBuildingStore();

  useEffect(() => {
    setFormData(building || initialFormData);
  }, [building]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (action === "create") {
        addBuilding(formData as AvaEdificio);
        console.log("Edificio creado:", formData);
        onSuccess && onSuccess();
      } else if (action === "edit") {
        updateBuilding(formData as AvaEdificio);
        console.log("Edificio Actualizado:", formData);
        onSuccess && onSuccess();
      }
    } catch (error: any) {
      console.error("Error al guardar el Edificio:", error);
      const errorMessage = error.response?.data?.error || "Error desconocido";
      setError("Error al guardar el Edificio: " + errorMessage);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 m-3">
          <div>
            <Label htmlFor="edi_identificador">Identificador</Label>
            <Input
              id="edi_identificador"
              name="edi_identificador"
              type="text"
              value={formData.edi_identificador}
              onChange={handleChange}
              required
              disabled={action === "view"}
            />
          </div>
          <div>
            <Label htmlFor="edi_descripcion">Descripcion</Label>
            <Input
              id="edi_descripcion"
              name="edi_descripcion"
              type="text"
              value={formData.edi_descripcion || ""}
              onChange={handleChange}
              required
              disabled={action === "view"}
            />
          </div>
        </div>
        {action !== "view" && (
          <div className="pt-4 m-3">
            <Button type="submit">
              {action === "create" ? "Crear Edificio" : "Guardar Cambios"}
            </Button>
          </div>
        )}
        {error && <Alert variant="destructive">{error}</Alert>}
      </form>
    </div>
  );
};

export default BuildForm;
