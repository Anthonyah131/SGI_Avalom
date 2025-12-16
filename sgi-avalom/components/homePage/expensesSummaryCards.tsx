"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDownIcon, CalendarIcon, DollarSignIcon, WrenchIcon, ZapIcon } from "lucide-react";

interface ExpensesSummary {
  total: number;
  monthly: number;
  yearly: number;
  services: number;
  maintenance: number;
}

interface ExpensesSummaryCardsProps {
  data?: ExpensesSummary;
  loading?: boolean;
  formatCurrency?: (value: number) => string;
}

export function ExpensesSummaryCards({
  data,
  loading = false,
  formatCurrency = (value) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value),
}: ExpensesSummaryCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const cards = [
    {
      id: "total",
      title: "Total de Gastos",
      icon: DollarSignIcon,
      color: "text-red-500",
      bgColor: "bg-red-50",
      ringColor: "ring-red-500/30",
      value: data?.total || 0,
      description: "Todos los gastos registrados",
    },
    {
      id: "monthly",
      title: "Gastos del Mes",
      icon: CalendarIcon,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      ringColor: "ring-orange-500/30",
      value: data?.monthly || 0,
      description: "Gastos del mes actual",
    },
    {
      id: "yearly",
      title: "Gastos del Año",
      icon: TrendingDownIcon,
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      ringColor: "ring-rose-500/30",
      value: data?.yearly || 0,
      description: "Gastos acumulados del año",
    },
    {
      id: "services",
      title: "Gastos en Servicios",
      icon: ZapIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      ringColor: "ring-blue-500/30",
      value: data?.services || 0,
      description: "Servicios (luz, agua, etc.)",
    },
    {
      id: "maintenance",
      title: "Gastos en Mantenimiento",
      icon: WrenchIcon,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      ringColor: "ring-purple-500/30",
      value: data?.maintenance || 0,
      description: "Reparaciones y mantenimiento",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Link href="/expenses" key={card.id} className="block h-full">
            <Card
              className={`relative group h-full overflow-hidden border-2 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${
                hoveredCard === card.id ? `ring-2 ${card.ringColor}` : ""
              }`}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon
                      className={`w-6 h-6 ${card.color} transition-colors duration-300`}
                    />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  {card.title}
                </h3>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {loading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    formatCurrency(Number(card.value))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>

                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${card.color.replace("text-", "bg-")}`}
                />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default ExpensesSummaryCards;

