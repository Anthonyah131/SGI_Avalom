"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Ban, Plus, Wallet, TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/utils/currencyConverter";
import useRentalStore from "@/lib/zustand/useRentalStore";
import { useParams } from "next/navigation";

export function DepositView() {
  const { deposit, payments } = useRentalStore((state) => ({
    deposit: state.deposit,
    payments: state.deposit?.ava_pago || [],
  }));
  const { alqId } = useParams();

  if (!deposit) {
    return (
      <Card className="border shadow-md">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            Depósito
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Alert variant="default" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No existe un depósito para este alquiler.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Link href={`/mantRent/edit/${alqId}/`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Crear Depósito
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasPayments = payments.length > 0;
  const formattedTotal = formatCurrency(Number(deposit.depo_total));
  const formattedCurrent = formatCurrency(Number(deposit.depo_montoactual));
  const progress = Number(deposit.depo_total) > 0
    ? (Number(deposit.depo_montoactual) / Number(deposit.depo_total)) * 100
    : 0;
  const remaining = Number(deposit.depo_total) - Number(deposit.depo_montoactual);

  return (
    <Card className="border shadow-md">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            Depósito
          </CardTitle>
          <div className="flex gap-2">
            <Link href={`/accounting/payments/depositpayment/${deposit.depo_id}/`}>
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ingresar Pago
              </Button>
            </Link>
            <Link href={`/accounting/payments/depositcancelpayment/${deposit.depo_id}/`}>
              <Button variant="destructive" size="sm">
                <Ban className="h-4 w-4 mr-2" />
                Anular
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Progreso del depósito */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Progreso del depósito</span>
            <span className="text-xs font-bold text-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" indicatorClassName="bg-primary" />
        </div>

        {/* Montos */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Total
            </p>
            <p className="text-base font-bold text-foreground">{formattedTotal}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Pagado
            </p>
            <p className="text-base font-semibold text-emerald-600">{formattedCurrent}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Pendiente
            </p>
            <p className="text-base font-semibold text-amber-600">
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        {/* Alertas */}
        {hasPayments && (
          <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs">
              Este depósito tiene {payments.length} pago
              {payments.length !== 1 ? "s" : ""} registrado
              {payments.length !== 1 ? "s" : ""}.
            </AlertDescription>
          </Alert>
        )}

        {deposit.depo_fechadevolucion && (
          <Alert variant="destructive" className="border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Este depósito fue devuelto el{" "}
              {new Date(deposit.depo_fechadevolucion).toLocaleDateString(
                "es-CR"
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
