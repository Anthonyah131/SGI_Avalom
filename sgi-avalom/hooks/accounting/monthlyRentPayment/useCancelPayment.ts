import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import cookie from "js-cookie";
import usePaymentStore from "@/lib/zustand/monthlyPaymentStore";
import { AvaPago } from "@/lib/types";

export function useCancelPayment(alqmId: string | undefined) {
  const { selectedMonthlyRent, selectMonthlyRent, setPayments, payments } =
    usePaymentStore();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<AvaPago | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: string]: boolean;
  }>({});
  const [sortField, setSortField] = useState<
    "pag_id" | "pag_monto" | "pag_fechapago" | "pag_estado"
  >("pag_id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      const response = await axios.get(
        `/api/accounting/monthlyrent/${alqmId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.success) {
        selectMonthlyRent(response.data.data);
        if (Array.isArray(response.data.data.ava_pago)) {
          setPayments(response.data.data.ava_pago);
        } else {
          throw new Error("Error: `ava_pago` no es un array");
        }
      } else {
        throw new Error(
          response?.data?.error || "Error al cargar alquiler mensual."
        );
      }
    } catch (error: any) {
      throw new Error(error.message ? error.message : error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (alqmId) {
      fetchPayments();
    }
  }, [alqmId]);

  const toggleDescription = (pagId: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [pagId]: !prev[pagId],
    }));
  };

  const handleSort = (
    field: "pag_id" | "pag_monto" | "pag_fechapago" | "pag_estado"
  ) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedPayments = useMemo(() => {
    return payments
      .filter((p) => p.alqm_id === alqmId)
      .sort((a, b) => {
        if (a[sortField] < b[sortField])
          return sortDirection === "asc" ? -1 : 1;
        if (a[sortField] > b[sortField])
          return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [payments, alqmId, sortField, sortDirection]);

  const filteredPayments = useMemo(() => {
    if (selectedStatuses.length === 0) return sortedPayments;
    return sortedPayments.filter((payment) =>
      selectedStatuses.includes(payment.pag_estado)
    );
  }, [sortedPayments, selectedStatuses]);

  return {
    isLoading,
    selectedMonthlyRent,
    filteredPayments,
    selectedPayment,
    toggleDescription,
    expandedDescriptions,
    handleSort,
    setSelectedPayment,
    selectedStatuses,
    setSelectedStatuses,
    fetchPayments,
  };
}
