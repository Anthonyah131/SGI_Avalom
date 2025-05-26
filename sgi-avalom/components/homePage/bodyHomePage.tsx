"use client";

import { useState, useEffect } from "react";
import cookie from "js-cookie";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import RevenueAreaChart, {
  MonthlyTotal,
} from "@/components/homePage/revenueAreaChart";
import ActivityCards from "@/components/homePage/activityCards";
import { PendingPaymentsOverview } from "./pendingPaymentsOverview";
import { TopPerformersOverview } from "./topPerformersOverview";
import { ModeToggle } from "../modeToggle";
import { BreadcrumbResponsive } from "../breadcrumbResponsive";

interface Overview {
  totalProperties: number;
  totalClients: number;
  activeRentals: number;
  canceledRentals: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const BodyHomePage: React.FC = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [revenue, setRevenue] = useState<MonthlyTotal[] | null>(null);
  const [pending, setPending] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<[]>([]);
  const [recentCancels, setRecentCancels] = useState<[]>([]);
  const [recentClients, setRecentClients] = useState<[]>([]);
  const [topClients, setTopClients] = useState<[]>([]);
  const [topProperties, setTopProperties] = useState<[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = cookie.get("token");
      if (!token) return;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [oRes, rRes, pRes, aRes, cRes, prRes] = await Promise.all([
        fetch("/api/dashboard/overview", { headers }),
        fetch("/api/dashboard/revenue?months=12", { headers }),
        fetch("/api/dashboard/payments/pending", { headers }),
        fetch("/api/dashboard/activities/recent", { headers }),
        fetch("/api/dashboard/clients/top", { headers }),
        fetch("/api/dashboard/properties/top", { headers }),
      ]);

      const [
        { data: o },
        { data: r },
        { data: p },
        { data: a },
        { data: c },
        { data: pr },
      ] = await Promise.all([
        oRes.json(),
        rRes.json(),
        pRes.json(),
        aRes.json(),
        cRes.json(),
        prRes.json(),
      ]);

      setOverview(o);
      setRevenue(
        r.monthlyTotals.map((m: any) => ({
          month: m.month,
          total: Number(m.total),
        }))
      );
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
            alq_id: isDeposit
              ? payment.ava_deposito.depo_id
              : payment.ava_alquilermensual?.alq_id,
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
          alq_id: cancel.ava_alquiler.alq_id,
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

      setTopClients(c);
      setTopProperties(pr);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="mx-auto p-4 space-y-8">
      <Card className="flex flex-col sm:flex-row justify-between items-center">
        <CardHeader>
          <BreadcrumbResponsive
            items={[
              { label: "Inicio", href: "/homePage" },
              { label: "Contabilidad" },
            ]}
          />
          <CardTitle className="text-2xl text-primary font-bold mb-4 sm:mb-0">
            Contabilidad
          </CardTitle>
        </CardHeader>
        <div className="flex flex-wrap justify-center gap-2 p-4">
          <ModeToggle />
        </div>
      </Card>

      <ActivityCards
        payments={recentPayments}
        cancellations={recentCancels}
        newClients={recentClients}
        loading={loading}
        formatCurrency={formatCurrency}
        totalProperties={overview?.totalProperties}
        totalClients={overview?.totalClients}
        activeRentals={overview?.activeRentals}
        canceledRentals={overview?.canceledRentals}
      />

      <RevenueAreaChart data={revenue ?? []} loading={loading} />

      <PendingPaymentsOverview data={pending} loading={loading} />

      <TopPerformersOverview
        topClients={topClients}
        topProperties={topProperties}
        loading={loading}
        clientDetailRoute="/mantClient"
        propertyDetailRoute="/mantBuild"
      />
    </div>
  );
};

export default BodyHomePage;
