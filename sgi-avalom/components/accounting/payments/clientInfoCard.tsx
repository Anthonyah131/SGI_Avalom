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
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Cliente
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            ID: {cliente.cli_id}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Nombre completo */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">
            {getFullName()}
          </h3>
          <Separator />
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cédula */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                Cédula
              </p>
              <p className="text-base font-semibold text-foreground truncate">
                {cliente.cli_cedula}
              </p>
            </div>
          </div>

          {/* Teléfono */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                Teléfono
              </p>
              <p className="text-base font-semibold text-foreground">
                {getFormattedPhone()}
              </p>
            </div>
          </div>

          {/* Correo */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 md:col-span-2">
            <div className="flex-shrink-0">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                Correo Electrónico
              </p>
              <p className="text-base font-semibold text-foreground truncate">
                {cliente.cli_correo}
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional si existe */}
        {(cliente.cli_direccion && cliente.cli_direccion !== "n/a") ||
        (cliente.cli_estadocivil && cliente.cli_estadocivil !== "n/a") ? (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cliente.cli_direccion && cliente.cli_direccion !== "n/a" && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Dirección
                  </p>
                  <p className="text-sm text-foreground">
                    {cliente.cli_direccion}
                  </p>
                </div>
              )}
              {cliente.cli_estadocivil && cliente.cli_estadocivil !== "n/a" && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Estado Civil
                  </p>
                  <p className="text-sm text-foreground">
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
