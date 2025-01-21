"use client";

import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { calculateMonthsBetween } from "@/utils/dateUtils";
import MonthsBetween from "./MonthsBetween";

export function DateRangeCalculator() {
  const { setRents, selectedRental } = useRentalStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const months = calculateMonthsBetween(dateRange.from, dateRange.to);
      const generatedRents = months.map((month, index) => ({
        alqm_id: `Temp-${index}`,
        alqm_identificador: `Mes ${index + 1}`,
        alqm_montototal: selectedRental?.alq_monto || "",
        alqm_fechainicio: month.startDate,
        alqm_fechafin: month.endDate,
        alqm_fechapago: selectedRental?.alq_fechapago || "",
        alqm_estado: "I" as "A" | "P" | "I",
        alqm_montopagado: "0",
        ava_pago: [],
      }));
      setRents("createMonthlyRents", generatedRents);
    }
  }, [dateRange, setRents]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-4">
      <Card className="w-full">
        <CardHeader className="py-2">
          <CardTitle className="text-center text-lg">
            Selecciona un Rango de Fechas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-2">
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </CardContent>
      </Card>
      <MonthsBetween mode="create" />
    </div>
  );
}
