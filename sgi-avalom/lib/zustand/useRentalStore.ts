import { create } from "zustand";
import { AvaAlquiler, AvaAlquilerMensual } from "@/lib/types";
import { addMonths, endOfMonth, format, parseISO } from "date-fns";
import { convertToUTC, safeParseISO } from "@/utils/dateUtils";
import { toDate } from "date-fns-tz";

interface RentalState {
  selectedRental: AvaAlquiler | null;
  monthlyRents: AvaAlquilerMensual[];
  createMonthlyRents: AvaAlquilerMensual[];
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

  setLoadingState: (loading: boolean) => void;
  resetRentalState: () => void;
}

const useRentalStore = create<RentalState>((set, get) => ({
  selectedRental: null,
  monthlyRents: [],
  createMonthlyRents: [],
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

    const newStartDate = safeParseISO(convertToUTC(startDate));
    const newEndDate = safeParseISO(convertToUTC(endDate));

    if (!newStartDate || !newEndDate) {
      console.error("Fechas inválidas:", { newStartDate, newEndDate });
      return false;
    }

    for (const rent of rents) {
      if (rent.alqm_identificador === alqm_identificador) continue;

      const rentStartDate = safeParseISO(rent.alqm_fechainicio);
      const rentEndDate = safeParseISO(rent.alqm_fechafin);

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
  
    if (rents.length === 0) {
      const todayUTC = new Date();
      const todayCR = toDate(todayUTC, { timeZone: "America/Costa_Rica" });
      const endOfNextMonthCR = toDate(endOfMonth(addMonths(todayCR, 1)), {
        timeZone: "America/Costa_Rica",
      });
  
      return {
        startDate: format(todayCR, "yyyy-MM-dd"),
        endDate: format(endOfNextMonthCR, "yyyy-MM-dd"),
      };
    }
  
    const lastRent = rents[rents.length - 1];
    const lastEndDateUTC = safeParseISO(lastRent.alqm_fechafin);
  
    if (!lastEndDateUTC) {
      console.error(
        `Error al procesar la última fecha de fin del alquiler (${lastRent.alqm_fechafin}).`
      );
      const todayUTC = new Date();
      return {
        startDate: format(todayUTC, "yyyy-MM-dd"),
        endDate: format(endOfMonth(addMonths(todayUTC, 1)), "yyyy-MM-dd"),
      };
    }
  
    const lastEndDateCR = toDate(lastEndDateUTC, {
      timeZone: "America/Costa_Rica",
    });
  
    // Obtener el día exacto del primer alquiler mensual
    const firstRent = rents[0];
    const firstStartDateUTC = safeParseISO(firstRent.alqm_fechainicio);
    const firstStartDateCR = firstStartDateUTC
      ? toDate(firstStartDateUTC, { timeZone: "America/Costa_Rica" })
      : new Date();
    const dayOfMonth = firstStartDateCR.getDate();
  
    // La fecha de inicio del nuevo alquiler es la misma que la fecha final del último alquiler
    const nextStartDateCR = lastEndDateCR;
  
    // Calcular la fecha de fin del nuevo alquiler respetando el día inicial del primer alquiler
    const potentialEndDateCR = addMonths(nextStartDateCR, 1);
  
    // Ajustar la fecha final respetando el día del mes o el último día del mes
    const daysInMonth = new Date(
      potentialEndDateCR.getFullYear(),
      potentialEndDateCR.getMonth() + 1,
      0
    ).getDate();
    const adjustedDay = Math.min(dayOfMonth, daysInMonth);
  
    const nextEndDateCR = new Date(
      potentialEndDateCR.getFullYear(),
      potentialEndDateCR.getMonth(),
      adjustedDay
    );
  
    return {
      startDate: convertToUTC(nextStartDateCR.toISOString()),
      endDate: convertToUTC(nextEndDateCR.toISOString()),
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
