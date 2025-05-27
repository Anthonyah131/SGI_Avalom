"use client";

import {
  Banknote,
  CalendarDays,
  FileWarning,
  HomeIcon,
  Users,
  BadgeDollarSign,
  AlertCircle,
  AlertTriangle,
  Building,
  FileSignature,
  Link,
  User,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import useCanceledRentalStore from "@/lib/zustand/useCanceledRentalStore";
import { format } from "date-fns";

export const RentalInfoCardCanceled = () => {
  const { selectedRental, deposito, propiedad, clientes, hayPagosPendientes } =
    useCanceledRentalStore();

  const clienteNombre = clientes
    .map((c) => `${c.cli_nombre} ${c.cli_papellido}`)
    .join(", ");

  return (
    <Card className="bg-muted/40 border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg sm:text-xl font-semibold text-primary">
          Información del Alquiler Cancelado
        </CardTitle>
      </CardHeader>

      {deposito ? (
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-x-10 text-sm sm:text-base">
          <InfoItem
            icon={<Building className="w-4 h-4 text-muted-foreground" />}
            label="Propiedad"
            value={propiedad?.prop_identificador || "Sin identificar"}
          />
          <InfoItem
            icon={<Link className="w-4 h-4 text-muted-foreground" />}
            label="Descripción"
            value={propiedad?.prop_descripcion || "Sin descripción"}
          />
          <InfoItem
            icon={<User className="w-4 h-4 text-muted-foreground" />}
            label="Link del contrato"
            value={
              selectedRental?.alq_contrato ? (
                <a
                  href={selectedRental.alq_contrato}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Ver contrato
                </a>
              ) : (
                "No disponible"
              )
            }
          />
          <InfoItem
            icon={<Users className="w-4 h-4 text-muted-foreground" />}
            label="Cliente(s)"
            value={clienteNombre || "No asignados"}
          />
          <InfoItem
            icon={<BadgeDollarSign className="w-4 h-4 text-green-600" />}
            label="Monto Alquiler"
            value={`₡${selectedRental?.alq_monto}`}
          />
          <InfoItem
            icon={<FileSignature className="w-4 h-4 text-muted-foreground" />}
            label="Estado"
            value={getEstadoNombre(selectedRental?.alq_estado ?? "")}
          />
          <InfoItem
            icon={<CalendarDays className="w-4 h-4 text-muted-foreground" />}
            label="Día Pago"
            value={
              selectedRental?.alq_fechapago
                ? format(new Date(selectedRental.alq_fechapago), "dd")
                : "No disponible"
            }
          />
          <InfoItem
            icon={<CalendarDays className="w-4 h-4 text-muted-foreground" />}
            label="Fecha de Creación"
            value={
              selectedRental?.alq_fechacreacion
                ? format(
                    new Date(selectedRental.alq_fechacreacion),
                    "dd/MM/yyyy"
                  )
                : "No disponible"
            }
          />
          <InfoItem
            icon={<BadgeDollarSign className="w-4 h-4 text-blue-800" />}
            label="Depósito Actual"
            value={`₡${deposito.depo_montoactual}`}
          />
          <InfoItem
            icon={<AlertTriangle className="w-4 h-4 text-orange-500" />}
            label="Pagos Pendientes"
            value={
              hayPagosPendientes
                ? "⚠️ Sí hay pagos pendientes"
                : "✅ Todos los pagos están completos"
            }
          />
        </CardContent>
      ) : (
        <CardContent className="text-center text-muted-foreground">
          No hay un deposito asociado a este alquiler. No se puede cancelar el
          alquiler sin un depósito.
        </CardContent>
      )}
    </Card>
  );
};

const InfoItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <div className="pt-1">{icon}</div>
    <div className="flex flex-col">
      <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wide">
        {label}
      </span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  </div>
);

const getEstadoNombre = (estado: string) => {
  switch (estado) {
    case "A":
      return "Activo";
    case "F":
      return "Finalizado";
    case "C":
      return "Cancelado";
    default:
      return "Desconocido";
  }
};
