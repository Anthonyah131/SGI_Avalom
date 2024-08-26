import React, { useEffect } from "react";
import axios from "axios";
import usePropertyStore from "@/lib/zustand/propertyStore";
import { AvaAlquiler } from "@/lib/types";
import PropertyForm from "@/components/mantBuild/mantProperty/propertyFormProps";
import RentalForm from "@/components/mantBuild/mantProperty/mantRent/rentForm";
import { DataTable } from "@/components/dataTable/data-table";
import { columnsRent } from "@/components/mantBuild/mantProperty/mantRent/columnRent";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface PropertyManagerProps {
  propertyId: number;
}

const PropertyManager: React.FC<PropertyManagerProps> = ({ propertyId }) => {
  const {
    selectedProperty,
    selectedRental,
    setSelectedProperty,
    setSelectedRental,
  } = usePropertyStore();

  const handleSelectRental = (rental: AvaAlquiler) => {
    setSelectedRental(rental);
  };

  const handleNewRental = () => {
    setSelectedRental(null); // Ensure this sets selectedRental to null
  };

  const handleSuccess = () => {
    setSelectedRental(null); // Reset form after success
    fetchProperty();
  };

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`/api/property/${propertyId}`);
      setSelectedProperty(response.data);
    } catch (error) {
      console.error("Error fetching property:", error);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  if (!selectedProperty) {
    return <div>Cargando propiedad...</div>;
  }

  return (
    <div>
      <PropertyForm
        property={selectedProperty}
        action="edit"
        onSuccess={() => console.log("Propiedad editada")}
      />
      <Separator className="my-4" />
      <Tabs defaultValue="view" className="w-full">
        <TabsList>
          <TabsTrigger value="create" onClick={handleNewRental}>
            Crear Alquiler
          </TabsTrigger>
          <TabsTrigger value="edit">Ver Alquileres</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <RentalForm action="edit" onSuccess={handleSuccess} />
          <Separator className="my-4" />
          <div className="m-2 flex flex-col md:flex-row justify-center items-center p-2">
            <h1 className="text-lg md:text-xl font-bold">
              Historial de alquileres
            </h1>
          </div>
          <DataTable
            columns={columnsRent}
            data={selectedProperty.ava_alquiler}
            onRowClick={handleSelectRental}
          />
        </TabsContent>
        <TabsContent value="create">
          <RentalForm action="create" onSuccess={handleSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyManager;
