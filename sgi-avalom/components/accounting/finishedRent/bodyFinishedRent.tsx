"use client";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { ModeToggle } from "@/components/modeToggle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FinishedRentForm } from "./finishedRentForm";
import useRentalStore from "@/lib/zustand/useRentalStore";
import axios from "axios";
import cookie from "js-cookie";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { RentalInfoCard } from "./rentalInfoCard";

const BodyFinishedRent: React.FC = () => {
  const {
    setSelectedRental,
    monthlyRents,
    isLoading,
    setLoadingState,
    setDeposit,
  } = useRentalStore();
  const { alqId } = useParams();

  useEffect(() => {
    const fetchRental = async () => {
      setLoadingState(true);
      try {
        const token = cookie.get("token");
        if (!token) throw new Error("Token no disponible");

        const response = await axios.get(`/api/modifiyrent/${alqId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response?.data?.success) {
          setSelectedRental(response.data.data);
          setDeposit(response.data.data.ava_deposito[0]);
        } else {
          throw new Error(response?.data?.error || "Error al cargar alquiler.");
        }
      } catch (error: any) {
        const message =
          error.response?.data?.error || error.message || "Error desconocido";
        toast.error("Error", {
          description: message || "Error al cargar el alquiler.",
        });
      } finally {
        setLoadingState(false);
      }
    };

    if (alqId) {
      fetchRental();
    }
  }, [alqId, setSelectedRental, setLoadingState]);

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
        <div className="flex flex-wrap justify-center gap-2 p-4">
          <ModeToggle />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Finalizar Alquiler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RentalInfoCard />
          <FinishedRentForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyFinishedRent;
