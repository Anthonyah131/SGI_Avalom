"use client";

import { useState, useEffect } from "react";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { ModeToggle } from "@/components/modeToggle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";
import cookie from "js-cookie";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import usePaymentStore from "@/lib/zustand/monthlyRentStore";
import { PaymentTable } from "./paymentTable";
import { PaymentForm } from "./paymentForm";
import { Skeleton } from "@/components/ui/skeleton";

const BodyPayment: React.FC = () => {
  const { alqmId } = useParams();
  const { selectedMonthlyRent, selectMonthlyRent, setPayments, addPayment } =
    usePaymentStore();
  const [amountToPay, setAmountToPay] = useState("0");
  const [isLoading, setIsLoading] = useState(true);

  const fetchRental = async () => {
    try {
      setIsLoading(true);
      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      const response = await axios.get(
        `/api/accounting/monthlyrent/${alqmId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.success) {
        selectMonthlyRent(response.data.data);
        setPayments(response.data.data.ava_pagos || []);
      } else {
        throw new Error(
          response?.data?.error || "Error al cargar alquiler mensual."
        );
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Error al cargar el alquiler mensual.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (alqmId) {
      fetchRental();
    }
  }, [alqmId, selectMonthlyRent, setPayments]);

  const handlePaymentSubmit = async (formData: {
    pag_descripcion: string;
    pag_cuenta: string;
  }) => {
    try {
      const paymentAmount = Number(amountToPay);

      if (paymentAmount <= 0) {
        toast.error("El monto debe ser mayor a 0.");
        return;
      }

      const currentBalance =
        Number(selectedMonthlyRent?.alqm_montototal || 0) -
        Number(selectedMonthlyRent?.alqm_montopagado || 0);

      if (paymentAmount > currentBalance) {
        toast.error("El monto no puede ser mayor al saldo pendiente.");
        return;
      }

      setIsLoading(true);

      const paymentData = {
        ...formData,
        pag_monto: paymentAmount,
        pag_fechapago: new Date().toISOString(),
        pag_estado: "A",
        alqm_id: selectedMonthlyRent?.alqm_id,
      };

      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(
        `/api/accounting/payment`,
        paymentData,
        { headers }
      );

      if (response?.data?.success) {
        addPayment(response.data.data);
        toast.success("Pago realizado con éxito.");
        // Actualizar los datos del alquiler mensual después del pago
        await fetchRental();
      } else {
        throw new Error(response?.data?.error || "Error desconocido.");
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Error al realizar el pago.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(amount);
  };

  const currentBalance = selectedMonthlyRent
    ? Number(selectedMonthlyRent.alqm_montototal) -
      Number(selectedMonthlyRent.alqm_montopagado)
    : 0;

  const newBalance = currentBalance - Number(amountToPay);

  return (
    <div className="mx-auto p-4 max-w-7xl space-y-8">
      <Card className="bg-background">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <BreadcrumbResponsive
              items={[
                { label: "Inicio", href: "/homePage" },
                { label: "Contabilidad", href: "/accounting" },
                {
                  label: "Realizar movimiento",
                  href: `/accounting/payments/${selectedMonthlyRent?.alq_id}`,
                },
                { label: "Realizar Pago" },
              ]}
            />
            <CardTitle className="text-2xl font-bold mt-4">
              Realizar Pago
            </CardTitle>
            {new Date(
              selectedMonthlyRent?.alqm_fechainicio ?? ""
            ).toLocaleDateString("es-CR")}{" "}
            -{" "}
            {new Date(
              selectedMonthlyRent?.alqm_fechafin ?? ""
            ).toLocaleDateString("es-CR")}
          </div>
          <ModeToggle />
        </CardHeader>
      </Card>

      {isLoading ? (
        <Card className="bg-background">
          <CardContent className="p-6">
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-background">
          <CardContent className="p-6 overflow-x-auto">
            <PaymentTable onAmountChange={setAmountToPay} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card className="bg-background">
              <CardContent className="p-6">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ) : (
            <PaymentForm onSubmit={handlePaymentSubmit} />
          )}
        </div>

        {selectedMonthlyRent && !isLoading && (
          <Card className="bg-background">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Resumen de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm font-medium">Monto Total:</div>
                  <div className="text-sm font-bold text-right">
                    {formatCurrency(
                      Number(selectedMonthlyRent.alqm_montototal)
                    )}
                  </div>
                  <div className="text-sm font-medium">Abono Total:</div>
                  <div className="text-sm font-bold text-right">
                    {formatCurrency(
                      Number(selectedMonthlyRent.alqm_montopagado)
                    )}
                  </div>
                  <div className="text-sm font-medium">Saldo Pendiente:</div>
                  <div className="text-sm font-bold text-right text-red-600">
                    {formatCurrency(currentBalance)}
                  </div>
                  <div className="text-sm font-medium">Monto a Abonar:</div>
                  <div className="text-sm font-bold text-right text-green-600">
                    {formatCurrency(Number(amountToPay))}
                  </div>
                  <div className="col-span-2 border-t pt-2">
                    <div className="flex justify-between items-center">
                      <div className="text-base font-medium">Nuevo Saldo:</div>
                      <div className="text-base font-bold text-blue-600">
                        {formatCurrency(newBalance)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">
                    Período de Alquiler:
                  </div>
                  <div className="text-sm">
                    {new Date(
                      selectedMonthlyRent.alqm_fechainicio
                    ).toLocaleDateString("es-CR")}{" "}
                    -{" "}
                    {new Date(
                      selectedMonthlyRent.alqm_fechafin
                    ).toLocaleDateString("es-CR")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BodyPayment;
