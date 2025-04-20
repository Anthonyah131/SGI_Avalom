"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Calendar,
  FileText,
  AlertTriangle,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import { formatCurrency } from "@/utils/currencyConverter";
import { convertToCostaRicaTime } from "@/utils/dateUtils";
import { StatusFilter } from "@/components/dataTable/status-filter";
import ManageActions from "@/components/dataTable/manageActions";
import { CancelPaymentForm } from "./cancelPaymentForm";
import { useParams } from "next/navigation";
import { useCancelPayment } from "@/hooks/accounting/depositPayment/useCancelPayment";

export function CancelPaymentTable() {
  const { depoId } = useParams<{ depoId: string }>();
  const {
    filteredPayments,
    toggleDescription,
    expandedDescriptions,
    handleSort,
    selectedStatuses,
    setSelectedStatuses,
    fetchPayments,
  } = useCancelPayment(depoId);

  const handleModalClose = async () => {
    await fetchPayments();
  };

  if (!filteredPayments.length) {
    return (
      <div className="text-center text-sm text-gray-500">
        No hay pagos disponibles.
      </div>
    );
  }

  const renderMobileView = () => (
    <div className="space-y-4">
      {filteredPayments.map((payment) => (
        <Card key={payment.pag_id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pago ID: {payment.pag_id}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 pt-0">
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Monto:
                </span>
                <span className="text-sm">
                  {formatCurrency(Number(payment.pag_monto))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Fecha:
                </span>
                <span className="text-sm">
                  {convertToCostaRicaTime(payment.pag_fechapago)}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Descripción:
                </span>
                <p className="text-sm mt-1">
                  {expandedDescriptions[payment.pag_id]
                    ? payment.pag_descripcion
                    : payment.pag_descripcion?.slice(0, 50)}
                  {payment.pag_descripcion &&
                    payment.pag_descripcion.length > 50 && (
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal"
                        onClick={() => toggleDescription(payment.pag_id)}
                      >
                        {expandedDescriptions[payment.pag_id]
                          ? "Ver menos"
                          : "Ver más"}
                      </Button>
                    )}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Estado:</span>
                <span
                  className={`text-sm ${
                    payment.pag_estado === "A"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {payment.pag_estado === "A" ? "Activo" : "Anulado"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <ManageActions
                  titleButton="Anular"
                  title="Anular Pago"
                  description="Complete el formulario para anular el pago"
                  variant="destructive"
                  classn="w-full"
                  icon={<AlertTriangle className="w-4 h-4" />}
                  FormComponent={
                    <CancelPaymentForm
                      payment={payment}
                      onClose={handleModalClose}
                    />
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDesktopView = () => (
    <Table>
      <TableHeader>
        <TableRow className="cursor-pointer hover:bg-muted">
          <TableHead>
            <Button variant="table" onClick={() => handleSort("pag_id")}>
              ID <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="table" onClick={() => handleSort("pag_monto")}>
              Monto <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>
            <Button variant="table" onClick={() => handleSort("pag_estado")}>
              Estado <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="table" onClick={() => handleSort("pag_fechapago")}>
              Fecha de Pago <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredPayments.map((payment) => (
          <TableRow key={payment.pag_id}>
            <TableCell>{payment.pag_id}</TableCell>
            <TableCell>{formatCurrency(Number(payment.pag_monto))}</TableCell>
            <TableCell>
              {expandedDescriptions[payment.pag_id]
                ? payment.pag_descripcion
                : payment.pag_descripcion?.slice(0, 50)}
              {payment.pag_descripcion &&
                payment.pag_descripcion.length > 50 && (
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => toggleDescription(payment.pag_id)}
                  >
                    {expandedDescriptions[payment.pag_id]
                      ? "Ver menos"
                      : "Ver más"}
                  </Button>
                )}
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                  payment.pag_estado === "A"
                    ? "bg-green-800 text-green-100 ring-1 ring-inset ring-green-600/20"
                    : "bg-red-800 text-red-100 ring-1 ring-inset ring-red-600/20"
                }`}
              >
                {payment.pag_estado === "A" ? "Activo" : "Anulado"}
              </span>
            </TableCell>
            <TableCell>
              {convertToCostaRicaTime(payment.pag_fechapago)}
            </TableCell>
            <TableCell>
              <ManageActions
                titleButton="Anular"
                title="Anular Pago"
                description="Complete el formulario para anular el pago"
                variant="destructive"
                icon={<AlertTriangle className="w-4 h-4" />}
                FormComponent={
                  <CancelPaymentForm
                    payment={payment}
                    onClose={handleModalClose}
                  />
                }
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Pagos Asociados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <StatusFilter
            statuses={[
              { label: "Activo", value: "A" },
              { label: "Anulado", value: "D" },
            ]}
            selectedStatuses={selectedStatuses}
            onStatusChange={setSelectedStatuses}
          />
        </div>
        <div className="md:hidden">{renderMobileView()}</div>
        <div className="hidden md:block overflow-x-auto">
          {renderDesktopView()}
        </div>
      </CardContent>
    </Card>
  );
}
