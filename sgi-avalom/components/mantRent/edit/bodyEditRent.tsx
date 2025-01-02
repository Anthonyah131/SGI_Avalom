"use client";

import { useEffect, useState } from "react";
import RentalForm from "@/components/mantRent/edit/rentalForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { useParams } from "next/navigation";
import { DateRangeCalculator } from "./DateRangeCalculator";
import MonthsBetween from "./MonthsBetween";
import useRentalStore from "@/lib/zustand/useRentalStore";
import axios from "axios";
import cookie from "js-cookie";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const BodyEditRent: React.FC = () => {
  const { alqId } = useParams();
  const {
    setSelectedRental,
    monthlyRents,
    isLoading,
    setLoadingState,
    setMonthlyRents,
    createMonthlyRents,
  } = useRentalStore();
  const [selectedTab, setSelectedTab] = useState<"view" | "create">("create");

  const handleSaveAll = async () => {
    try {
      const token = cookie.get("token");
      if (!token) toast.error("Token no disponible");

      const response = await axios.post(
        `/api/monthlyrent/saveall`,
        { rents: createMonthlyRents, alqId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.success) {
        const savedRents = response.data.data;
        setMonthlyRents(savedRents);
        setSelectedTab("view");
      } else {
        toast.error(response?.data?.error || "Error al guardar alquileres.");
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Error al guardar alquileres.",
      });
    }
  };

  useEffect(() => {
    const fetchRental = async () => {
      setLoadingState(true);
      try {
        const token = cookie.get("token");
        if (!token) throw new Error("Token no disponible");

        const response = await axios.get(`/api/modifiyrent/${alqId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response?.data?.success) {
          setSelectedRental(response.data.data);
          setSelectedTab(
            response.data.data.ava_alquilermensual?.length > 0
              ? "view"
              : "create"
          );
        } else {
          throw new Error(response?.data?.error || "Error al cargar alquiler.");
        }
      } catch (error: any) {
        toast.error("Error", {
          description: error.message || "Error al cargar el alquiler.",
        });
      } finally {
        setLoadingState(false);
      }
    };

    if (alqId) {
      fetchRental();
    }
  }, [alqId, setSelectedRental, setLoadingState]);

  if (isLoading) {
    return (
      <div className="mx-auto p-4 max-w-7xl">
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Modificar alquiler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Cargando datos...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 max-w-7xl space-y-8">
      <Card className="bg-background flex flex-col sm:flex-row justify-between items-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">
            Modificar alquiler
          </CardTitle>
        </CardHeader>
      </Card>

      <RentalForm action="edit" onSuccess={() => {}} />

      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Alquileres Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={selectedTab}
            onValueChange={(value) =>
              setSelectedTab(value as "view" | "create")
            }
          >
            <TabsList className="w-full">
              <TabsTrigger
                value="view"
                className="flex-1"
                disabled={monthlyRents.length === 0}
              >
                Alquileres Mensuales Existentes
              </TabsTrigger>
              <TabsTrigger
                value="create"
                className="flex-1"
                disabled={monthlyRents.length > 0}
              >
                Crear Alquileres Mensuales
              </TabsTrigger>
            </TabsList>
            <TabsContent value="view" className="mt-4">
              {monthlyRents.length > 0 ? (
                <MonthsBetween mode={"view"} />
              ) : (
                <p className="text-center text-muted-foreground">
                  No hay alquileres mensuales registrados.
                </p>
              )}
            </TabsContent>
            <TabsContent value="create" className="mt-4">
              <DateRangeCalculator />
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveAll}>Guardar Todos</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyEditRent;
