import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { AvaPropiedad } from "@/lib/types";
import usePropertyStore from "@/lib/zustand/propertyStore";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

interface PropertyFormProps {
  property?: AvaPropiedad;
  action: "create" | "edit";
  onSuccess?: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  action,
  onSuccess,
}) => {
  const { register, handleSubmit, reset } = useForm<AvaPropiedad>({
    defaultValues: property || {},
  });

  const { addProperty, updateProperty } = usePropertyStore();

  const onSubmit: SubmitHandler<AvaPropiedad> = (data) => {
    if (action === "create") {
      addProperty(data);
    } else if (action === "edit") {
      updateProperty(data);
    }
    reset();
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="prop_identificador">Identificador</Label>
        <Input
          id="prop_identificador"
          {...register("prop_identificador", { required: true })}
        />
      </div>
      <div>
        <Label htmlFor="prop_descripcion">Descripción</Label>
        <Input
          id="prop_descripcion"
          {...register("prop_descripcion", { required: true })}
        />
      </div>
      <Button type="submit">
        {action === "create" ? "Crear" : "Actualizar"}
      </Button>
    </form>
  );
};

export default PropertyForm;
