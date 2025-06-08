import { create } from "zustand";
import { AvaAlquiler, AvaAlquilerMensual, AvaDeposito } from "@/lib/types";
import { addMonths, endOfMonth, format, parseISO } from "date-fns";
import { convertToUTC, convertToUTCSV, safeParseISO } from "@/utils/dateUtils";
import { toDate } from "date-fns-tz";

interface RentalState {
  selectedRental: AvaAlquiler | null;
  monthlyRents: AvaAlquilerMensual[];
  createMonthlyRents: AvaAlquilerMensual[];
  deposit: AvaDeposito | null;
  isLoading: boolean;

  setSelectedRental: (rental: AvaAlquiler | null) => void;
  setRents: (
    type: "monthlyRents" | "createMonthlyRents",
    rents: AvaAlquilerMensual[]
  ) => void;

  addRent: (
    type: "monthlyRents" | "createMonthlyRents",
    rent: AvaAlquilerMensual
  ) => void;
  updateRent: (
    type: "monthlyRents" | "createMonthlyRents",
    updatedRent: AvaAlquilerMensual
  ) => void;
  setRentStatus: (
    type: "monthlyRents" | "createMonthlyRents",
    alqm_id: string,
    nuevoEstado: string
  ) => void;
  deleteRent: (
    type: "monthlyRents" | "createMonthlyRents",
    alqm_id: string
  ) => { success: boolean; message: string };

  validateRentDates: (
    type: "monthlyRents" | "createMonthlyRents",
    startDate: string,
    endDate: string,
    alqm_identificador: string
  ) => boolean;
  calculateNextDates: (type: "monthlyRents" | "createMonthlyRents") => {
    startDate: string;
    endDate: string;
  };

  setDeposit: (deposit: AvaDeposito | null) => void;
  addDeposit: (newDeposit: AvaDeposito) => void;
  updateDeposit: (updatedDeposit: AvaDeposito) => {
    success: boolean;
    message: string;
  };

  setLoadingState: (loading: boolean) => void;
  resetRentalState: () => void;
}

const useRentalStore = create<RentalState>((set, get) => ({
  selectedRental: null,
  monthlyRents: [],
  createMonthlyRents: [],
  deposit: null,
  isLoading: true,

  setSelectedRental: (rental) =>
    set({
      selectedRental: rental,
      monthlyRents: rental?.ava_alquilermensual || [],
    }),

  setRents: (type, rents) => set({ [type]: rents }),

  addRent: (type, rent) =>
    set((state) => ({
      [type]: [...state[type], rent],
    })),

  updateRent: (type, updatedRent) =>
    set((state) => ({
      [type]: state[type].map((rent) =>
        rent.alqm_id === updatedRent.alqm_id ? updatedRent : rent
      ),
    })),

  setRentStatus: (type, alqm_id, nuevoEstado) =>
    set((state) => ({
      [type]: state[type].map((r) =>
        r.alqm_id.toString() === alqm_id.toString()
          ? { ...r, alqm_estado: nuevoEstado }
          : r
      ),
    })),

  deleteRent: (type, alqm_id) => {
    const state = get();
    const rentToDelete = state[type].find((rent) => rent.alqm_id === alqm_id);

    if (rentToDelete?.ava_pago?.length) {
      return {
        success: false,
        message: "No se puede eliminar un alquiler con pagos relacionados.",
      };
    }

    set({
      [type]: state[type].filter((rent) => rent.alqm_id !== alqm_id),
    });

    return {
      success: true,
      message: "Alquiler eliminado correctamente.",
    };
  },

  validateRentDates: (type, startDate, endDate, alqm_identificador) => {
    const rents = get()[type];

    if (!startDate || !endDate) {
      console.error("Fechas inválidas:", { startDate, endDate });
      return false;
    }

    const newStartDate = convertToUTC(startDate.split("T")[0]);
    const newEndDate = convertToUTC(endDate.split("T")[0]);

    if (!newStartDate || !newEndDate) {
      console.error("Fechas inválidas:", { newStartDate, newEndDate });
      return false;
    }

    for (const rent of rents) {
      if (rent.alqm_identificador === alqm_identificador) continue;

      const rentStartDate = convertToUTC(rent.alqm_fechainicio.split("T")[0]);
      const rentEndDate = convertToUTC(rent.alqm_fechafin.split("T")[0]);

      if (!rentStartDate || !rentEndDate) {
        console.error(
          `Fechas inválidas en el alquiler ${rent.alqm_identificador}:`,
          { rentStartDate, rentEndDate }
        );
        continue;
      }

      if (
        (newStartDate >= rentStartDate && newStartDate < rentEndDate) ||
        (newEndDate > rentStartDate && newEndDate <= rentEndDate) ||
        (newStartDate <= rentStartDate && newEndDate >= rentEndDate)
      ) {
        console.error(
          `Conflicto detectado con el alquiler ${rent.alqm_identificador}.`
        );
        return false;
      }
    }

    return true;
  },

  calculateNextDates: (type) => {
    const rents = get()[type];

    // Si no hay ninguno, arrancamos hoy en CR y fin de siguiente mes en CR
    if (rents.length === 0) {
      const todayUTC = new Date();
      const todayCR = toDate(todayUTC, { timeZone: "America/Costa_Rica" });
      const endOfNextMonthCR = toDate(endOfMonth(addMonths(todayCR, 1)), {
        timeZone: "America/Costa_Rica",
      });

      return {
        startDate: convertToUTCSV(format(todayCR, "yyyy-MM-dd")),
        endDate: convertToUTCSV(format(endOfNextMonthCR, "yyyy-MM-dd")),
      };
    }

    // Si ya hay, sacamos el último fin y calculamos siguiente
    const lastRent = rents[rents.length - 1];
    const lastEndDateUTC = safeParseISO(lastRent.alqm_fechafin)!;
    const lastEndDateCR = toDate(lastEndDateUTC, {
      timeZone: "America/Costa_Rica",
    });

    // Para mantener el día de mes original
    const firstRent = rents[0];
    const firstStartUTC = safeParseISO(firstRent.alqm_fechainicio)!;
    const firstStartCR = toDate(firstStartUTC, {
      timeZone: "America/Costa_Rica",
    });
    const dayOfMonth = firstStartCR.getDate();

    // Calculamos rango siguiente mes
    const nextStartCR = lastEndDateCR;
    const potentialEndCR = addMonths(nextStartCR, 1);
    const daysInMonth = new Date(
      potentialEndCR.getFullYear(),
      potentialEndCR.getMonth() + 1,
      0
    ).getDate();
    const adjustedDay = Math.min(dayOfMonth, daysInMonth);
    const nextEndCR = new Date(
      potentialEndCR.getFullYear(),
      potentialEndCR.getMonth(),
      adjustedDay
    );

    return {
      startDate: convertToUTCSV(format(nextStartCR, "yyyy-MM-dd")),
      endDate: convertToUTCSV(format(nextEndCR, "yyyy-MM-dd")),
    };
  },

  setDeposit: (deposit) => set({ deposit }),

  addDeposit: (newDeposit) => set({ deposit: newDeposit }),

  updateDeposit: (updatedDeposit) => {
    const state = get();

    if (state.deposit?.ava_pago?.length) {
      return {
        success: false,
        message:
          "No se puede editar el depósito porque tiene pagos relacionados.",
      };
    }

    set({ deposit: updatedDeposit });

    return {
      success: true,
      message: "Depósito actualizado correctamente.",
    };
  },

  setLoadingState: (loading) => set({ isLoading: loading }),

  resetRentalState: () =>
    set({
      selectedRental: null,
      monthlyRents: [],
      createMonthlyRents: [],
    }),
}));

export default useRentalStore;
