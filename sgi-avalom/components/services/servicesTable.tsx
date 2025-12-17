"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { AvaServicio } from "@/lib/types/entities";

interface ServicesTableProps {
  services: AvaServicio[];
  onEdit: (service: AvaServicio) => void;
  onDelete: (service: AvaServicio) => void;
}

export function ServicesTable({ services, onEdit, onDelete }: ServicesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo de Servicio</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Medio de Pago</TableHead>
            <TableHead className="w-[70px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length > 0 ? (
            services.map((service) => (
              <TableRow key={service.ser_id} className="hover:bg-muted/50">
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {service.ser_codigo}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{service.ser_nombre}</TableCell>
                <TableCell>{service.ser_servicio || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{service.ser_negocio || "-"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{service.ser_mediopago || "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="size-8 p-0">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(service)}>
                        <Edit className="mr-2 size-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(service)}>
                        <Trash2 className="mr-2 size-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No hay servicios registrados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
