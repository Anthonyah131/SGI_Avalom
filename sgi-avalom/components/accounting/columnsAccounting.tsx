"use client";

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

export const columns: ColumnDef<AvaAlquiler>[] = [
  {
    accessorKey: "alq_id",
    header: ({ column }) => {
      return (
        <Button
          variant="table"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
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
          Fecha de Pago
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return format(new Date(row.getValue("alq_fechapago")), "dd/MM/yyyy");
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
          {status === "A" ? "Activo" : status === "F" ? "Finalizado" : status === "C" ? "Cancelado" : "Desconocido"}
        </div>
      );
    },
  },
  {
    accessorKey: "ava_propiedad.prop_identificador",
    header: "Identificador de Propiedad",
  },
  {
    accessorKey: "ava_propiedad.ava_edificio.edi_identificador",
    header: "Identificador de Edificio",
  },
  {
    accessorKey: "ava_propiedad.ava_tipopropiedad.tipp_nombre",
    header: "Tipo de Propiedad",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rental = row.original;
      return (
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
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(rental.alq_id.toString());
              }}
            >
              Copiar ID alquiler
            </DropdownMenuItem>
            <Link href={`/accounting/payments/${rental.alq_id}`}>
              <DropdownMenuItem>Realizar movimiento</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
