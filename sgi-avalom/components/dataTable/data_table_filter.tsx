"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
  FilterFn,
  Row,
  HeaderGroup,
  Cell,
} from "@tanstack/react-table";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvaAlquiler } from "@/lib/types";

// Define the globalFilterFn function
const globalFilterFn: FilterFn<AvaAlquiler> = (row, columnId, filterValue) => {
  const { alq_monto, ava_propiedad } = row.original;
  const propertyId = ava_propiedad?.prop_identificador;
  const buildingId = ava_propiedad?.ava_edificio?.edi_identificador;

  if (!filterValue) return true;

  const lowerFilter = filterValue.toLowerCase();

  return (
    (alq_monto?.toString().toLowerCase().includes(lowerFilter) ?? false) ||
    (propertyId?.toString().toLowerCase().includes(lowerFilter) ?? false) ||
    (buildingId?.toString().toLowerCase().includes(lowerFilter) ?? false)
  );
};

interface DataTableProps {
  columns: ColumnDef<AvaAlquiler, any>[]; // Ensure the correct type for columns
  data: AvaAlquiler[];
  statusFilter: string;
  propertyTypeFilter: string;
  onStatusChange: (value: string) => void;
  onPropertyTypeChange: (value: string) => void;
  onRowClick?: (row: AvaAlquiler) => void;
}

export function DataTable({
  columns,
  data,
  statusFilter,
  propertyTypeFilter,
  onStatusChange,
  onPropertyTypeChange,
  onRowClick,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Use memoization to prevent unnecessary re-renders
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.alq_estado === statusFilter;
      const matchesPropertyType =
        propertyTypeFilter === "all" ||
        item.ava_propiedad?.ava_tipopropiedad?.tipp_nombre ===
          propertyTypeFilter;
      return matchesStatus && matchesPropertyType;
    });
  }, [data, statusFilter, propertyTypeFilter]);

  const table = useReactTable<AvaAlquiler>({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter: globalFilterValue,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilterValue,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn,
  });

  // Function to handle page size change
  const handlePageSizeChange = (size: number) => {
    table.setPageSize(size);
    table.setPageIndex(0); // Reset to first page when page size changes
  };

  return (
    <div className="w-full space-y-4 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Input
          placeholder="Buscar por identificador, monto, edificio..."
          value={globalFilterValue}
          onChange={(event) => setGlobalFilterValue(event.target.value)}
          className="w-full sm:max-w-xs"
          aria-label="Buscar en la tabla"
        />
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="A">Activo</SelectItem>
            <SelectItem value="C">Cancelado</SelectItem>
            <SelectItem value="F">Finalizado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={propertyTypeFilter} onValueChange={onPropertyTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo de propiedad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="departamento">Departamento</SelectItem>
            <SelectItem value="local">Local</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Columnas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex w-full flex-col rounded-md border">
        <main className="grid flex-1 items-start">
          <UITable>
            <TableHeader>
              {table
                .getHeaderGroups()
                .map((headerGroup: HeaderGroup<AvaAlquiler>) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row: Row<AvaAlquiler>) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    {row
                      .getVisibleCells()
                      .map((cell: Cell<AvaAlquiler, any>) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No hay datos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </UITable>
        </main>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </p>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} filas
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
