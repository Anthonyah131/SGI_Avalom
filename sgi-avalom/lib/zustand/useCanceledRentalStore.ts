import { create } from "zustand";
import { AvaAlquiler, AvaDeposito, Cliente, AvaPropiedad } from "@/lib/types";

interface CanceledRentalState {
  selectedRental: AvaAlquiler | null;
  deposito: AvaDeposito | null;
  propiedad: AvaPropiedad | null;
  clientes: Cliente[];
  isLoading: boolean;
  hayPagosPendientes: boolean;
  setHayPagosPendientes: (estado: boolean) => void;
  setSelectedRental: (rental: AvaAlquiler) => void;
  setDeposito: (deposito: AvaDeposito) => void;
  setPropiedad: (propiedad: AvaPropiedad) => void;
  setClientes: (clientes: Cliente[]) => void;
  setLoading: (loading: boolean) => void;
}

const useCanceledRentalStore = create<CanceledRentalState>((set) => ({
  selectedRental: null,
  deposito: null,
  propiedad: null,
  clientes: [],
  isLoading: false,
  hayPagosPendientes: false,
  setHayPagosPendientes: (estado) => set({ hayPagosPendientes: estado }),
  setSelectedRental: (rental) => set({ selectedRental: rental }),
  setDeposito: (deposito) => set({ deposito }),
  setPropiedad: (propiedad) => set({ propiedad }),
  setClientes: (clientes) => set({ clientes }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

export default useCanceledRentalStore;
