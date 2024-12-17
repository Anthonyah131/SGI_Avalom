"use client";

import { useEffect } from "react";
import RentalForm from "@/components/mantRent/edit/rentalForm";
import { ModeToggle } from "../../modeToggle";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { useParams } from "next/navigation";
import { DateRangeCalculator } from "./DateRangeCalculator";
import useRentalStore from "@/lib/zustand/useRentalStore";
import axios from "axios";
import cookie from "js-cookie";
import { toast } from "sonner";

const BodyEditRent: React.FC = () => {
  const { alqId } = useParams();
  const { setSelectedRental } = useRentalStore();

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const token = cookie.get("token");
        if (!token) throw new Error("Token no disponible");

        const response = await axios.get(`/api/modifiyrent/${alqId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response?.data?.success) {
          setSelectedRental(response.data.data);
        } else {
          throw new Error(response?.data?.error || "Error al cargar alquiler.");
        }
      } catch (error: any) {
        toast.error("Error", {
          description: error.message || "Error al cargar el alquiler.",
        });
      }
    };

    if (alqId) {
      fetchRental();
    }
  }, [alqId, setSelectedRental]);

  return (
    <div className="mx-auto p-4 space-y-8">
      <Card className="bg-background flex flex-col sm:flex-row justify-between items-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">
            Modificar alquiler
          </CardTitle>
        </CardHeader>
        <div className="flex flex-wrap justify-center gap-2 p-4">
          <ModeToggle />
        </div>
      </Card>

      <Card>
        <CardContent>
          <DateRangeCalculator />
        </CardContent>
      </Card>

      <RentalForm action="edit" onSuccess={() => {}} />
    </div>
  );
};

export default BodyEditRent;
