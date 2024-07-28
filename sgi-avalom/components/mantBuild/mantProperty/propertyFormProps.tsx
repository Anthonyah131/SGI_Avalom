import { useForm, SubmitHandler } from "react-hook-form";
import { AvaPropiedad } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import usePropertyStore from "@/lib/zustand/propertyStore";
import { useEffect, useState } from "react";

interface PropertyFormProps {
  action: "create" | "edit" | "view";
  property?: AvaPropiedad;
  onSuccess: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ action, property, onSuccess }) => {
  const { register, handleSubmit, reset } = useForm<AvaPropiedad>({ defaultValues: property });
  const { setSelectedProperty, updateSelectedProperty } = usePropertyStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reset(property);
  }, [property, reset]);

  const onSubmit: SubmitHandler<AvaPropiedad> = (data) => {
    try {
      if (action === "create") {
        setSelectedProperty(data);
        console.log("Propiedad creada:", data);
      } else if (action === "edit") {
        updateSelectedProperty(data);
        console.log("Propiedad actualizada:", data);
      }
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar la propiedad:", error);
      setError("Error al guardar la propiedad");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 m-3">
          <div>
            <Label htmlFor="prop_identificador">Identificador</Label>
            <Input
              id="prop_identificador"
              {...register("prop_identificador", { required: true })}
              disabled={action === "view"}
            />
          </div>
          <div>
            <Label htmlFor="prop_descripcion">Descripción</Label>
            <Input
              id="prop_descripcion"
              {...register("prop_descripcion")}
              disabled={action === "view"}
            />
          </div>
        </div>
        {action !== "view" && (
          <div className="pt-4 m-3">
            <Button type="submit">
              {action === "create" ? "Crear Propiedad" : "Guardar Cambios"}
            </Button>
          </div>
        )}
        {error && <Alert variant="destructive">{error}</Alert>}
      </form>
    </div>
  );
};

export default PropertyForm;
