"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircleIcon,
  BanknoteIcon as BankIcon,
  ArrowRightIcon,
} from "lucide-react";

interface MensualidadPendiente {
  alqm_id: string;
  alqm_identificador: string;
  alqm_fechainicio: string;
  alqm_fechafin: string;
  alqm_montototal: number;
  alqm_montopagado: number;
  ava_alquiler: {
    alq_id: string;
    prop_id: string;
    ava_propiedad: {
      prop_identificador: string;
    };
  };
}

interface DepositoPendiente {
  depo_id: string;
  depo_montoactual: number;
  depo_total: number;
  depo_fechacreacion: string;
  ava_alquiler: {
    alq_id: string;
    prop_id: string;
    ava_propiedad: {
      prop_identificador: string;
    };
  };
}

interface PendingPaymentsData {
  totals: {
    mensualidadesImpagas: number;
    depositosPendientes: number;
  };
  mensualidadesPendientes: MensualidadPendiente[];
  depositosPendientesList: DepositoPendiente[];
}

interface PendingPaymentsOverviewProps {
  data?: PendingPaymentsData;
  loading?: boolean;
  formatCurrency?: (value: number) => string;
  mensualidadesRoute?: string;
  depositosRoute?: string;
  mensualidadDetailRoute?: string;
  depositoDetailRoute?: string;
}

export function PendingPaymentsOverview({
  data,
  loading = false,
  formatCurrency = (value) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value),
  mensualidadesRoute = "/accounting",
  depositosRoute = "/accounting",
  mensualidadDetailRoute = "/accounting/payments/payment",
  depositoDetailRoute = "/accounting/payments/depositpayment",
}: PendingPaymentsOverviewProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const summaryCards = [
    {
      id: "mensualidades",
      title: "Mensualidades Impagas",
      icon: AlertCircleIcon,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      ringColor: "ring-amber-500/30",
      value: data?.totals.mensualidadesImpagas || 0,
      route: mensualidadesRoute,
    },
    {
      id: "depositos",
      title: "Depósitos Pendientes",
      icon: BankIcon,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      ringColor: "ring-emerald-500/30",
      value: data?.totals.depositosPendientes || 0,
      route: depositosRoute,
    },
  ];

  console.log("PendingPaymentsOverview data", data);

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link href={card.route} key={card.id}>
              <Card
                className={`relative group h-full overflow-hidden border--border/40 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                  hoveredCard === card.id ? `ring-2 ${card.ringColor}` : ""
                }`}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full ${card.bgColor} group-hover:bg-white/20 transition-colors duration-300`}
                    >
                      <Icon
                        className={`w-6 h-6 ${card.color}  transition-colors duration-300`}
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-3xl font-bold  transition-colors duration-300">
                        {loading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          card.value
                        )}
                      </span>
                      <ArrowRightIcon className="ml-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 " />
                    </div>
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

      {/* Tabs para las listas de pendientes */}
      <Card className="border shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground">
              Pagos Pendientes
            </CardTitle>
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">
                Requieren atención
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs defaultValue="mensualidades" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger 
                value="mensualidades" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Mensualidades
              </TabsTrigger>
              <TabsTrigger 
                value="depositos"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Depósitos
              </TabsTrigger>
            </TabsList>

            {/* Tab de Mensualidades Pendientes */}
            <TabsContent value="mensualidades" className="mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-4 rounded-lg border space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))
                  ) : data?.mensualidadesPendientes &&
                    data.mensualidadesPendientes.length > 0 ? (
                    data.mensualidadesPendientes.map((item) => {
                      const progress = (item.alqm_montopagado / item.alqm_montototal) * 100;
                      const remaining = item.alqm_montototal - item.alqm_montopagado;
                      
                      return (
                      <Link
                        href={`${mensualidadDetailRoute}/${item.alqm_id}`}
                        key={item.alqm_id}
                        className="block group"
                      >
                        <div className="p-4 rounded-lg border hover:border-amber-400 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-foreground">
                                  {item.alqm_identificador}
                                </h4>
                                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                                  Pendiente
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {item.ava_alquiler.ava_propiedad.prop_identificador}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(item.alqm_fechainicio), "d MMM", { locale: es })} - {format(new Date(item.alqm_fechafin), "d MMM yyyy", { locale: es })}
                              </p>
                            </div>
                            <ArrowRightIcon className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                          </div>
                          <div className="space-y-2 mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Progreso</span>
                              <span className="text-xs font-semibold text-foreground">{Math.round(progress)}%</span>
                            </div>
                            <Progress
                              value={progress}
                              className="h-1.5"
                              indicatorClassName="bg-amber-500"
                            />
                            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                              <div>
                                <p className="text-xs text-muted-foreground">Pagado</p>
                                <p className="text-xs font-semibold text-emerald-600">
                                  {formatCurrency(item.alqm_montopagado)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Pendiente</p>
                                <p className="text-xs font-semibold text-amber-600">
                                  {formatCurrency(remaining)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Total</p>
                                <p className="text-xs font-bold text-foreground">
                                  {formatCurrency(item.alqm_montototal)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-muted-foreground">
                        No hay mensualidades pendientes
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Tab de Depósitos Pendientes */}
            <TabsContent value="depositos" className="mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-4 rounded-lg border space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))
                  ) : data?.depositosPendientesList &&
                    data.depositosPendientesList.length > 0 ? (
                    data.depositosPendientesList.map((item) => {
                      const progress = (item.depo_montoactual / item.depo_total) * 100;
                      const remaining = item.depo_total - item.depo_montoactual;
                      
                      return (
                      <Link
                        href={`${depositoDetailRoute}/${item.depo_id}`}
                        key={item.depo_id}
                        className="block group"
                      >
                        <div className="p-4 rounded-lg border hover:border-emerald-400 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-foreground">
                                  Depósito #{item.depo_id}
                                </h4>
                                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                  En proceso
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {item.ava_alquiler.ava_propiedad.prop_identificador}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(item.depo_fechacreacion), "d MMM yyyy", { locale: es })}
                              </p>
                            </div>
                            <ArrowRightIcon className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                          </div>
                          <div className="space-y-2 mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Progreso</span>
                              <span className="text-xs font-semibold text-foreground">{Math.round(progress)}%</span>
                            </div>
                            <Progress
                              value={progress}
                              className="h-1.5"
                              indicatorClassName="bg-emerald-500"
                            />
                            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                              <div>
                                <p className="text-xs text-muted-foreground">Pagado</p>
                                <p className="text-xs font-semibold text-emerald-600">
                                  {formatCurrency(item.depo_montoactual)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Pendiente</p>
                                <p className="text-xs font-semibold text-amber-600">
                                  {formatCurrency(remaining)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Total</p>
                                <p className="text-xs font-bold text-foreground">
                                  {formatCurrency(item.depo_total)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-muted-foreground">
                        No hay depósitos pendientes
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default PendingPaymentsOverview;
