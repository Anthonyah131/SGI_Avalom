import { create } from "zustand";
import { AvaAlquiler } from "../types";

interface RentalState {
  rentals: AvaAlquiler[];
  selectedRental: AvaAlquiler | null;
  setRentals: (rentals: AvaAlquiler[]) => void;
  selectRental: (rental: AvaAlquiler) => void;
  clearSelectedRental: () => void;
}

const useRentalStore = create<RentalState>((set) => ({
  rentals: [],
  selectedRental: null,
  setRentals: (rentals) => set({ rentals }),
  selectRental: (rental) => set({ selectedRental: rental }),
  clearSelectedRental: () => set({ selectedRental: null }),
}));

export default useRentalStore;
