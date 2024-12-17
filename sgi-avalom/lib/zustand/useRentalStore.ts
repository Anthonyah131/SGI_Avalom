import { create } from "zustand";
import { AvaAlquiler, AvaAlquilerMensual } from "@/lib/types";

interface RentalState {
  selectedRental: AvaAlquiler | null;
  monthlyRents: AvaAlquilerMensual[];
  isLoading: boolean;

  setSelectedRental: (rental: AvaAlquiler | null) => void;
  setMonthlyRents: (rents: AvaAlquilerMensual[]) => void;

  addMonthlyRent: (rent: AvaAlquilerMensual) => void;
  updateMonthlyRent: (updatedRent: AvaAlquilerMensual) => void;
  deleteMonthlyRent: (alqm_id: string) => void;

  resetRentalState: () => void;
}

const useRentalStore = create<RentalState>((set) => ({
  selectedRental: null,
  monthlyRents: [],
  isLoading: false,

  setSelectedRental: (rental) =>
    set({
      selectedRental: rental,
      monthlyRents: rental?.ava_alquilermensual || [],
    }),

  setMonthlyRents: (rents) => set({ monthlyRents: rents }),

  addMonthlyRent: (rent) =>
    set((state) => ({ monthlyRents: [...state.monthlyRents, rent] })),

  updateMonthlyRent: (updatedRent) =>
    set((state) => ({
      monthlyRents: state.monthlyRents.map((rent) =>
        rent.alqm_id === updatedRent.alqm_id ? updatedRent : rent
      ),
    })),

  deleteMonthlyRent: (alqm_id) =>
    set((state) => ({
      monthlyRents: state.monthlyRents.filter(
        (rent) => rent.alqm_id !== alqm_id
      ),
    })),

  resetRentalState: () =>
    set({
      selectedRental: null,
      monthlyRents: [],
    }),
}));

export default useRentalStore;
