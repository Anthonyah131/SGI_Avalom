"use client";

import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { ModeToggle } from "@/components/modeToggle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CanceledRentForm } from "./CanceledRentForm";
import { RentalInfoCardCanceled } from "./rentalInfoCardCanceled";
import useCanceledRentalStore from "@/lib/zustand/useCanceledRentalStore";
import axios from "axios";
import cookie from "js-cookie";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const BodyCanceledRent: React.FC = () => {
  const {
    setSelectedRental,
    setDeposito,
    setPropiedad,
    setClientes,
    setLoading,
    setHayPagosPendientes,
  } = useCanceledRentalStore();
  const { alqId } = useParams();

  useEffect(() => {
    const fetchRental = async () => {
      setLoading(true);
      try {
        const token = cookie.get("token");
        if (!token) throw new Error("Token no disponible");

        const response = await axios.get(
          `/api/accounting/canceledrent/cancel/${alqId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response?.data?.success) {
          const data = response.data.data;
          setSelectedRental(data.alquiler);
          setDeposito(data.deposito);
          setPropiedad(data.propiedad);
          setClientes(data.clientes);
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
  }, [
    alqId,
    setSelectedRental,
    setDeposito,
    setPropiedad,
    setClientes,
    setLoading,
  ]);

  return (
    <div className="mx-auto p-4 max-w-7xl space-y-8">
      <Card className="bg-background flex flex-col sm:flex-row justify-between items-center">
        <CardHeader>
          <BreadcrumbResponsive
            items={[
              { label: "Inicio", href: "/homePage" },
              { label: "Contabilidad", href: "/accounting" },
              { label: "Cancelar Alquiler" },
            ]}
          />
          <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">
            Cancelar Alquiler
          </CardTitle>
        </CardHeader>
        <div className="flex flex-wrap justify-center gap-2 p-4">
          <ModeToggle />
        </div>
      </Card>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Cancelar Alquiler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RentalInfoCardCanceled />
          <CanceledRentForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyCanceledRent;
