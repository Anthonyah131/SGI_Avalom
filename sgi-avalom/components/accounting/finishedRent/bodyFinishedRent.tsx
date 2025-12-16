"use client";

import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FinishedRentForm } from "./finishedRentForm";
import { RentalInfoCard } from "./rentalInfoCard";
import useFinishedRentalStore from "@/lib/zustand/useFinishedRentalStore";
import axios from "axios";
import cookie from "js-cookie";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const BodyFinishedRent: React.FC = () => {
  const {
    setSelectedRental,
    setClientes,
    setPropiedad,
    setDeposito,
    setHayPagosPendientes,
    setLoading,
    isLoading,
  } = useFinishedRentalStore();
  const { alqId } = useParams();

  useEffect(() => {
    const fetchRental = async () => {
      setLoading(true);
      try {
        const token = cookie.get("token");
        if (!token) throw new Error("Token no disponible");

        const response = await axios.get(
          `/api/accounting/finishedrent/finalize/${alqId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response?.data?.success) {
          const data = response.data.data;
          setSelectedRental(data.alquiler);
          setClientes(data.clientes);
          setPropiedad(data.propiedad);
          setDeposito(data.deposito);
          setHayPagosPendientes(data.hayPagosPendientes);
        } else {
          throw new Error(response?.data?.error || "Error al cargar alquiler.");
        }
      } catch (error: any) {
        const message =
          error.response?.data?.error || error.message || "Error desconocido";
        toast.error("Error", {
          description: message,
        });
      } finally {
        setLoading(false);
      }
    };

    if (alqId) {
      fetchRental();
    }
  }, [alqId]);

  return (
    <div className="mx-auto p-4 max-w-7xl space-y-8">
      <Card className="flex flex-col sm:flex-row justify-between items-center">
        <CardHeader>
          <BreadcrumbResponsive
            items={[
              { label: "Inicio", href: "/homePage" },
              { label: "Contabilidad", href: "/accounting" },
              { label: "Finalizar Alquiler" },
            ]}
          />
          <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">
            Finalizar Alquiler
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Finalizar Alquiler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RentalInfoCard />
          <FinishedRentForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyFinishedRent;
