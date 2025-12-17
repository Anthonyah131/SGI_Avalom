import { z } from "zod";

// ============================================
// Expense Form Schema
// ============================================

export const expenseFormSchema = z.object({
  gas_tipo: z.enum(["S", "M"], {
    message: "El tipo de gasto es requerido",
  }),
  ser_id: z.string().optional(),
  gas_concepto: z
    .string()
    .min(3, "El concepto debe tener al menos 3 caracteres")
    .max(60, "El concepto no puede exceder 60 caracteres"),
  gas_descripcion: z.string().max(200, "La descripción no puede exceder 200 caracteres").optional(),
  gas_monto: z
    .string()
    .min(1, "El monto es requerido")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "El monto debe ser un número mayor a 0",
    }),
  gas_fecha: z.string().min(1, "La fecha es requerida"),
  edi_id: z.string().min(1, "El edificio es requerido"),
  prop_id: z.string().optional(),
  gas_metodopago: z.string().optional(),
  gas_cuenta: z.string().optional(),
  gas_banco: z.string().optional(),
  gas_referencia: z.string().optional(),
  gas_comprobante: z.string().optional(),
  usu_id: z.string(),
}).refine(
  (data) => {
    if (data.gas_tipo === "S") {
      return !!data.ser_id && data.ser_id.length > 0;
    }
    return true;
  },
  {
    message: "El servicio es requerido cuando el tipo es Servicio",
    path: ["ser_id"],
  }
);

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

// ============================================
// Cancellation Form Schema
// ============================================

export const cancellationFormSchema = z.object({
  ang_motivo: z.string().min(1, "El motivo es requerido"),
  ang_descripcion: z.string().max(200, "La descripción no puede exceder 200 caracteres").optional(),
});

export type CancellationFormValues = z.infer<typeof cancellationFormSchema>;

// ============================================
// Service Form Schema
// ============================================

export const serviceFormSchema = z.object({
  ser_codigo: z
    .string()
    .min(1, "El código es requerido")
    .max(30, "El código no puede exceder 30 caracteres")
    .regex(/^[A-Z0-9-]+$/, "El código solo puede contener letras mayúsculas, números y guiones"),
  ser_nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(30, "El nombre no puede exceder 30 caracteres"),
  ser_servicio: z.string().max(40, "El tipo de servicio no puede exceder 40 caracteres").optional(),
  ser_negocio: z.string().max(80, "El negocio no puede exceder 80 caracteres").optional(),
  ser_mediopago: z.string().max(30, "El medio de pago no puede exceder 30 caracteres").optional(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
