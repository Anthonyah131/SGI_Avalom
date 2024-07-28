import React, { useEffect } from "react";
import axios from "axios";
import RentalHistory from "./RentalHistory";
import { AvaPropiedad } from "@/lib/types";
import usePropertyStore from "@/lib/zustand/propertyStore";
import { Card, CardContent } from "@/components/ui/card";
import PropertyForm from "./propertyFormProps";

interface PropertyManagerProps {
  propertyId: number;
}

const PropertyManager: React.FC<PropertyManagerProps> = ({ propertyId }) => {
  const { selectedProperty, setSelectedProperty } = usePropertyStore();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`/api/property/${propertyId}`);
        setSelectedProperty(response.data);
      } catch (error) {
        console.error("Error fetching property:", error);
      }
    };

    fetchProperty();
  }, [propertyId, setSelectedProperty]);

  if (!selectedProperty) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-10">
      <div className="space-y-10">
        <PropertyForm
          property={selectedProperty}
          action="edit"
          onSuccess={() => console.log("Propiedad editada")}
        />
        <RentalHistory rentals={selectedProperty.ava_alquiler} />
      </div>
    </div>
  );
};

export default PropertyManager;
