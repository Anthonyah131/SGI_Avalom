"use client";

import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { AvaAlquiler } from "@/lib/types";
import Link from "next/link";
import { es } from "date-fns/locale";
import DateRangeDialog from "../DateRangeDialog";
import { toast } from "sonner";
import { useState } from "react";

export const columns: ColumnDef<AvaAlquiler>[] = [
  {
    accessorKey: "ava_propiedad.ava_edificio.edi_identificador",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Iden Edificio
          <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "ava_propiedad.prop_identificador",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Iden Propiedad
          <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "ava_propiedad.ava_tipopropiedad.tipp_nombre",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre Tipo Prop
          <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "alq_monto",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Monto
          <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = BigInt(row.getValue("alq_monto"));
      const formatted = new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "alq_fechapago",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha Pago
          <ArrowUpDown className="text-orange ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue<string | null>("alq_fechapago");
      if (!value) return "Sin fecha";

      try {
        return format(new Date(value), "PPP", { locale: es });
      } catch {
        return "Formato inválido";
      }
    },
  },
  {
    accessorKey: "alq_estado",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("alq_estado") as string;
      return (
        <div
          className={`font-medium ${
            status === "A"
              ? "text-green-600"
              : status === "F"
              ? "text-red-600"
              : ""
          }`}
        >
          {status === "A"
            ? "Activo"
            : status === "F"
            ? "Finalizado"
            : status === "C"
            ? "Cancelado"
            : "Desconocido"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rental = row.original;
      const isActive = rental.alq_estado === "A";
      const [dialogOpen, setDialogOpen] = useState(false);
      const [loading, setLoading] = useState(false);

      const downloadPDF = async (alq_id: number, from: string, to: string) => {
        try {
          setLoading(true);
          const url = `/api/export-rental?alq_id=${alq_id}&from=${from}&to=${to}`;
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
          toast.error("No se pudo generar el reporte del alquiler.");
        } finally {
          setLoading(false);
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir Menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isActive && (
                <>
                  <Link href={`/accounting/payments/${rental.alq_id}`}>
                    <DropdownMenuItem>Realizar movimiento</DropdownMenuItem>
                  </Link>
                  <Link href={`/accounting/finishedrent/${rental.alq_id}`}>
                    <DropdownMenuItem>Finalizar Alquiler</DropdownMenuItem>
                  </Link>
                  <Link href={`/accounting/canceledrent/${rental.alq_id}`}>
                    <DropdownMenuItem>Cancelar Alquiler</DropdownMenuItem>
                  </Link>
                </>
              )}
              <DropdownMenuItem
                onClick={() => setDialogOpen(true)}
                disabled={loading}
              >
                {loading ? "Generando…" : "Exportar Alquiler"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Este dialog está FUERA del menú */}
          <DateRangeDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Exportar Alquiler"
            onGenerate={async (from, to) => {
              await downloadPDF(Number(rental.alq_id), from, to);
              setDialogOpen(false);
            }}
          />
        </>
      );
    },
  },
];
