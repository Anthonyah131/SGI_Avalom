"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportServicesProps {
  services: any[];
  disabled?: boolean;
}

export function ExportServices({ services, disabled }: ExportServicesProps) {
  const handleExport = () => {
    if (!services || services.length === 0) {
      return;
    }

    // Preparar datos para exportar
    const dataToExport = services.map((service, index) => ({
      "No.": index + 1,
      "ID Servicio": service.ser_id,
      "Código": service.ser_codigo,
      "Nombre del Servicio": service.ser_nombre,
      "Tipo de Servicio": service.ser_servicio,
      "Negocio/Proveedor": service.ser_negocio || "N/A",
      "Medio de Pago": service.ser_mediopago || "N/A",
    }));

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen
    const summaryData = [
      ["CATÁLOGO DE SERVICIOS - SISTEMA AVALOM"],
      ["Fecha de Generación:", new Date().toLocaleDateString("es-CR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })],
      [],
      ["RESUMEN"],
      ["Total de Servicios:", services.length],
      [],
      ["DISTRIBUCIÓN POR TIPO"],
    ];

    // Contar por tipo de servicio
    const serviceTypes = services.reduce((acc, service) => {
      const type = service.ser_servicio || "Sin tipo";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(serviceTypes).forEach(([type, count]) => {
      summaryData.push([type + ":", count as number]);
    });

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary["!cols"] = [{ wch: 30 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

    // Hoja 2: Detalle de Servicios
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Configurar anchos de columna
    ws["!cols"] = [
      { wch: 6 },  // No.
      { wch: 12 }, // ID
      { wch: 15 }, // Código
      { wch: 35 }, // Nombre
      { wch: 25 }, // Tipo
      { wch: 30 }, // Negocio
      { wch: 20 }, // Medio de Pago
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Servicios");

    // Hoja 3: Servicios por Tipo
    const typeData = Object.entries(serviceTypes).map(([type, count]) => ({
      "Tipo de Servicio": type,
      "Cantidad": count as number,
      "Porcentaje": `${(((count as number) / services.length) * 100).toFixed(2)}%`,
    }));

    const wsTypes = XLSX.utils.json_to_sheet(typeData);
    wsTypes["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 12 }];

    XLSX.utils.book_append_sheet(wb, wsTypes, "Por Tipo");

    // Generar nombre de archivo
    const fileName = `Catalogo_Servicios_${new Date().toLocaleDateString("es-CR").replace(/\//g, "-")}.xlsx`;

    // Exportar
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || !services || services.length === 0}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Exportar Servicios
    </Button>
  );
}
