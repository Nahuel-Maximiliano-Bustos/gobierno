import { useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { cn } from '../lib/utils';

export interface BulkAction<T> {
  label: string;
  onClick: (rows: T[]) => void;
}

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  bulkActions?: BulkAction<TData>[];
  manualFilterComponent?: React.ReactNode;
}

export function DataTable<TData>(props: DataTableProps<TData>) {
  const { data, columns, searchPlaceholder, onRowClick, bulkActions, manualFilterComponent } = props;
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      rowSelection
    },
    enableRowSelection: Boolean(bulkActions?.length),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const selectionRows = useMemo(
    () => table.getSelectedRowModel().flatRows.map((row) => row.original),
    [table]
  );

  const renderSelectionColumn = Boolean(bulkActions?.length);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {bulkActions && bulkActions.length > 0 ? (
          <div className="flex items-center gap-2">
            {bulkActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => action.onClick(selectionRows)}
                disabled={selectionRows.length === 0}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
        {manualFilterComponent}
        {searchPlaceholder ? (
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="ml-auto w-full max-w-xs"
          />
        ) : null}
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full min-w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {renderSelectionColumn ? (
                  <th className="w-8 px-2 py-2">
                    <Checkbox
                      aria-label="Seleccionar todos"
                      checked={table.getIsAllPageRowsSelected()}
                      indeterminate={table.getIsSomePageRowsSelected()}
                      onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
                    />
                  </th>
                ) : null}
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2 text-left">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (renderSelectionColumn ? 1 : 0)} className="px-4 py-6 text-center text-muted-foreground">
                  No se encontraron registros con los filtros aplicados.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-t border-border/80 transition-colors hover:bg-muted/20',
                    row.getIsSelected() && 'bg-primary/5'
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {renderSelectionColumn ? (
                    <td className="px-2 py-2" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
                        aria-label="Seleccionar fila"
                      />
                    </td>
                  ) : null}
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {renderSelectionColumn ? (
          <span>{selectionRows.length} seleccionados</span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Anterior
          </Button>
          <span>
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </span>
          <Button variant="ghost" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
