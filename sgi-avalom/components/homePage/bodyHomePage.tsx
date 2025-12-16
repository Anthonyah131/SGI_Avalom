"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import RevenueAreaChart from "@/components/homePage/revenueAreaChart";
import ActivityCards from "@/components/homePage/activityCards";
import { PendingPaymentsOverview } from "./pendingPaymentsOverview";
import { ExpensesSummaryCards } from "./expensesSummaryCards";
import ExpensesAreaChart from "./expensesAreaChart";
import ProfitLossChart from "./profitLossChart";
import { BreadcrumbResponsive } from "../breadcrumbResponsive";
import { formatCurrencyNoDecimals } from "@/utils/currencyConverter";
import { useHomePage } from "@/hooks/homePage/useHomePage";

const BodyHomePage: React.FC = () => {
  const {
    overview,
    revenue,
    expenses,
    expensesSummary,
    profitLoss,
    profitLossTotals,
    pending,
    recentPayments,
    recentCancels,
    recentClients,
    loading,
  } = useHomePage();

  return (
    <div className="mx-auto p-4 space-y-8 max-w-7xl">
      {/* Header */}
      <Card className="border shadow-lg">
        <CardHeader>
          <BreadcrumbResponsive
            items={[
              { label: "Inicio", href: "/homePage" },
              { label: "Contabilidad" },
            ]}
          />
          <CardTitle className="text-2xl text-primary font-bold">
            Dashboard Contable
          </CardTitle>
        </CardHeader>
      </Card>

      {/* 1. Estadísticas Generales - Prioridad Alta */}
      <ActivityCards
        payments={recentPayments}
        cancellations={recentCancels}
        newClients={recentClients}
        loading={loading}
        formatCurrency={formatCurrencyNoDecimals}
        totalProperties={overview?.totalProperties}
        totalClients={overview?.totalClients}
        activeRentals={overview?.activeRentals}
        canceledRentals={overview?.canceledRentals}
      />

      {/* 2. Gráfico de Ganancias y Pérdidas - Prioridad Máxima */}
      <ProfitLossChart
        data={profitLoss ?? []}
        totals={profitLossTotals}
        loading={loading}
      />

      {/* 3. Resumen de Gastos - Prioridad Alta */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground px-2">
          Resumen de Gastos
        </h2>
        <ExpensesSummaryCards
          data={expensesSummary}
          loading={loading}
          formatCurrency={formatCurrencyNoDecimals}
        />
      </div>

      {/* 4. Gráficos de Ingresos y Gastos - Prioridad Media */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueAreaChart data={revenue ?? []} loading={loading} />
        <ExpensesAreaChart data={expenses ?? []} loading={loading} />
      </div>

      {/* 5. Pagos Pendientes - Prioridad Media */}
      <PendingPaymentsOverview data={pending} loading={loading} />
    </div>
  );
};

export default BodyHomePage;
