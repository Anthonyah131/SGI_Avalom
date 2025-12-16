"use client";

import React, { useEffect, useState } from "react";
import useRentalStore from "@/lib/zustand/rentalStore";
import axios from "axios";
import cookie from "js-cookie";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { DataTable } from "./data_table_filter";
import { columns } from "./columnsAccounting";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { Skeleton } from "../ui/skeleton";
import { ExportBuildings } from "../mantBuild/exportBuildings";

const BodyAccounting: React.FC = () => {
  const { rentals, setRentals } = useRentalStore();
  const [statusFilter, setStatusFilter] = useState<string[]>(["A"]);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      try {
        const response = await axios.get("/api/accounting", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setRentals(response.data.data);
      } catch (error) {
        console.error("Error al buscar alquileres: " + error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentals();
  }, [setRentals]);

  const activeCount = rentals.filter(r => r.alq_estado === "A").length;
  const finishedCount = rentals.filter(r => r.alq_estado === "F").length;
  const canceledCount = rentals.filter(r => r.alq_estado === "C").length;

  return (
    <div className="mx-auto p-4 space-y-6 max-w-7xl">
      {isLoading ? (
        <>
          <div className="space-y-4 mb-3">
            <div className="h-4 w-40 sm:w-56 rounded-md bg-muted animate-pulse" />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-8">
              <div className="w-60 h-8 rounded-md bg-muted animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 w-[120px] rounded-md bg-muted animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-8 m-10"
              >
                <Skeleton className="w-full sm:w-[200px] h-[30px] rounded-full" />
                <Skeleton className="w-full sm:w-[100px] h-[30px] rounded-full" />
                <Skeleton className="w-full sm:w-[150px] h-[30px] rounded-full" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <Card className="border shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <BreadcrumbResponsive
                    items={[
                      { label: "Inicio", href: "/homePage" },
                      { label: "Contabilidad" },
                    ]}
                  />
                  <CardTitle className="text-2xl text-primary font-bold mt-2">
                    Contabilidad
                  </CardTitle>
                </div>
                <ExportBuildings />
              </div>
            </CardHeader>
          </Card>

          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Activos
                    </p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {activeCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-emerald-500/10">
                    <div className="h-6 w-6 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Finalizados
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {finishedCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <div className="h-6 w-6 rounded-full bg-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Cancelados
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {canceledCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-red-500/10">
                    <div className="h-6 w-6 rounded-full bg-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-lg">
            <CardContent className="p-6">
              <DataTable
                columns={columns}
                data={rentals}
                statusFilter={statusFilter}
                propertyTypeFilter={propertyTypeFilter}
                onStatusChange={setStatusFilter}
                onPropertyTypeChange={setPropertyTypeFilter}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BodyAccounting;
