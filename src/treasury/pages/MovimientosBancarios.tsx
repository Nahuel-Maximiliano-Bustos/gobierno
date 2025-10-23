import { useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { DataTable } from '@shared/components/DataTable';
import { useMovimientos, useGuardarMovimiento, useImportarMovimientos, useConciliarMovimientos } from '../hooks/useBancos';
import type { MovimientoBancario } from '@treasury/types';
import { formatCurrency, formatDate, downloadFile } from '@shared/lib/utils';
import { useUIStore } from '@shared/store/ui.store';
import sampleMovimientos from '@mocks/data/movimientos_ejemplo.csv?raw';
import { toast } from '@shared/hooks/useToast';

const parseCSV = async (file: File) => {
  const text = await file.text();
  const [header, ...rows] = text.trim().split(/\r?\n/);
  const columns = header.split(',');
  return rows.map((row) => {
    const values = row.split(',');
    const record: Record<string, string> = {};
    columns.forEach((col, index) => {
      record[col.trim()] = values[index]?.replace(/"/g, '') ?? '';
    });
    return {
      id: crypto.randomUUID(),
      cuentaId: record.cuenta,
      fecha: record.fecha,
      concepto: record.concepto,
      tipo: record.tipo === 'CARGO' ? 'CARGO' : 'ABONO',
      importe: Number(record.importe),
      ref: record.ref,
      conciliado: record.conciliado === 'true'
    } as MovimientoBancario;
  });
};

export const MovimientosBancariosPage = () => {
  const [filters, setFilters] = useState<{ cuentaId?: string; conciliado?: string }>({});
  const { data, isLoading } = useMovimientos(filters);
  const guardar = useGuardarMovimiento();
  const importar = useImportarMovimientos();
  const conciliar = useConciliarMovimientos();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Movimientos Bancarios']);
  }, [setBreadcrumb]);

  const columns = useMemo<ColumnDef<MovimientoBancario>[]>(
    () => [
      {
        accessorKey: 'fecha',
        header: 'Fecha',
        cell: ({ row }) => formatDate(row.original.fecha)
      },
      {
        accessorKey: 'concepto',
        header: 'Concepto'
      },
      {
        accessorKey: 'tipo',
        header: 'Tipo'
      },
      {
        accessorKey: 'importe',
        header: 'Importe',
        cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.importe)}</span>
      },
      {
        accessorKey: 'cuentaId',
        header: 'Cuenta'
      },
      {
        accessorKey: 'ref',
        header: 'Referencia',
        cell: ({ row }) => row.original.ref ?? '—'
      },
      {
        accessorKey: 'conciliado',
        header: 'Conciliado',
        cell: ({ row }) => (row.original.conciliado ? 'Sí' : 'No')
      }
    ],
    []
  );

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const registros = await parseCSV(file);
    await importar.mutateAsync(registros);
    toast({ title: 'Movimientos importados', description: `${registros.length} registros añadidos.` });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cuenta"
          value={filters.cuentaId ?? ''}
          onChange={(event) => setFilters((prev) => ({ ...prev, cuentaId: event.target.value || undefined }))}
          className="w-36"
        />
        <Select
          value={filters.conciliado ?? ''}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, conciliado: value || undefined }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="true">Conciliado</SelectItem>
            <SelectItem value="false">Pendiente</SelectItem>
          </SelectContent>
        </Select>
        <Input type="file" accept=".csv" onChange={handleImport} className="w-60" />
        <Button variant="outline" size="sm" onClick={() => downloadFile('movimientos_ejemplo.csv', sampleMovimientos, 'text/csv')}>
          Descargar plantilla
        </Button>
      </div>
      <div className="bg-white">
      <DataTable
        data={data ?? []}
        columns={columns}
        searchPlaceholder="Buscar concepto"
        onRowClick={async (row) => {
          await guardar.mutateAsync({ id: row.id, conciliado: !row.conciliado });
        }}
        bulkActions={[
          {
            label: 'Conciliar',
            onClick: async (rows) => {
              await conciliar.mutateAsync({ ids: rows.map((row) => row.id), conciliado: true });
            }
          }
        ]}
      />
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Cargando movimientos…</p> : null}
    </div>
  );
};
