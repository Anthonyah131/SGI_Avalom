"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  DollarSign,
  Calendar,
  FileText,
  AlertTriangle,
  ArrowUpDown,
  User,
  XCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusFilter } from "@/components/dataTable/status-filter";
import ManageActions from "@/components/dataTable/manageActions";
import { CancelPaymentForm } from "./cancelPaymentForm";
import { formatCurrency } from "@/utils/currencyConverter";
import { convertToCostaRicaTime } from "@/utils/dateUtils";
import { useCancelPayment } from "@/hooks/accounting/depositPayment/useCancelPayment";
import { cn } from "@/lib/utils";

export function CancelPaymentTable() {
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [selectedAnulacion, setSelectedAnulacion] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { depoId } = useParams<{ depoId: string }>();
  const {
    filteredPayments,
    toggleDescription,
    expandedDescriptions,
    handleSort,
    selectedStatuses,
    setSelectedStatuses,
  } = useCancelPayment(depoId);

  const renderMobileView = () => (
    <div className="space-y-4">
      {filteredPayments.map((payment) => {
        const isAnulado = payment.pag_estado === "D";
        const anulacion = payment.ava_anulacionpago?.[0];

        return (
          <Card
            key={payment.pag_id}
            className={cn(
              "border shadow-sm transition-all",
              isAnulado && "border-red-500/30 bg-red-500/5"
            )}
          >
            <CardContent className="p-4 space-y-4">
              {/* Header con estado */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">
                    {formatCurrency(Number(payment.pag_monto))}
                  </span>
                </div>
                <Badge
                  variant={isAnulado ? "destructive" : "default"}
                  className={cn(
                    isAnulado
                      ? "bg-red-500/10 text-red-600 border-red-500/30"
                      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  )}
                >
                  {isAnulado ? (
                    <XCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  )}
                  {isAnulado ? "Anulado" : "Activo"}
                </Badge>
              </div>

              <Separator />

              {/* Información del pago */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Banco</p>
                  <p className="font-medium">{payment.pag_banco || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Método de Pago
                  </p>
                  <p className="font-medium">{payment.pag_metodopago}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">
                    Referencia
                  </p>
                  <p className="font-medium">{payment.pag_referencia || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Fecha</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {convertToCostaRicaTime(payment.pag_fechapago)}
                  </p>
                </div>
                {payment.pag_descripcion && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      Descripción
                    </p>
                    <p className="text-sm">
                      {expandedDescriptions[payment.pag_id]
                        ? payment.pag_descripcion
                        : payment.pag_descripcion.slice(0, 80)}
                      {payment.pag_descripcion.length > 80 && (
                        <Button
                          variant="link"
                          className="p-0 h-auto ml-1 text-xs"
                          onClick={() => toggleDescription(payment.pag_id)}
                        >
                          {expandedDescriptions[payment.pag_id]
                            ? "Ver menos"
                            : "Ver más"}
                        </Button>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Información de anulación */}
              {isAnulado && anulacion && (
                <>
                  <Separator />
                  <div className="space-y-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Información de Anulación
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Fecha de Anulación
                        </p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {convertToCostaRicaTime(anulacion.anp_fechaanulacion)}
                        </p>
                      </div>
                      {anulacion.ava_usuario && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Anulado por
                          </p>
                          <p className="font-medium flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {anulacion.ava_usuario.usu_nombre}{" "}
                            {anulacion.ava_usuario.usu_papellido}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Motivo
                        </p>
                        <p className="font-medium">{anulacion.anp_motivo}</p>
                      </div>
                      {anulacion.anp_descripcion && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            Descripción
                          </p>
                          <p className="text-sm">{anulacion.anp_descripcion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Botones de acción */}
              <div className="pt-2">
                {!isAnulado ? (
                  <ManageActions
                    open={activePaymentId === payment.pag_id}
                    onOpenChange={(open) =>
                      setActivePaymentId(open ? payment.pag_id : null)
                    }
                    titleButton="Anular"
                    title="Anular Pago"
                    description="Complete el formulario para anular el pago"
                    variant="destructive"
                    classn="w-full"
                    icon={<AlertTriangle className="w-4 h-4" />}
                    disabled={payment.pag_estado === "D"}
                    FormComponent={
                      <CancelPaymentForm
                        payment={payment}
                        onSuccess={() => {
                          setActivePaymentId(null);
                        }}
                      />
                    }
                  />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedAnulacion({ payment, anulacion });
                      setIsDialogOpen(true);
                    }}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Ver Detalles de Anulación
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderDesktopView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="table" onClick={() => handleSort("pag_monto")}>
                Monto <ArrowUpDown className="text-primary ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Banco</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Referencia</TableHead>
            <TableHead>Fecha Pago</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Anulación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPayments.map((payment) => {
            const isAnulado = payment.pag_estado === "D";
            const anulacion = payment.ava_anulacionpago?.[0];

            return (
              <TableRow
                key={payment.pag_id}
                className={cn(
                  "hover:bg-muted/50",
                  isAnulado && "bg-red-500/5"
                )}
              >
                <TableCell className="font-semibold">
                  {formatCurrency(Number(payment.pag_monto))}
                </TableCell>
                <TableCell>{payment.pag_banco || "—"}</TableCell>
                <TableCell>{payment.pag_metodopago}</TableCell>
                <TableCell>{payment.pag_referencia || "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {convertToCostaRicaTime(payment.pag_fechapago)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isAnulado ? "destructive" : "default"}
                    className={cn(
                      isAnulado
                        ? "bg-red-500/10 text-red-600 border-red-500/30"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    )}
                  >
                    {isAnulado ? (
                      <XCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    )}
                    {isAnulado ? "Anulado" : "Activo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isAnulado && anulacion ? (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {convertToCostaRicaTime(anulacion.anp_fechaanulacion)}
                      </div>
                      {anulacion.ava_usuario && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-3 w-3" />
                          {anulacion.ava_usuario.usu_nombre}{" "}
                          {anulacion.ava_usuario.usu_papellido}
                        </div>
                      )}
                      <div className="text-red-600 font-medium">
                        {anulacion.anp_motivo}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!isAnulado ? (
                    <ManageActions
                      open={activePaymentId === payment.pag_id}
                      onOpenChange={(open) =>
                        setActivePaymentId(open ? payment.pag_id : null)
                      }
                      titleButton="Anular"
                      title="Anular Pago"
                      description="Complete el formulario para anular el pago"
                      variant="destructive"
                      icon={<AlertTriangle className="w-4 h-4" />}
                      disabled={payment.pag_estado === "D"}
                      FormComponent={
                        <CancelPaymentForm
                          payment={payment}
                          onSuccess={() => {
                            setActivePaymentId(null);
                          }}
                        />
                      }
                    />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAnulacion({ payment, anulacion });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <Card className="border shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-bold text-foreground">
            Pagos Asociados
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4">
            <StatusFilter
              filterName="Estado"
              statuses={[
                { label: "Activo", value: "A" },
                { label: "Anulado", value: "D" },
              ]}
              selectedStatuses={selectedStatuses}
              onStatusChange={setSelectedStatuses}
            />
          </div>
          {filteredPayments.length > 0 ? (
            <>
              <div className="lg:hidden">{renderMobileView()}</div>
              <div className="hidden lg:block">{renderDesktopView()}</div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-4">
              <AlertTriangle className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm font-medium">
                No hay pagos asociados con el estado seleccionado.
              </p>
              <p className="text-xs text-muted-foreground">
                Cambia los filtros o registra un nuevo pago para comenzar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles de anulación */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <span>Detalles de Anulación</span>
            </DialogTitle>
            <DialogDescription>
              Información completa del pago anulado
            </DialogDescription>
          </DialogHeader>

          {selectedAnulacion && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Monto destacado con gradiente */}
                <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/5 via-red-500/10 to-red-500/5 p-6 text-center shadow-sm">
                  <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
                  <p className="relative text-xs font-medium text-muted-foreground mb-2">
                    Monto Anulado
                  </p>
                  <p className="relative text-3xl font-bold text-foreground">
                    {formatCurrency(Number(selectedAnulacion.payment.pag_monto))}
                  </p>
                </div>

                {/* Información del pago */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Datos del Pago
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors">
                      <p className="text-xs text-muted-foreground">Método</p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedAnulacion.payment.pag_metodopago}
                      </p>
                    </div>
                    <div className="space-y-1 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors">
                      <p className="text-xs text-muted-foreground">Banco</p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedAnulacion.payment.pag_banco || "—"}
                      </p>
                    </div>
                    <div className="space-y-1 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors">
                      <p className="text-xs text-muted-foreground">Referencia</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {selectedAnulacion.payment.pag_referencia || "—"}
                      </p>
                    </div>
                    <div className="space-y-1 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors">
                      <p className="text-xs text-muted-foreground">Fecha Pago</p>
                      <p className="text-sm font-semibold text-foreground">
                        {convertToCostaRicaTime(selectedAnulacion.payment.pag_fechapago)}
                      </p>
                    </div>
                  </div>
                  {selectedAnulacion.payment.pag_descripcion && (
                    <div className="space-y-1 p-3 rounded-lg border bg-muted/30">
                      <p className="text-xs text-muted-foreground">Descripción del Pago</p>
                      <p className="text-sm text-foreground">
                        {selectedAnulacion.payment.pag_descripcion}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Información de anulación */}
                {selectedAnulacion.anulacion && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-red-600 flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-red-500/10">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      Información de Anulación
                    </h3>
                    <div className="space-y-3 p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10">
                          <Calendar className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">
                            Fecha de Anulación
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {convertToCostaRicaTime(selectedAnulacion.anulacion.anp_fechaanulacion)}
                          </p>
                        </div>
                      </div>

                      {selectedAnulacion.anulacion.ava_usuario && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-red-500/10">
                            <User className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">
                              Anulado Por
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {selectedAnulacion.anulacion.ava_usuario.usu_nombre}{" "}
                              {selectedAnulacion.anulacion.ava_usuario.usu_papellido}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {selectedAnulacion.anulacion.ava_usuario.usu_correo}
                            </p>
                          </div>
                        </div>
                      )}

                      <Separator className="bg-red-500/20" />

                      <div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Motivo de Anulación
                        </p>
                        <p className="text-base font-bold text-red-600">
                          {selectedAnulacion.anulacion.anp_motivo}
                        </p>
                      </div>

                      {selectedAnulacion.anulacion.anp_descripcion && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Descripción Adicional
                          </p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {selectedAnulacion.anulacion.anp_descripcion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
