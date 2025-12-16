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
import { Progress } from "@/components/ui/progress";
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
      return "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50";
    if (rent.alqm_estado === "R")
      return "bg-pink-500/10 border-pink-500/30 hover:border-pink-500/50";
    if (isPastDue) return "bg-red-500/10 border-red-500/30 hover:border-red-500/50";
    if (isIncomplete && rent.alqm_estado !== "P")
      return "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50";
    return "bg-muted/50 border-border hover:border-primary/30";
  };

  const getStatusIcon = (rent: any) => {
    const now = new Date();
    const endDate = new Date(rent.alqm_fechafin);

    if (rent.alqm_estado === "P")
      return <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    if (rent.alqm_estado === "R")
      return <Gift className="h-4 w-4 text-pink-600 dark:text-pink-400" />;
    if (rent.alqm_estado === "A" || (endDate < now && rent.alqm_estado !== "P"))
      return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          onClick={toggleSort}
          variant="outline"
          size="sm"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAndSortedRents.map((rent) => {
          const isPaid = rent.alqm_estado === "P";
          const isGifted = rent.alqm_estado === "R";

          const progress = Number(rent.alqm_montototal) > 0
            ? (Number(rent.alqm_montopagado) / Number(rent.alqm_montototal)) * 100
            : 0;
          const pendingAmount = Number(rent.alqm_montototal) - Number(rent.alqm_montopagado);

          return (
            <Card
              key={rent.alqm_id}
              className={cn(
                "transition-all duration-200 ease-in-out hover:shadow-md border-2",
                getStatusColor(rent)
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-base font-bold text-foreground">
                    {rent.alqm_identificador}
                  </CardTitle>
                  {getStatusIcon(rent)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatToCR(rent.alqm_fechainicio)} - {formatToCR(rent.alqm_fechafin)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Progreso */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Progreso</span>
                    <span className="font-bold text-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" indicatorClassName="bg-primary" />
                </div>

                {/* Montos */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Total</p>
                    <p className="text-xs font-bold text-foreground">
                      {rent.alqm_montototal
                        ? formatCurrency(Number(rent.alqm_montototal))
                        : "₡0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Pagado</p>
                    <p className="text-xs font-semibold text-emerald-600">
                      {rent.alqm_montopagado
                        ? formatCurrency(Number(rent.alqm_montopagado))
                        : "₡0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Pendiente</p>
                    <p className="text-xs font-semibold text-amber-600">
                      {formatCurrency(pendingAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  disabled={isPaid || isGifted}
                  asChild
                >
                  <Link href={`/accounting/payments/payment/${rent.alqm_id}`}>
                    <HandCoins className="h-3.5 w-3.5 mr-1.5" />
                    Pagar
                  </Link>
                </Button>
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    disabled={isGifted}
                    asChild
                  >
                    <Link href={`/accounting/payments/cancelpayment/${rent.alqm_id}`}>
                      <BanIcon className="h-3.5 w-3.5 mr-1.5" />
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
                      classn="text-xs p-1.5 h-8 w-8"
                      icon={<Gift size={14} />}
                      onAction={() => handleGiftToggle(rent)}
                    />
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyRentsView;
