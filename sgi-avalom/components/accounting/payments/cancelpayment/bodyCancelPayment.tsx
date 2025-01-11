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

const BodyCancelPayment: React.FC = () => {
  const { alqmId } = useParams();

  const { selectedMonthlyRent, selectMonthlyRent, setPayments } =
    usePaymentStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    if (alqmId) {
      fetchRental();
    }
  }, [alqmId, selectMonthlyRent, setPayments]);

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

      <Card className="bg-background">
        <CardContent className="p-6">
          Aca va el contenido del componente
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyCancelPayment;
