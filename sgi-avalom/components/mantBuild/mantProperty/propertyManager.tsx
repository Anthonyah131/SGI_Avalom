import React, { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface PropertyManagerProps {
  propertyId: string;
}

const PropertyManager: React.FC<PropertyManagerProps> = ({ propertyId }) => {
  const {
    selectedProperty,
    selectedRental,
    setSelectedProperty,
    setSelectedRental,
  } = usePropertyStore();
  const [isLoading, setIsLoading] = useState(true);

  const handleSelectRental = (rental: AvaAlquiler) => {
    setSelectedRental(rental);
  };

  const handleNewRental = () => {
    setSelectedRental(null);
  };

  const handleSuccess = () => {
    setSelectedRental(null);
    fetchProperty();
  };

  const fetchProperty = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/property/${propertyId}`);
      setSelectedProperty(response.data.data);
      setSelectedRental(null);
    } catch (error) {
      console.error("Error fetching property:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedProperty) {
    return (
      <div className="text-center text-muted-foreground">
        No se pudo cargar la propiedad.
      </div>
    );
  }

  const isAirbnb = selectedProperty.tipp_id === "1";

  return (
    <CardContent className="space-y-6">
      <PropertyForm
        property={selectedProperty}
        action="edit"
        onSuccess={() => {}}
      />
      <Separator className="my-6 h-1 rounded-xl" />
      {!isAirbnb && (
        <Tabs defaultValue="view" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">Ver Alquileres</TabsTrigger>
            <TabsTrigger value="create" onClick={handleNewRental}>
              Crear Alquiler
            </TabsTrigger>
          </TabsList>
          <TabsContent value="view" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl text-primary font-semibold">
                Historial de alquileres
              </h2>
            </div>
            <Card>
              <CardContent className="p-0">
                <DataTable
                  columns={columnsRent}
                  data={selectedProperty.ava_alquiler}
                  onRowClick={handleSelectRental}
                />
              </CardContent>
            </Card>
            <Separator className="my-6 h-1 rounded-xl" />
            {selectedRental && (
              <RentalForm action="edit" onSuccess={handleSuccess} />
            )}
          </TabsContent>
          <TabsContent value="create">
            <RentalForm action="create" onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      )}
    </CardContent>
  );
};

export default PropertyManager;
