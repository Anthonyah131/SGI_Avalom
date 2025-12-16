import { useState, useEffect } from "react";
import cookie from "js-cookie";
import { MonthlyTotal } from "@/components/homePage/revenueAreaChart";
import { MonthlyExpense } from "@/components/homePage/expensesAreaChart";
import { ProfitLossData } from "@/components/homePage/profitLossChart";

interface Overview {
  totalProperties: number;
  totalClients: number;
  activeRentals: number;
  canceledRentals: number;
}

interface RecentPayment {
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
  type: string;
  title: string;
  description: string;
  dateRange: string;
}

interface RecentCancellation {
  alqc_motivo: string;
  alqc_montodevuelto: number;
  alqc_castigo: number;
  alqc_fecha_cancelacion: string;
  alq_id: string;
  alq_monto: number;
  prop_identificador: string;
}

interface RecentClient {
  cli_nombre: string;
  cli_papellido: string;
  cli_correo: string;
  cli_telefono: string;
  cli_fechacreacion: string;
}

interface UseHomePageReturn {
  overview: Overview | null;
  revenue: MonthlyTotal[] | null;
  expenses: MonthlyExpense[] | null;
  expensesSummary: any;
  profitLoss: ProfitLossData[] | null;
  profitLossTotals: any;
  pending: any;
  recentPayments: RecentPayment[];
  recentCancels: RecentCancellation[];
  recentClients: RecentClient[];
  loading: boolean;
}

export const useHomePage = (): UseHomePageReturn => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [revenue, setRevenue] = useState<MonthlyTotal[] | null>(null);
  const [expenses, setExpenses] = useState<MonthlyExpense[] | null>(null);
  const [expensesSummary, setExpensesSummary] = useState<any>(null);
  const [profitLoss, setProfitLoss] = useState<ProfitLossData[] | null>(null);
  const [profitLossTotals, setProfitLossTotals] = useState<any>(null);
  const [pending, setPending] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [recentCancels, setRecentCancels] = useState<RecentCancellation[]>([]);
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = cookie.get("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const [oRes, rRes, eRes, esRes, plRes, pRes, aRes] = await Promise.all([
          fetch("/api/dashboard/overview", { headers }),
          fetch("/api/dashboard/revenue?months=12", { headers }),
          fetch("/api/dashboard/expenses/monthly?months=12", { headers }),
          fetch("/api/dashboard/expenses/summary", { headers }),
          fetch("/api/dashboard/profit-loss?months=12", { headers }),
          fetch("/api/dashboard/payments/pending", { headers }),
          fetch("/api/dashboard/activities/recent", { headers }),
        ]);

        const [
          { data: o },
          { data: r },
          { data: e },
          { data: es },
          { data: pl },
          { data: p },
          { data: a },
        ] = await Promise.all([
          oRes.json(),
          rRes.json(),
          eRes.json(),
          esRes.json(),
          plRes.json(),
          pRes.json(),
          aRes.json(),
        ]);

        setOverview(o);
        setRevenue(
          r.monthlyTotals.map((m: any) => ({
            month: m.month,
            total: Number(m.total),
          }))
        );
        setExpenses(
          e.monthlyTotals.map((m: any) => ({
            month: m.month,
            total: Number(m.total),
          }))
        );
        setExpensesSummary(es);
        setProfitLoss(pl.monthlyData);
        setProfitLossTotals(pl.totals);
        setPending(p);
        setRecentPayments(
          a.recentPayments.map((payment: any) => {
            const isDeposit = !!payment.ava_deposito;
            return {
              pag_monto: payment.pag_monto,
              pag_fechapago: payment.pag_fechapago,
              pag_metodopago: payment.pag_metodopago,
              pag_banco: payment.pag_banco,
              pag_referencia: payment.pag_referencia,
              pag_estado: payment.pag_estado,
              alqm_identificador: isDeposit
                ? ""
                : payment.ava_alquilermensual?.alqm_identificador ?? "—",
              alqm_fechainicio: isDeposit
                ? ""
                : payment.ava_alquilermensual?.alqm_fechainicio ?? "",
              alqm_fechafin: isDeposit
                ? ""
                : payment.ava_alquilermensual?.alqm_fechafin ?? "",
              alq_id: isDeposit
                ? String(payment.ava_deposito.depo_id)
                : String(payment.ava_alquilermensual?.alq_id ?? ""),
              type: isDeposit ? "Depósito" : "Mensualidad",
              title: isDeposit
                ? `Depósito ${payment.ava_deposito.depo_id}`
                : `Alquiler ${
                    payment.ava_alquilermensual?.alqm_identificador ?? "—"
                  }`,
              description: isDeposit
                ? `Pago realizado mediante ${payment.pag_metodopago}`
                : `${payment.pag_metodopago} - ${payment.pag_banco || "N/A"}`,
              dateRange:
                !isDeposit &&
                payment.ava_alquilermensual?.alqm_fechainicio &&
                payment.ava_alquilermensual?.alqm_fechafin
                  ? `Del ${new Date(
                      payment.ava_alquilermensual.alqm_fechainicio
                    ).toLocaleDateString("es-CR")} al ${new Date(
                      payment.ava_alquilermensual.alqm_fechafin
                    ).toLocaleDateString("es-CR")}`
                  : "",
            };
          })
        );

        setRecentCancels(
          a.recentCancellations.map((cancel: any) => ({
            alqc_motivo: cancel.alqc_motivo,
            alqc_montodevuelto: cancel.alqc_montodevuelto,
            alqc_castigo: cancel.alqc_castigo,
            alqc_fecha_cancelacion: cancel.alqc_fecha_cancelacion,
            alq_id: String(cancel.ava_alquiler.alq_id),
            alq_monto: cancel.ava_alquiler.alq_monto,
            prop_identificador:
              cancel.ava_alquiler.ava_propiedad?.prop_identificador ?? "—",
          }))
        );

        setRecentClients(
          a.recentClients.map((client: any) => ({
            cli_nombre: client.cli_nombre,
            cli_papellido: client.cli_papellido,
            cli_correo: client.cli_correo,
            cli_telefono: client.cli_telefono,
            cli_fechacreacion: client.cli_fechacreacion,
          }))
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
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
  };
};
