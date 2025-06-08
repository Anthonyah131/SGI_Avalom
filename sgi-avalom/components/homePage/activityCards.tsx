"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CreditCardIcon,
  XCircleIcon,
  UserPlusIcon,
  HomeIcon,
  UsersIcon,
  DollarSignIcon,
} from "lucide-react";
import Link from "next/link";
import { convertToCostaRicaTime } from "@/utils/dateUtils";

export interface ActivityItem {
  id?: string;
  date?: string;
  title?: string;
  description?: string;
  amount?: number;
  status?: string;
  [key: string]: any;
}

interface PaymentItem {
  pag_monto: number;
  pag_fechapago: string;
  pag_metodopago: string;
  pag_banco: string;
  pag_referencia: string;
  pag_estado: string;
  alqm_identificador: string;
  alqm_fechainicio: string;
  alqm_fechafin: string;
  alq_id: string;
  title?: string;
  type?: string; // "Depósito" o "Mensualidad"
  description?: string; // Descripción del pago
  dateRange?: string; // Rango de fechas de la mensualidad
}

interface CancellationItem {
  alqc_motivo: string;
  alqc_montodevuelto: number;
  alqc_castigo: number;
  alqc_fecha_cancelacion: string;
  alq_id: string;
  alq_monto: number;
  prop_identificador: string;
}

interface ClientItem {
  cli_nombre: string;
  cli_papellido: string;
  cli_correo: string;
  cli_telefono: string;
  cli_fechacreacion: string;
}

interface ActivityCardsProps {
  payments: PaymentItem[];
  cancellations: CancellationItem[];
  newClients: ClientItem[];
  loading?: boolean;
  formatCurrency?: (value: number) => string;
  totalProperties?: number;
  totalClients?: number;
  activeRentals?: number;
  canceledRentals?: number;
}

export function ActivityCards({
  payments = [],
  cancellations = [],
  newClients = [],
  loading = false,
  formatCurrency = (value) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(value),
  totalProperties = 0,
  totalClients = 0,
  activeRentals = 0,
  canceledRentals = 0,
}: ActivityCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const processedPayments: ActivityItem[] = payments.map((payment, index) => ({
    id: `payment-${index}`,
    date: payment.pag_fechapago,
    title: payment.title,
    status: payment.pag_estado,
    amount: payment.pag_monto,
    description: payment.description,
    type: payment.type,
    dateRange: payment.dateRange,
    alq_id: payment.alq_id,
  }));

  const processedCancellations: ActivityItem[] = cancellations.map(
    (cancel, index) => ({
      id: `cancel-${index}`,
      date: cancel.alqc_fecha_cancelacion,
      title: `Propiedad ${cancel.prop_identificador}`,
      amount: cancel.alqc_montodevuelto,
      description: cancel.alqc_motivo,
      status: cancel.alqc_castigo > 0 ? "Con penalización" : "Sin penalización",
      ...cancel,
    })
  );

  const processedClients: ActivityItem[] = newClients.map((client, index) => ({
    id: `client-${index}`,
    date: client.cli_fechacreacion,
    title: `${client.cli_nombre} ${client.cli_papellido}`,
    description: `${client.cli_correo} - ${client.cli_telefono}`,
    ...client,
  }));

  const activityCards = [
    {
      id: "payments",
      title: "Pagos Recientes",
      icon: CreditCardIcon,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      ringColor: "ring-emerald-500/30",
      data: processedPayments,
      renderItem: (item: ActivityItem) => (
        <Link href={`/accounting/payments/${item.alq_id}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {convertToCostaRicaTime(item.date || "")}
              </p>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              )}
              {item.dateRange && (
                <p className="text-xs text-muted-foreground mt-1">
                  {item.dateRange}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={item.status === "A" ? "outline" : "destructive"}>
                {item.status === "A" ? "Activo" : "Anulado"}
              </Badge>
              <Badge variant="secondary">{item.type}</Badge>
              <Badge variant="outline">
                {formatCurrency(item.amount || 0)}
              </Badge>
            </div>
          </div>
        </Link>
      ),
    },
    {
      id: "cancellations",
      title: "Alquileres Cancelados",
      icon: XCircleIcon,
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      ringColor: "ring-rose-500/30",
      data: processedCancellations,
      renderItem: (item: ActivityItem) => (
        <div>
          <div className="flex items-center justify-between">
            <p className="font-medium">{item.title}</p>
            <Badge
              variant={item.status === "resolved" ? "outline" : "destructive"}
            >
              {item.status || "Pendiente"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(new Date(item.date || ""), "d MMM yyyy", { locale: es })}
          </p>
          {item.description && (
            <p className="text-sm mt-1 text-muted-foreground">
              {item.description}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "newclients",
      title: "Clientes Nuevos",
      icon: UserPlusIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      ringColor: "ring-blue-500/30",
      data: processedClients,
      renderItem: (item: ActivityItem) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(item.date || ""), "d MMM yyyy", { locale: es })}
          </p>
          {item.description && (
            <p className="text-sm mt-1 text-muted-foreground">
              {item.description}
            </p>
          )}
        </div>
      ),
    },
  ];

  const statCards = [
    {
      id: "properties",
      title: "Departamentos/Alquileres",
      icon: HomeIcon,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      ringColor: "ring-indigo-500/30",
      value: totalProperties,
      href: "/mantBuild",
    },
    {
      id: "clients",
      title: "Clientes",
      icon: UsersIcon,
      color: "text-green-500",
      bgColor: "bg-green-50",
      ringColor: "ring-green-500/30",
      value: totalClients,
      href: "/mantClient",
    },
    {
      id: "activeRentals",
      title: "Alquileres Activos",
      icon: DollarSignIcon,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      ringColor: "ring-yellow-500/30",
      value: activeRentals,
      href: "/mantRent",
    },
    {
      id: "canceledRentals",
      title: "Alquileres Cancelados",
      icon: XCircleIcon,
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      ringColor: "ring-rose-500/30",
      value: canceledRentals,
      href: "/mantRent",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link href={card.href} key={card.id} className="block h-full">
              <Card
                className={`relative group h-full overflow-hidden  shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                  hoveredCard === card.id ? `ring-2 ${card.ringColor}` : ""
                }`}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="absolute inset-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300" />

                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full ${card.bgColor}  transition-colors duration-300`}
                    >
                      <Icon
                        className={`w-6 h-6 ${card.color}  transition-colors duration-300`}
                      />
                    </div>
                    <span className="text-3xl font-bold  transition-colors duration-300">
                      {loading ? <Skeleton className="h-8 w-16" /> : card.value}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium  transition-colors duration-300">
                    {card.title}
                  </h3>

                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-${
                      card.color.split("-")[1]
                    }-500`}
                  />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {activityCards.map((activityCard) => {
          const Icon = activityCard.icon;

          return (
            <div
              key={activityCard.id}
              className="h-full"
              onMouseEnter={() => setHoveredCard(activityCard.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card
                className={`relative group h-full overflow-hidden  shadow-sm hover:shadow-md transition-all duration-300 ${
                  hoveredCard === activityCard.id
                    ? `ring-2 ${activityCard.ringColor}`
                    : ""
                }`}
              >
                <div className="absolute inset-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300" />

                <CardHeader className="relative z-10">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${activityCard.bgColor}  transition-colors duration-300`}
                    >
                      <Icon
                        className={`w-5 h-5 ${activityCard.color}  transition-colors duration-300`}
                      />
                    </div>
                    <CardTitle className="text-lg  transition-colors duration-300">
                      {activityCard.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <ScrollArea className="h-[220px] pr-4">
                    <div className="space-y-4">
                      {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        ))
                      ) : activityCard.data.length > 0 ? (
                        activityCard.data.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-lg border border-border/50 group-hover:border-white/20 transition-colors duration-300"
                          >
                            {activityCard.renderItem(item)}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full py-8">
                          <p className="text-muted-foreground text-sm">
                            No hay datos disponibles
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>

                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                />
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityCards;
