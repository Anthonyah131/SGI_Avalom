import { create } from "zustand";
import { AvaAlquiler, AvaDeposito, Cliente } from "@/lib/types";

interface FinishedRentalState {
  selectedRental: AvaAlquiler | null;
  setSelectedRental: (rental: AvaAlquiler | null) => void;

  clientes: Cliente[];
  setClientes: (clientes: Cliente[]) => void;

  propiedad: {
    prop_id: string;
    prop_identificador: string;
    prop_descripcion: string;
    edi_id: string;
    tipp_id: string;
  } | null;
  setPropiedad: (prop: FinishedRentalState["propiedad"]) => void;

  deposito: AvaDeposito | null;
  setDeposito: (deposito: AvaDeposito | null) => void;

  hayPagosPendientes: boolean;
  setHayPagosPendientes: (estado: boolean) => void;

  isLoading: boolean;
  setLoading: (estado: boolean) => void;
}

const useFinishedRentalStore = create<FinishedRentalState>((set) => ({
  selectedRental: null,
  setSelectedRental: (rental) => set({ selectedRental: rental }),

  clientes: [],
  setClientes: (clientes) => set({ clientes }),

  propiedad: null,
  setPropiedad: (prop) => set({ propiedad: prop }),

  deposito: null,
  setDeposito: (deposito) => set({ deposito }),

  hayPagosPendientes: false,
  setHayPagosPendientes: (estado) => set({ hayPagosPendientes: estado }),

  isLoading: false,
  setLoading: (estado) => set({ isLoading: estado }),
}));

export default useFinishedRentalStore;
