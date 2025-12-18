"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ContractData } from "@/components/mantBuild/contract";

interface User {
  id: string;
  nombre: string;
  cedula: string;
}

export default function GenerateContractModal() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ContractData>({
    arrendante: "",
    cedulaArrendante: "",
    arrendatario: "",
    cedulaArrendatario: "",
    estadoCivil: "",
    direccion: "",
    aptoNumero: "",
    contratoDesde: "",
    contratoHasta: "",
    montoTotal: 0,
    diaPago: new Date().getDate(),
    duracionAnios: 1,
    diaPrimerPago: 0,
    numeroMiembros: 0,
    depositoGarantia: 0,
    fechaFirma: "",
    matriculaFinca: "",
    planoFinca: "",
    ubicacionFinca: "",
    linderosFinca: "",
    descripcionApartamento: "",
  });

  useEffect(() => {
    if (!open) return;
    setLoadingUsers(true);
    fetch("/api/users/listUsers")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingUsers(false));
  }, [open]);

  const validateForm = (): boolean => {
    // Validar campos de texto obligatorios
    if (!data.arrendante || data.arrendante.trim() === "") {
      toast.error("El campo 'Arrendante' es obligatorio");
      return false;
    }

    if (!data.cedulaArrendante || data.cedulaArrendante.trim() === "") {
      toast.error("El campo 'Cédula Arrendante' es obligatorio");
      return false;
    }

    if (!data.arrendatario || data.arrendatario.trim() === "") {
      toast.error("El campo 'Arrendatario' es obligatorio");
      return false;
    }

    if (!data.cedulaArrendatario || data.cedulaArrendatario.trim() === "") {
      toast.error("El campo 'Cédula Arrendatario' es obligatorio");
      return false;
    }

    if (!data.estadoCivil || data.estadoCivil.trim() === "") {
      toast.error("El campo 'Estado Civil' es obligatorio");
      return false;
    }

    if (!data.direccion || data.direccion.trim() === "") {
      toast.error("El campo 'Dirección' es obligatorio");
      return false;
    }

    if (!data.aptoNumero || data.aptoNumero.trim() === "") {
      toast.error("El campo 'Número de Apartamento' es obligatorio");
      return false;
    }

    if (!data.contratoDesde || data.contratoDesde.trim() === "") {
      toast.error("El campo 'Fecha Desde' es obligatorio");
      return false;
    }

    if (!data.contratoHasta || data.contratoHasta.trim() === "") {
      toast.error("El campo 'Fecha Hasta' es obligatorio");
      return false;
    }

    // Validar campos numéricos obligatorios
    if (!data.montoTotal || data.montoTotal <= 0) {
      toast.error("El campo 'Monto Total Anual' es obligatorio y debe ser mayor a 0");
      return false;
    }

    if (!data.diaPago || data.diaPago < 1 || data.diaPago > 31) {
      toast.error("El campo 'Día de Pago Mensual' es obligatorio y debe estar entre 1 y 31");
      return false;
    }

    if (!data.duracionAnios || data.duracionAnios <= 0) {
      toast.error("El campo 'Duración' es obligatorio y debe ser mayor a 0");
      return false;
    }

    if (!data.diaPrimerPago || data.diaPrimerPago < 1 || data.diaPrimerPago > 31) {
      toast.error("El campo 'Día del Primer Pago' es obligatorio y debe estar entre 1 y 31");
      return false;
    }

    if (!data.numeroMiembros || data.numeroMiembros < 1) {
      toast.error("El campo 'Número de Miembros del Núcleo Familiar' es obligatorio y debe ser mayor a 0");
      return false;
    }

    if (!data.depositoGarantia || data.depositoGarantia <= 0) {
      toast.error("El campo 'Depósito de Garantía' es obligatorio y debe ser mayor a 0");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Validar todos los campos obligatorios
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al generar contrato");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast.success("Contrato generado correctamente");
      setOpen(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Error al generar contrato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Generar Contrato</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generar Contrato</DialogTitle>
          <DialogDescription>
            Rellena la información faltante y selecciona un usuario.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="user-select">Usuario</Label>
            <Select
              onValueChange={(val) => {
                const user = users.find((u) => u.id === val);
                if (user) {
                  setData((prev) => ({
                    ...prev,
                    arrendatario: user.nombre,
                    cedulaArrendatario: user.cedula,
                  }));
                }
              }}
              disabled={loadingUsers}
            >
              <SelectTrigger id="user-select">
                <SelectValue
                  placeholder={
                    loadingUsers ? "Cargando..." : "Selecciona usuario"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nombre} - {u.cedula}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Sección 1: Información de las Partes (según introducción del contrato) */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2">Información de las Partes</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Datos del arrendante y arrendatario según aparecen en la introducción del contrato
            </p>
          </div>

          <div>
            <Label htmlFor="arrendante">
              Arrendante <span className="text-red-500">*</span>
            </Label>
            <Input
              id="arrendante"
              autoComplete="off"
              value={data.arrendante}
              onChange={(e) =>
                setData((prev) => ({ ...prev, arrendante: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Nombre completo del propietario o arrendante
            </p>
          </div>
          <div>
            <Label htmlFor="cedulaArrendante">
              Cédula Arrendante <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cedulaArrendante"
              autoComplete="off"
              value={data.cedulaArrendante}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  cedulaArrendante: e.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Número de cédula del arrendante
            </p>
          </div>
          <div>
            <Label htmlFor="arrendatario">
              Arrendatario <span className="text-red-500">*</span>
            </Label>
            <Input
              id="arrendatario"
              autoComplete="off"
              value={data.arrendatario}
              onChange={(e) =>
                setData((prev) => ({ ...prev, arrendatario: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Nombre completo del arrendatario
            </p>
          </div>
          <div>
            <Label htmlFor="cedulaArrendatario">
              Cédula Arrendatario <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cedulaArrendatario"
              autoComplete="off"
              value={data.cedulaArrendatario}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  cedulaArrendatario: e.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Número de cédula del arrendatario
            </p>
          </div>
          <div>
            <Label htmlFor="estadoCivil">
              Estado Civil del Arrendatario <span className="text-red-500">*</span>
            </Label>
            <Input
              id="estadoCivil"
              autoComplete="off"
              value={data.estadoCivil}
              onChange={(e) =>
                setData((prev) => ({ ...prev, estadoCivil: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Estado civil del arrendatario (soltero, casado, etc.)
            </p>
          </div>
          <div>
            <Label htmlFor="direccion">
              Dirección del Arrendatario <span className="text-red-500">*</span>
            </Label>
            <Input
              id="direccion"
              autoComplete="off"
              value={data.direccion}
              onChange={(e) =>
                setData((prev) => ({ ...prev, direccion: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Dirección de residencia del arrendatario
            </p>
          </div>
          <div>
            <Label htmlFor="aptoNumero">
              Número de Apartamento <span className="text-red-500">*</span>
            </Label>
            <Input
              id="aptoNumero"
              autoComplete="off"
              value={data.aptoNumero}
              onChange={(e) =>
                setData((prev) => ({ ...prev, aptoNumero: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Identificador o número del apartamento a arrendar
            </p>
          </div>

          {/* Sección 2: Información de la Finca (PRIMERA cláusula - opcionales) */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2">Información de la Finca (Opcional)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Si no se completan, se dejarán espacios en blanco para llenar manualmente
            </p>
          </div>

          <div>
            <Label htmlFor="matriculaFinca">Matrícula de la Finca</Label>
            <Input
              id="matriculaFinca"
              type="text"
              autoComplete="off"
              placeholder="Ej: CIENTO SESENTA Y NUEVE MIL NOVECIENTOS OCHENTA Y SIETE-CERO CERO CERO"
              value={data.matriculaFinca || ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  matriculaFinca: e.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Matrícula de la finca en el Registro Público de la Propiedad
            </p>
          </div>

          <div>
            <Label htmlFor="planoFinca">Plano de la Finca</Label>
            <Input
              id="planoFinca"
              type="text"
              autoComplete="off"
              placeholder="Ej: S-J- ciento nueve mil seiscientos diecisiete-cincuenta y ocho decímetros cuadrados"
              value={data.planoFinca || ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  planoFinca: e.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Información del plano de la finca
            </p>
          </div>

          <div>
            <Label htmlFor="ubicacionFinca">Ubicación de la Finca</Label>
            <Input
              id="ubicacionFinca"
              type="text"
              autoComplete="off"
              placeholder="Ej: distrito primero, cantón Pérez Zeledón"
              value={data.ubicacionFinca || ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  ubicacionFinca: e.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ubicación de la finca (distrito, cantón, provincia)
            </p>
          </div>

          <div>
            <Label htmlFor="linderosFinca">Linderos de la Finca</Label>
            <Textarea
              id="linderosFinca"
              autoComplete="off"
              placeholder="Ej: al norte con carretera interamericana, al sur con finca de Rómulo Concepción Solís Cambronero, al este con propiedad de Carmen, y al oeste con propiedad de López"
              value={data.linderosFinca || ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  linderosFinca: e.target.value,
                }))
              }
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Descripción de los linderos de la finca
            </p>
          </div>

          {/* Sección 3: Descripción del Apartamento (SEGUNDA cláusula - opcional) */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2">Descripción del Apartamento (Opcional)</h3>
          </div>

          <div>
            <Label htmlFor="descripcionApartamento">Descripción del Apartamento</Label>
            <Textarea
              id="descripcionApartamento"
              autoComplete="off"
              placeholder="Ej: sala, comedor, cocina, dos habitaciones y un baño"
              value={data.descripcionApartamento || ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  descripcionApartamento: e.target.value,
                }))
              }
              rows={2}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Descripción detallada de las habitaciones y espacios del apartamento (por defecto: sala, comedor, cocina, dos habitaciones y un baño)
            </p>
          </div>

          {/* Sección 4: Detalles del Contrato (TERCERA y CUARTA cláusulas) */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2">Detalles del Contrato</h3>
          </div>

          <div>
            <Label htmlFor="montoTotal">
              Monto Total Anual (CRC) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="montoTotal"
              type="number"
              autoComplete="off"
              min="0"
              value={data.montoTotal}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  montoTotal: Number(e.target.value),
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Monto total del alquiler para el primer año
            </p>
          </div>
          <div>
            <Label htmlFor="diaPago">
              Día de Pago Mensual (1-31) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="diaPago"
              type="number"
              autoComplete="off"
              min="1"
              max="31"
              value={data.diaPago}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  diaPago: Number(e.target.value),
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Día del mes en que se debe realizar el pago mensual (1-31)
            </p>
          </div>
          <div>
            <Label htmlFor="diaPrimerPago">
              Día del Primer Pago (1-31) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="diaPrimerPago"
              type="number"
              autoComplete="off"
              min="1"
              max="31"
              value={data.diaPrimerPago || ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  diaPrimerPago: Number(e.target.value),
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Día del mes en que se realizará el primer pago (1-31)
            </p>
          </div>
          <div>
            <Label htmlFor="contratoDesde">
              Fecha de Inicio del Contrato <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contratoDesde"
              type="date"
              autoComplete="off"
              value={data.contratoDesde}
              onChange={(e) =>
                setData((prev) => ({ ...prev, contratoDesde: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Fecha desde la cual inicia el contrato de arrendamiento
            </p>
          </div>
          <div>
            <Label htmlFor="contratoHasta">
              Fecha de Finalización del Contrato <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contratoHasta"
              type="date"
              autoComplete="off"
              value={data.contratoHasta}
              onChange={(e) =>
                setData((prev) => ({ ...prev, contratoHasta: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Fecha hasta la cual finaliza el contrato de arrendamiento
            </p>
          </div>
          <div>
            <Label htmlFor="duracionAnios">
              Duración del Contrato (años) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="duracionAnios"
              type="number"
              autoComplete="off"
              min="1"
              value={data.duracionAnios}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  duracionAnios: Number(e.target.value),
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Duración total del contrato en años
            </p>
          </div>

          {/* Sección 5: Información Adicional (QUINTA y DÉCIMA PRIMERA cláusulas) */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2">Información Adicional</h3>
          </div>

          <div>
            <Label htmlFor="numeroMiembros">
              Número de Miembros del Núcleo Familiar{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numeroMiembros"
              type="number"
              autoComplete="off"
              min="1"
              value={data.numeroMiembros || ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  numeroMiembros: Number(e.target.value),
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cantidad de personas que conforman el núcleo familiar del arrendatario
            </p>
          </div>

          <div>
            <Label htmlFor="depositoGarantia">
              Depósito de Garantía (CRC) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="depositoGarantia"
              type="number"
              autoComplete="off"
              min="0"
              value={data.depositoGarantia || ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  depositoGarantia: Number(e.target.value),
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Monto del depósito de garantía que será devuelto al finalizar el contrato
            </p>
          </div>

          {/* Sección 6: Fecha de Firma (Cierre - opcional) */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2">Fecha de Firma (Opcional)</h3>
          </div>

          <div>
            <Label htmlFor="fechaFirma">Fecha de Firma</Label>
            <Input
              id="fechaFirma"
              type="text"
              autoComplete="off"
              placeholder="Ej: 15 de enero de 2024"
              value={data.fechaFirma || ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  fechaFirma: e.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Fecha en que se firmará el contrato
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="mr-2">
              Cancelar
            </Button>
          </DialogClose>
          <Button variant="default" onClick={handleSubmit} disabled={loading}>
            {loading ? "Generando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
