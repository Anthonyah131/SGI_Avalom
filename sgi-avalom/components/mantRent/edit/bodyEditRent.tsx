"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import RentalForm from "@/components/mantRent/edit/rentalForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "@/components/ui/button";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { ModeToggle } from "@/components/modeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangeCalculator } from "./DateRangeCalculator";
import MonthsBetween from "./MonthsBetween";
import DepositForm from "./depositForm";
import useRentalStore from "@/lib/zustand/useRentalStore";

const BodyEditRent: React.FC = () => {
  const { alqId } = useParams();
  const {
    setSelectedRental,
    monthlyRents,
    isLoading,
    setLoadingState,
    setRents,
    createMonthlyRents,
    setDeposit,
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
        setRents("monthlyRents", savedRents);
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
          setDeposit(response.data.data.ava_deposito[0]);
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

  return (
    <div className="mx-auto p-4 space-y-8 max-w-7xl">
      {isLoading ? (
        <>
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>

          <div className="space-y-6 p-4">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-32 md:justify-self-end" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full md:w-1/2" />
              </div>

              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-10 w-60" />
                <Skeleton className="h-16 w-full md:w-1/2 rounded-md" />
              </div>
            </CardContent>
          </div>

          <div className="space-y-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-12 w-1/2" />
          </div>

          <div className="space-y-4 p-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-28 w-full rounded-md" />
          </div>

          <div className="space-y-6 p-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-40 mt-4" />
          </div>

          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-52" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-md" />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <Card className="flex flex-col sm:flex-row justify-between items-center">
            <CardHeader>
              <BreadcrumbResponsive
                items={[
                  { label: "Inicio", href: "/homePage" },
                  { label: "Gestión de alquileres", href: "/mantRent" },
                  { label: "Modificar alquiler" },
                ]}
              />
              <CardTitle className="text-2xl text-primary font-bold mb-4 sm:mb-0">
                Modificar alquiler
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap justify-center gap-2 p-4">
              <ModeToggle />
            </div>
          </Card>

          <RentalForm action="edit" onSuccess={() => {}} />

          <DepositForm onSuccess={() => {}} />

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl text-primary font-semibold text-center sm:text-left">
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
                <TabsList className="flex flex-col sm:flex-row w-full gap-2 sm:gap-0">
                  <TabsTrigger
                    value="view"
                    className="flex-1"
                    disabled={monthlyRents.length === 0}
                  >
                    Alquileres Existentes
                  </TabsTrigger>
                  <TabsTrigger
                    value="create"
                    className="flex-1"
                    disabled={monthlyRents.length > 0}
                  >
                    Crear Alquileres
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="view" className="mt-4">
                  {monthlyRents.length > 0 ? (
                    <MonthsBetween mode="view" />
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
        </>
      )}
    </div>
  );
};

export default BodyEditRent;
