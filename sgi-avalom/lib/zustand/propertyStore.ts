import { create } from "zustand";
import { AvaPropiedad } from "@/lib/types";

interface PropertyState {
  selectedProperty: AvaPropiedad | null;
  setSelectedProperty: (property: AvaPropiedad | null) => void;
  updateSelectedProperty: (property: Partial<AvaPropiedad>) => void;
}

const usePropertyStore = create<PropertyState>((set) => ({
  selectedProperty: null,
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  updateSelectedProperty: (property) =>
    set((state) => ({
      selectedProperty: state.selectedProperty
        ? { ...state.selectedProperty, ...property }
        : null,
    })),
}));

export default usePropertyStore;
