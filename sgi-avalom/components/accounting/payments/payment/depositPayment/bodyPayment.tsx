"use client";

import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { ModeToggle } from "@/components/modeToggle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
            <CardTitle className="text-2xl font-bold mt-4">
              Realizar Pago
            </CardTitle>
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
            <PaymentTable
              amountToPay={amountToPay}
              setAmountToPay={setAmountToPay}
            />
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
            <PaymentForm
              amountToPay={amountToPay}
              setAmountToPay={setAmountToPay}
            />
          )}
        </div>

        {selectedDeposit && !isLoading && (
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
                    {formatCurrency(Number(selectedDeposit.depo_total))}
                  </div>
                  <div className="text-sm font-medium">Abono Total:</div>
                  <div className="text-sm font-bold text-right">
                    {formatCurrency(Number(selectedDeposit.depo_montoactual))}
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
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BodyPayment;
