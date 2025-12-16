"use client";

import cookie from "js-cookie";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Building2, Home, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvaAlquiler } from "@/lib/types";
import Link from "next/link";
import DateRangeDialog from "../DateRangeDialog";
import { toast } from "sonner";
import { useState } from "react";
import { formatCurrencyNoDecimals } from "@/utils/currencyConverter";

export const columns: ColumnDef<AvaAlquiler>[] = [
  {
    accessorKey: "ava_propiedad.ava_edificio.edi_identificador",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Building2 className="h-4 w-4 mr-1" />
          Edificio
          <ArrowUpDown className="text-primary ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.original.ava_propiedad?.ava_edificio?.edi_identificador;
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {value || "—"}
          </Badge>
        </div>
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
          <Home className="h-4 w-4 mr-1" />
          Propiedad
          <ArrowUpDown className="text-primary ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.original.ava_propiedad?.prop_identificador;
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            {value || "—"}
          </Badge>
        </div>
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
          Tipo
          <ArrowUpDown className="text-primary ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.original.ava_propiedad?.ava_tipopropiedad?.tipp_nombre;
      return (
        <Badge variant="outline" className="capitalize">
          {value || "—"}
        </Badge>
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
          Monto Mensual
          <ArrowUpDown className="text-primary ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = Number(row.getValue("alq_monto"));
      return <div className="font-semibold text-base">{formatCurrencyNoDecimals(amount)}</div>;
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
          <Calendar className="h-4 w-4 mr-1" />
          Día de Pago
          <ArrowUpDown className="text-primary ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue<string | null>("alq_fechapago");
      if (!value) return <span className="text-muted-foreground text-sm">Sin definir</span>;

      try {
        const date = new Date(value);
        const dayOfMonth = date.getDate();
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono">
              Día {dayOfMonth}
            </Badge>
            <span className="text-xs text-muted-foreground">de cada mes</span>
          </div>
        );
      } catch {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
    },
  },
  {
    accessorKey: "alq_estado",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("alq_estado") as string;

      const statusConfig = {
        A: {
          label: "Activo",
          className:
            "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400",
        },
        F: {
          label: "Finalizado",
          className:
            "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400",
        },
        C: {
          label: "Cancelado",
          className:
            "bg-red-500/10 text-red-700 border-red-500/30 dark:text-red-400",
        },
      };

      const config = statusConfig[status as keyof typeof statusConfig] || {
        label: "Desconocido",
        className: "bg-gray-500/10 text-gray-700 border-gray-500/30",
      };

      return (
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
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
