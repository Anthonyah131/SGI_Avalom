"use client";

import type React from "react";

import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import useRentalStore from "@/lib/zustand/useRentalStore";
import axios from "axios";
import cookie from "js-cookie";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import MonthlyRentsView from "./monthlyRentsView";
import { DepositView } from "./depositView";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientInfoCard } from "./clientInfoCard";

const BodyPayments: React.FC = () => {
  const {
    setSelectedRental,
    selectedRental,
    monthlyRents,
    isLoading,
    setLoadingState,
    setDeposit,
  } = useRentalStore();
  const { alqId } = useParams();

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
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <CardHeader>
              <Skeleton className="h-4 w-[160px] mb-4" />
              <CardTitle className="text-2xl">
                <Skeleton className="h-6 w-[200px]" />
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap justify-center gap-2 p-4">
              <Skeleton className="h-9 w-36 rounded-md" />
            </div>
          </div>

          <div>
            <CardHeader className="flex flex-col sm:flex-row justify-between">
              <Skeleton className="h-6 w-[100px] mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-32 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-36" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-36" />
              </div>
            </CardContent>
          </div>

          <div>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-5 w-[200px]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-start">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-36" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="p-4 space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-full sm:w-20" />
                      <Skeleton className="h-8 w-full sm:w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </>
      ) : (
        <>
          <Card className="border shadow-lg">
            <CardHeader>
              <BreadcrumbResponsive
                items={[
                  { label: "Inicio", href: "/homePage" },
                  { label: "Contabilidad", href: "/accounting" },
                  { label: "Realizar movimiento" },
                ]}
              />
              <CardTitle className="text-2xl text-primary font-bold">
                Realizar movimiento
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Cliente y Depósito en una fila */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedRental?.ava_clientexalquiler[0]?.ava_cliente && (
              <ClientInfoCard
                cliente={selectedRental.ava_clientexalquiler[0].ava_cliente}
              />
            )}
            <DepositView />
          </div>

          <Card className="border shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-xl font-bold text-foreground">
                Alquileres Mensuales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {monthlyRents.length > 0 ? (
                <MonthlyRentsView />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No hay alquileres mensuales registrados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BodyPayments;
