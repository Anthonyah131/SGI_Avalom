"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { ModeToggle } from "@/components/modeToggle";
import { CancelPaymentTable } from "./cancelPaymentTable";
import { useParams } from "next/navigation";
import { useCancelPayment } from "@/hooks/accounting/monthlyRentPayment/useCancelPayment";

const BodyCancelPayment: React.FC = () => {
  const { alqmId } = useParams<{ alqmId: string }>();
  const { isLoading, selectedMonthlyRent } = useCancelPayment(alqmId);

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
                  href: `/accounting/payments/${selectedMonthlyRent?.alq_id}`,
                },
                { label: "Anular pago" },
              ]}
            />
            <CardTitle className="text-2xl font-bold mt-4">
              Anular Pago
            </CardTitle>
          </div>
          <ModeToggle />
        </CardHeader>
      </Card>

      <Card className="bg-background border-none">
        <CardContent className="p-0">
          <CancelPaymentTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyCancelPayment;
