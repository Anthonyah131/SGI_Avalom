import { create } from "zustand";
import { AvaPropiedad, AvaAlquiler, Cliente, AvaClientexAlquiler } from "@/lib/types";

interface PropertyState {
  selectedProperty: AvaPropiedad | null;
  selectedRental: AvaAlquiler | null;
  setSelectedProperty: (property: AvaPropiedad | null) => void;
  setSelectedRental: (rental: AvaAlquiler | null) => void;
  updateSelectedProperty: (property: Partial<AvaPropiedad>) => void;
  addRental: (rental: AvaAlquiler) => void;
  updateRental: (id: number, updatedRental: AvaAlquiler) => void;
  removeRental: (id: number) => void;
  addClientToRental: (client: Cliente) => void;
  removeClientFromRental: (clientId: number) => void;
}

const usePropertyStore = create<PropertyState>((set) => ({
  selectedProperty: null,
  selectedRental: null,
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  setSelectedRental: (rental) => set({ selectedRental: rental }),
  updateSelectedProperty: (property) =>
    set((state) => ({
      selectedProperty: {
        ...state.selectedProperty,
        ...property,
      } as AvaPropiedad,
    })),
  addRental: (rental) =>
    set((state) => ({
      selectedProperty: state.selectedProperty
        ? {
            ...state.selectedProperty,
            ava_alquiler: [
              ...(state.selectedProperty?.ava_alquiler || []),
              rental,
            ],
          }
        : null,
    })),
  updateRental: (id, updatedRental) =>
    set((state) => ({
      selectedProperty: state.selectedProperty
        ? {
            ...state.selectedProperty,
            ava_alquiler: state.selectedProperty?.ava_alquiler?.map((rental) =>
              rental.alq_id === id ? updatedRental : rental
            ),
          }
        : null,
    })),
  removeRental: (id) =>
    set((state) => ({
      selectedProperty: state.selectedProperty
        ? {
            ...state.selectedProperty,
            ava_alquiler: state.selectedProperty?.ava_alquiler?.filter(
              (rental) => rental.alq_id !== id
            ),
          }
        : null,
    })),
  addClientToRental: (client) =>
    set((state) => {
      if (!state.selectedRental || !state.selectedProperty) return state;

      const newClientRental: AvaClientexAlquiler = {
        alq_id: state.selectedRental.alq_id,
        cli_id: client.cli_id,
        ava_alquiler: state.selectedRental,
        ava_cliente: client,
      };

      const updatedRental = {
        ...state.selectedRental,
        ava_clientexalquiler: [
          ...(state.selectedRental?.ava_clientexalquiler || []),
          newClientRental,
        ],
      };

      return {
        selectedRental: updatedRental,
        selectedProperty: {
          ...state.selectedProperty,
          ava_alquiler: state.selectedProperty.ava_alquiler.map((rental) =>
            rental.alq_id === state.selectedRental?.alq_id
              ? updatedRental
              : rental
          ),
        },
      };
    }),
  removeClientFromRental: (clientId) =>
    set((state) => {
      if (!state.selectedRental || !state.selectedProperty) return state;

      const updatedRental = {
        ...state.selectedRental,
        ava_clientexalquiler: state.selectedRental.ava_clientexalquiler?.filter(
          (relation) => relation.cli_id !== clientId
        ),
      };

      return {
        selectedRental: updatedRental,
        selectedProperty: {
          ...state.selectedProperty,
          ava_alquiler: state.selectedProperty.ava_alquiler.map((rental) =>
            rental.alq_id === state.selectedRental?.alq_id
              ? updatedRental
              : rental
          ),
        },
      };
    }),
}));

export default usePropertyStore;
