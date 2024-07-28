// src/lib/zustand/buildStore.ts
import { create } from "zustand";
import { AvaPropiedad, AvaEdificio } from "@/lib/types";

interface BuildingState {
  buildings: AvaEdificio[];
  setBuildings: (buildings: AvaEdificio[]) => void;
  addBuilding: (building: AvaEdificio) => void;
  updateBuilding: (building: AvaEdificio) => void;
  removeBuilding: (edi_id: number) => void;

  addProperty: (edi_id: number, property: AvaPropiedad) => void;
  updateProperty: (edi_id: number, updatedProperty: AvaPropiedad) => void;
  removeProperty: (edi_id: number, prop_id: number) => void;
}

const useBuildingStore = create<BuildingState>((set) => ({
  buildings: [],
  setBuildings: (buildings) => set({ buildings }),
  addBuilding: (building) =>
    set((state) => ({ buildings: [...state.buildings, building] })),
  updateBuilding: (updatedBuilding) =>
    set((state) => ({
      buildings: state.buildings.map((building) =>
        building.edi_id === updatedBuilding.edi_id ? updatedBuilding : building
      ),
    })),
  removeBuilding: (edi_id) =>
    set((state) => ({
      buildings: state.buildings.filter(
        (building) => building.edi_id !== edi_id
      ),
    })),

  addProperty: (edi_id, property) =>
    set((state) => ({
      buildings: state.buildings.map((building) =>
        building.edi_id === edi_id
          ? {
              ...building,
              ava_propiedad: [...building.ava_propiedad, property],
            }
          : building
      ),
    })),

  updateProperty: (edi_id, updatedProperty) =>
    set((state) => ({
      buildings: state.buildings.map((building) =>
        building.edi_id === edi_id
          ? {
              ...building,
              ava_propiedad: building.ava_propiedad.map((property) =>
                property.prop_id === updatedProperty.prop_id
                  ? updatedProperty
                  : property
              ),
            }
          : building
      ),
    })),

  removeProperty: (edi_id, prop_id) =>
    set((state) => ({
      buildings: state.buildings.map((building) =>
        building.edi_id === edi_id
          ? {
              ...building,
              ava_propiedad: building.ava_propiedad.filter(
                (property) => property.prop_id !== prop_id
              ),
            }
          : building
      ),
    })),
}));

export default useBuildingStore;
