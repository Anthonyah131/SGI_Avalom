"use client";

import React, { useEffect, useState } from "react";
import useRentalStore from "@/lib/zustand/rentalStore";
import axios from "axios";
import cookie from "js-cookie";
import { ModeToggle } from "../modeToggle";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { DataTable } from "./data_table_filter";
import { columns } from "./columnsAccounting";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";

const BodyAccounting: React.FC = () => {
  const { rentals, setRentals } = useRentalStore();
  const [statusFilter, setStatusFilter] = useState<string>("A");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");

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
      }
    };

    fetchRentals();
  }, [setRentals]);

  return (
    <div className="mx-auto p-4 space-y-8">
      <Card className="bg-background flex flex-col sm:flex-row justify-between items-center">
        <CardHeader>
          <BreadcrumbResponsive
            items={[
              { label: "Inicio", href: "/homePage" },
              { label: "Contabilidad" },
            ]}
          />
          <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">
            Contabilidad
          </CardTitle>
        </CardHeader>
        <div className="flex flex-wrap justify-center gap-2 p-4">
          <ModeToggle />
        </div>
      </Card>
      <Card>
        <CardContent>
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
    </div>
  );
};

export default BodyAccounting;
