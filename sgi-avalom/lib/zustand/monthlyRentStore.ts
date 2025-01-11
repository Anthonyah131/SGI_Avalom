import { create } from "zustand";
import { AvaPago, AvaAnulacionPago, AvaAlquilerMensual } from "@/lib/types";

interface PaymentState {
  selectedMonthlyRent: AvaAlquilerMensual | null;
  payments: AvaPago[];
  setPayments: (payments: AvaPago[]) => void;
  addPayment: (payment: AvaPago) => void;
  updatePayment: (updatedPayment: AvaPago) => void;
  deletePayment: (pag_id: string) => void;

  annulments: AvaAnulacionPago[];
  setAnnulments: (annulments: AvaAnulacionPago[]) => void;
  addAnulacionPago: (annulacion: AvaAnulacionPago) => void;
  updateAnulacionPago: (updatedAnulacion: AvaAnulacionPago) => void;
  deleteAnulacionPago: (anp_id: string) => void;

  selectMonthlyRent: (alqm_id: AvaAlquilerMensual | null) => void;
}

const usePaymentStore = create<PaymentState>((set) => ({
  selectedMonthlyRent: null,
  payments: [],
  annulments: [],

  setPayments: (payments) => set({ payments }),

  addPayment: (payment) =>
    set((state) => ({
      payments: [...state.payments, payment],
    })),

  updatePayment: (updatedPayment) =>
    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.pag_id === updatedPayment.pag_id ? updatedPayment : payment
      ),
    })),

  deletePayment: (pag_id) =>
    set((state) => ({
      payments: state.payments.filter((payment) => payment.pag_id !== pag_id),
    })),

  setAnnulments: (annulments) => set({ annulments }),

  addAnulacionPago: (anulacion) =>
    set((state) => ({
      annulments: [...state.annulments, anulacion],
    })),

  updateAnulacionPago: (updatedAnulacion) =>
    set((state) => ({
      annulments: state.annulments.map((anulacion) =>
        anulacion.anp_id === updatedAnulacion.anp_id
          ? updatedAnulacion
          : anulacion
      ),
    })),

  deleteAnulacionPago: (anp_id) =>
    set((state) => ({
      annulments: state.annulments.filter(
        (anulacion) => anulacion.anp_id !== anp_id
      ),
    })),

  selectMonthlyRent: (monthlyrent) => set({ selectedMonthlyRent: monthlyrent }),
}));

export default usePaymentStore;
