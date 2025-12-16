"use client";

import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, CreditCard, Calendar } from "lucide-react";
import { Cliente } from "@/lib/types";

interface ClientInfoCardProps {
  cliente: Cliente;
  className?: string;
}

export const ClientInfoCard: React.FC<ClientInfoCardProps> = ({
  cliente,
  className = "",
}) => {
  // Función para formatear el nombre completo
  const getFullName = () => {
    return `${cliente.cli_nombre} ${cliente.cli_papellido} ${
      cliente.cli_sapellido || ""
    }`.trim();
  };

  // Función para formatear el teléfono
  const getFormattedPhone = () => {
    const phone = cliente.cli_telefono;
    if (phone.length === 8) {
      return `${phone.slice(0, 4)}-${phone.slice(4)}`;
    }
    return phone;
  };

  return (
    <Card className={`w-full border shadow-md ${className}`}>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            Información del Cliente
          </CardTitle>
          <Badge variant="outline" className="text-xs font-medium">
            ID: {cliente.cli_id}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {/* Nombre completo */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-3">
            {getFullName()}
          </h3>
        </div>

        {/* Grid de información compacto */}
        <div className="space-y-2">
          {/* Cédula */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex-shrink-0 p-1.5 rounded-md bg-primary/10">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">
                Cédula
              </p>
              <p className="text-sm font-semibold text-foreground">
                {cliente.cli_cedula}
              </p>
            </div>
          </div>

          {/* Teléfono */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex-shrink-0 p-1.5 rounded-md bg-primary/10">
              <Phone className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">
                Teléfono
              </p>
              <p className="text-sm font-semibold text-foreground">
                {getFormattedPhone()}
              </p>
            </div>
          </div>

          {/* Correo */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex-shrink-0 p-1.5 rounded-md bg-primary/10">
              <Mail className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-0.5">
                Correo Electrónico
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                {cliente.cli_correo}
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional si existe */}
        {(cliente.cli_direccion && cliente.cli_direccion !== "n/a") ||
        (cliente.cli_estadocivil && cliente.cli_estadocivil !== "n/a") ? (
          <>
            <Separator className="my-3" />
            <div className="space-y-2">
              {cliente.cli_direccion && cliente.cli_direccion !== "n/a" && (
                <div className="p-2 rounded-lg border bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Dirección
                  </p>
                  <p className="text-xs text-foreground">
                    {cliente.cli_direccion}
                  </p>
                </div>
              )}
              {cliente.cli_estadocivil && cliente.cli_estadocivil !== "n/a" && (
                <div className="p-2 rounded-lg border bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Estado Civil
                  </p>
                  <p className="text-xs text-foreground">
                    {cliente.cli_estadocivil}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};
