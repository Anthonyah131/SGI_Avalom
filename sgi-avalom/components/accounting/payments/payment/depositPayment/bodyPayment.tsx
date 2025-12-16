"use client";

import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayment } from "@/hooks/accounting/depositPayment/usePayment";
import { formatCurrency } from "@/utils/currencyConverter";
import { useParams } from "next/navigation";
import { PaymentForm } from "./paymentForm";
import { PaymentTable } from "./paymentTable";
import { useState, useEffect } from "react";

const BodyPayment: React.FC = () => {
  const { depoId } = useParams<{ depoId: string }>();
  const { isLoading, selectedDeposit } = usePayment(depoId);

  const [amountToPay, setAmountToPay] = useState<string>("");
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [newBalance, setNewBalance] = useState<number>(0);

  useEffect(() => {
    if (selectedDeposit) {
      const calculatedCurrentBalance =
        Number(selectedDeposit.depo_total) -
        Number(selectedDeposit.depo_montoactual);

      setCurrentBalance(calculatedCurrentBalance);
      setNewBalance(calculatedCurrentBalance - Number(amountToPay || 0));
    }
  }, [selectedDeposit, amountToPay]);

  return (
    <div className="mx-auto p-4 max-w-7xl space-y-8">
      {isLoading ? (
        <>
          <div>
            <CardHeader>
              <Skeleton className="h-6 w-[150px] mb-2" />
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="grid grid-cols-5 items-center gap-4 min-w-[600px]">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="grid grid-cols-5 items-center gap-4 mt-4 min-w-[600px]">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardContent>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-5 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-36 rounded-md" />
              </CardFooter>
            </div>

            <div>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-5 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-36" />
              </CardContent>
            </div>
          </div>
        </>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-center">
              <div>
                <BreadcrumbResponsive
                  items={[
                    { label: "Inicio", href: "/homePage" },
                    { label: "Contabilidad", href: "/accounting" },
                    {
                      label: "Realizar movimiento",
                      href: `/accounting/payments/${selectedDeposit?.alq_id}`,
                    },
                    { label: "Realizar Pago" },
                  ]}
                />
                <CardTitle className="text-2xl text-primary font-bold mt-4">
                  Realizar Pago
                </CardTitle>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="p-6 overflow-x-auto">
              <PaymentTable
                amountToPay={amountToPay}
                setAmountToPay={setAmountToPay}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PaymentForm
                amountToPay={amountToPay}
                setAmountToPay={setAmountToPay}
              />
            </div>

            {selectedDeposit && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary font-semibold">
                    Resumen de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-sm font-medium">Monto Total:</div>
                      <div className="text-sm font-bold text-right">
                        {formatCurrency(Number(selectedDeposit.depo_total))}
                      </div>
                      <div className="text-sm font-medium">Abono Total:</div>
                      <div className="text-sm font-bold text-right">
                        {formatCurrency(
                          Number(selectedDeposit.depo_montoactual)
                        )}
                      </div>
                      <div className="text-sm font-medium">
                        Saldo Pendiente:
                      </div>
                      <div className="text-sm font-bold text-right text-red-600">
                        {formatCurrency(currentBalance)}
                      </div>
                      <div className="text-sm font-medium">Monto a Abonar:</div>
                      <div className="text-sm font-bold text-right text-green-600">
                        {formatCurrency(Number(amountToPay))}
                      </div>
                      <div className="col-span-2 border-t pt-2">
                        <div className="flex justify-between items-center">
                          <div className="text-base font-medium">
                            Nuevo Saldo:
                          </div>
                          <div className="text-base font-bold text-blue-600">
                            {formatCurrency(newBalance)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BodyPayment;
