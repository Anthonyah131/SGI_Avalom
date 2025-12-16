"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { CancelPaymentTable } from "./cancelPaymentTable";
import { useParams } from "next/navigation";
import { useCancelPayment } from "@/hooks/accounting/monthlyRentPayment/useCancelPayment";
import { Skeleton } from "@/components/ui/skeleton";

const BodyCancelPayment: React.FC = () => {
  const { alqmId } = useParams<{ alqmId: string }>();
  const { isLoading, selectedMonthlyRent } = useCancelPayment(alqmId);

  return (
    <div className="mx-auto p-4 space-y-8 max-w-7xl">
      {isLoading ? (
        <>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          <div>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-48" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full rounded-md border-dashed border-2" />

              <div className="grid grid-cols-6 gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>

              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 gap-4 items-center"
                >
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-20 rounded-md" />
                </div>
              ))}
            </CardContent>
          </div>
        </>
      ) : (
        <>
          <Card className="border shadow-lg">
            <CardHeader>
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
              <CardTitle className="text-2xl text-primary font-bold mt-4">
                Anular Pago
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-none">
            <CardContent className="p-0">
              <CancelPaymentTable />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BodyCancelPayment;
