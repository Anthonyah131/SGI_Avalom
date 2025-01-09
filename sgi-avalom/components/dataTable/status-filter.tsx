"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
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

interface StatusOption {
  label: string;
  value: string;
}

interface StatusFilterProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
}

export function StatusFilter({
  selectedStatuses,
  onStatusChange,
}: StatusFilterProps) {
  const [open, setOpen] = React.useState(false);

  const statuses: StatusOption[] = [
    { label: "Pagados", value: "pagados" },
    { label: "Atrasados", value: "atrasados" },
    { label: "Incompletos", value: "incompletos" },
  ];

  const toggleStatus = (value: string) => {
    if (selectedStatuses.includes(value)) {
      onStatusChange(selectedStatuses.filter((status) => status !== value));
    } else {
      onStatusChange([...selectedStatuses, value]);
    }
  };

  const clearFilters = () => {
    onStatusChange([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 border-dashed">
          <Search className="mr-2 h-4 w-4" />
          {selectedStatuses?.length > 0 ? (
            <>
              Filtros: {selectedStatuses.length}
              <X
                className="ml-2 h-4 w-4"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}
              />
            </>
          ) : (
            "Filtrar por estado"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar estado..." />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup>
              {statuses.map((status) => (
                <CommandItem
                  key={status.value}
                  onSelect={() => toggleStatus(status.value)}
                >
                  <div
                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded border border-primary ${
                      selectedStatuses.includes(status.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    }`}
                  >
                    <X className="h-3 w-3" />
                  </div>
                  {status.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {selectedStatuses.length > 0 && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={clearFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
