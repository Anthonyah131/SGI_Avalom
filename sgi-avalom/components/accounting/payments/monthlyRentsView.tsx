"use client";

import React, { useEffect, useState } from "react";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  HandCoins,
  BanIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { convertToCostaRicaTime } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import { StatusFilter } from "@/components/dataTable/status-filter";

const MonthlyRentsView: React.FC = () => {
  const { monthlyRents } = useRentalStore();
  const [rents, setRents] = useState(monthlyRents);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  useEffect(() => {
    setRents(monthlyRents);
  }, [monthlyRents]);

  const handlePayment = (alqm_id: string) => {
    console.log(`Realizar pago para el alquiler mensual con ID: ${alqm_id}`);
  };

  const handleCancelPayment = (alqm_id: string) => {
    console.log(`Anular pago para el alquiler mensual con ID: ${alqm_id}`);
  };

  const getStatusColor = (rent: any) => {
    const now = new Date();
    const endDate = new Date(rent.alqm_fechafin);
    const isPastDue = endDate < now && rent.alqm_estado !== "P";
    const isIncomplete = rent.alqm_montopagado < rent.alqm_montototal;

    if (isPastDue) return "bg-red-100 border-red-200 text-red-800";
    if (isIncomplete && rent.alqm_estado !== "P")
      return "bg-yellow-50 border-yellow-200 text-yellow-800";
    if (rent.alqm_estado === "P")
      return "bg-green-50 border-green-200 text-green-800";
    return "bg-gray-50 border-gray-200 text-gray-800";
  };

  const getStatusIcon = (rent: any) => {
    const now = new Date();
    const endDate = new Date(rent.alqm_fechafin);

    if (rent.alqm_estado === "P")
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (rent.alqm_estado === "A" || (endDate < now && rent.alqm_estado !== "P"))
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const getRentStatus = (rent: any) => {
    const now = new Date();
    const endDate = new Date(rent.alqm_fechafin);
    const isPastDue = endDate < now && rent.alqm_estado !== "P";
    const isIncomplete = rent.alqm_montopagado < rent.alqm_montototal;

    if (rent.alqm_estado === "P") return "pagados";
    if (isPastDue) return "atrasados";
    if (isIncomplete) return "incompletos";
    return "pendientes";
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredAndSortedRents = rents
    .filter((rent) => {
      if (selectedStatuses.length === 0) return true;
      return selectedStatuses.includes(getRentStatus(rent));
    })
    .sort((a, b) => {
      const dateA = new Date(a.alqm_fechainicio).getTime();
      const dateB = new Date(b.alqm_fechainicio).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-start">
        <Button
          onClick={toggleSort}
          variant="outline"
          className="flex items-center"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Ordenar {sortOrder === "asc" ? "Descendente" : "Ascendente"}
        </Button>
        <StatusFilter
          selectedStatuses={selectedStatuses}
          onStatusChange={setSelectedStatuses}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAndSortedRents.map((rent) => (
          <Card
            key={rent.alqm_id}
            className={cn(
              "transition-all duration-300 ease-in-out hover:shadow-lg",
              getStatusColor(rent)
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold truncate flex items-center justify-between">
                {rent.alqm_identificador}
                {getStatusIcon(rent)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs sm:text-sm space-y-2">
              <p className="flex justify-between">
                <span className="font-medium">Inicio:</span>
                <span>{convertToCostaRicaTime(rent.alqm_fechainicio)}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Fin:</span>
                <span>{convertToCostaRicaTime(rent.alqm_fechafin)}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span>
                  {rent.alqm_montototal
                    ? new Intl.NumberFormat("es-CR", {
                        style: "currency",
                        currency: "CRC",
                      }).format(BigInt(rent.alqm_montototal))
                    : "₡0"}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Pagado:</span>
                <span>
                  {rent.alqm_montopagado
                    ? new Intl.NumberFormat("es-CR", {
                        style: "currency",
                        currency: "CRC",
                      }).format(BigInt(rent.alqm_montopagado))
                    : "₡0"}
                </span>
              </p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePayment(rent.alqm_id)}
                className="flex items-center bg-white hover:bg-gray-100 hover:text-green-700 w-full sm:w-auto"
                disabled={rent.alqm_estado === "P"}
              >
                <HandCoins className="h-4 w-4 mr-1" />
                Pagar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancelPayment(rent.alqm_id)}
                className="flex items-center bg-white hover:bg-gray-100 hover:text-red-700 w-full sm:w-auto"
              >
                <BanIcon className="h-4 w-4 mr-1" />
                Anular
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MonthlyRentsView;
