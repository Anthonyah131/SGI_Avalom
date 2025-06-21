"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import cookie from "js-cookie";
import { toast } from "sonner";
import DateRangeDialog from "@/components/DateRangeDialog";

export function ExportBuildings() {
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const downloadPDF = async (url: string) => {
    try {
      setLoading(true);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${cookie.get("token") ?? ""}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);

      // Obtener el nombre del archivo del header
      const disposition = res.headers.get("Content-Disposition");
      let filename = "reporte.pdf";
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const blob = await res.blob();
      const pdfUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(pdfUrl);
    } catch (err: any) {
      console.error(err);
      toast.error("No se pudo generar el reporte de edificios.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpenDialog(true)}
        disabled={loading}
      >
        {loading ? "Generando…" : "Exportar Edificios"}
      </Button>

      <DateRangeDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        title="Exportar Edificios"
        onGenerate={async (from, to) => {
          await downloadPDF(`/api/export-buildings?from=${from}&to=${to}`);
          setOpenDialog(false);
        }}
      />
    </>
  );
}
