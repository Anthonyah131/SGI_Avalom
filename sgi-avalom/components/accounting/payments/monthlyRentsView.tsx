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
  Gift,
} from "lucide-react";
import { formatToCR } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import { StatusFilter } from "@/components/dataTable/status-filter";
import Link from "next/link";
import { formatCurrency } from "@/utils/currencyConverter";
import { toast } from "sonner";
import AlertDialog from "@/components/alertDialog";

const MonthlyRentsView: React.FC = () => {
  const { monthlyRents, setRentStatus } = useRentalStore();
  const [rents, setRents] = useState(monthlyRents);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  useEffect(() => {
    setRents(monthlyRents);
  }, [monthlyRents]);

  const getStatusColor = (rent: any) => {
    const now = new Date();
    const endDate = new Date(rent.alqm_fechafin);
    const isPastDue = endDate < now && rent.alqm_estado !== "P";
    const isIncomplete = rent.alqm_montopagado < rent.alqm_montototal;

    if (rent.alqm_estado === "P")
      return "bg-green-50 border-green-200 text-green-800";
    if (rent.alqm_estado === "R")
      return "bg-pink-50 border-pink-200 text-pink-800";
    if (isPastDue) return "bg-red-100 border-red-200 text-red-800";
    if (isIncomplete && rent.alqm_estado !== "P")
      return "bg-yellow-50 border-yellow-200 text-yellow-800";
    return "bg-gray-50 border-gray-200 text-gray-800";
  };

  const getStatusIcon = (rent: any) => {
    const now = new Date();
    const endDate = new Date(rent.alqm_fechafin);

    if (rent.alqm_estado === "P")
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (rent.alqm_estado === "R")
      return <Gift className="h-5 w-5 text-pink-600" />;
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
    if (rent.alqm_estado === "R") return "regalados";
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
      const dateB = new Date(b.alqm_fechafin).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const handleGiftToggle = async (rent: any) => {
    const isGifted = rent.alqm_estado !== "R";
    try {
      const res = await fetch(`/api/accounting/payment/gift/${rent.alqm_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isGifted }),
      });
      const body = await res.json();
      if (!body.success) throw new Error(body.error);

      setRentStatus(
        "monthlyRents",
        rent.alqm_id.toString(),
        body.data.alqm_estado
      );

      toast.success(
        isGifted ? "Mes marcado como regalado 🎁" : "Regalo removido del mes"
      );
    } catch (err: any) {
      toast.error("No se pudo actualizar el estado", {
        description: err.message,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          onClick={toggleSort}
          variant="borderOrange"
          className="flex items-center"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Ordenar {sortOrder === "asc" ? "Descendente" : "Ascendente"}
        </Button>

        <div className="w-full sm:w-auto">
          <StatusFilter
            filterName="Estado"
            selectedStatuses={selectedStatuses}
            onStatusChange={setSelectedStatuses}
            statuses={[
              { label: "Pagados", value: "pagados" },
              { label: "Atrasados", value: "atrasados" },
              { label: "Incompletos", value: "incompletos" },
              { label: "Regalados", value: "regalados" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAndSortedRents.map((rent) => {
          const isPaid = rent.alqm_estado === "P";
          const isGifted = rent.alqm_estado === "R";

          return (
            <Card
              key={rent.alqm_id}
              className={cn(
                "transition-all duration-300 ease-in-out hover:shadow-lg",
                getStatusColor(rent)
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary font-semibold truncate flex items-center justify-between">
                  {rent.alqm_identificador}
                  {getStatusIcon(rent)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm space-y-2">
                <p className="flex justify-between">
                  <span className="font-medium">Inicio:</span>
                  <span>{formatToCR(rent.alqm_fechainicio)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Fin:</span>
                  <span>{formatToCR(rent.alqm_fechafin)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span>
                    {rent.alqm_montototal
                      ? formatCurrency(Number(rent.alqm_montototal))
                      : "₡0"}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Pagado:</span>
                  <span>
                    {rent.alqm_montopagado
                      ? formatCurrency(Number(rent.alqm_montopagado))
                      : "₡0"}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium">Pendiente</span>
                  <span>
                    {rent.alqm_montototal
                      ? formatCurrency(
                          Number(rent.alqm_montototal) -
                            Number(rent.alqm_montopagado)
                        )
                      : "₡0"}
                  </span>
                </p>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center bg-white hover:bg-gray-100 hover:text-green-700 w-full sm:w-auto"
                  disabled={isPaid || isGifted}
                >
                  <Link
                    href={`/accounting/payments/payment/${rent.alqm_id}`}
                    className="flex items-center"
                  >
                    <HandCoins className="h-4 w-4 mr-1" />
                    Pagar
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center bg-white hover:bg-gray-100 hover:text-red-700 w-full sm:w-auto"
                  disabled={isGifted}
                >
                  <Link
                    href={`/accounting/payments/cancelpayment/${rent.alqm_id}`}
                    className="flex items-center"
                  >
                    <BanIcon className="h-4 w-4 mr-1" />
                    Anular
                  </Link>
                </Button>

                {!isPaid && (
                  <AlertDialog
                    title={isGifted ? "¿Quitar regalo?" : "¿Regalar mes?"}
                    description={
                      isGifted
                        ? "Este mes volverá a considerarse atrasado o incompleto según los pagos."
                        : "Marcarás este mes como regalo, no contará como pago."
                    }
                    triggerText={""}
                    cancelText="Cancelar"
                    actionText={isGifted ? "Quitar regalo" : "Regalar mes"}
                    variant="ghost"
                    classn={
                      isGifted
                        ? "text-pink-600 hover:text-pink-800 hover:bg-gray-400 cursor-pointer"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-400 cursor-pointer"
                    }
                    icon={<Gift size={20} />}
                    onAction={() => handleGiftToggle(rent)}
                  />
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyRentsView;
