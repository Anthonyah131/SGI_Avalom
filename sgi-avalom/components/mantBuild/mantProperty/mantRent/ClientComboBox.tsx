"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Cliente } from "@/lib/types";

interface ClientComboBoxProps {
  clients: Cliente[];
  onClientSelect: (client: Cliente) => void;
}

export const ClientComboBox: React.FC<ClientComboBoxProps> = ({
  clients,
  onClientSelect,
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<Cliente | null>(
    null
  );

  const handleSelect = (client: Cliente) => {
    setSelectedClient(client);
    onClientSelect(client);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="m-2 w-[200px] justify-start">
          {selectedClient ? (
            <>
              {selectedClient.cli_nombre} {selectedClient.cli_papellido}
            </>
          ) : (
            <>+ Selecciona un cliente</>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <ClientList clients={clients} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
};

interface ClientListProps {
  clients: Cliente[];
  onSelect: (client: Cliente) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onSelect }) => {
  return (
    <Command>
      <CommandInput placeholder="Buscar cliente..." />
      <CommandList>
        <CommandEmpty>No se encontraron clientes.</CommandEmpty>
        <CommandGroup>
          {clients.map((client) => (
            <CommandItem
              key={client.cli_id}
              value={String(client.cli_id)}
              onSelect={() => onSelect(client)}
            >
              {client.cli_nombre} {client.cli_papellido} - {client.cli_cedula}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
