import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { DataTable } from '@shared/components/DataTable';
import { formatCurrency, formatDate } from '@shared/lib/utils';
import { useIngresos, exportIngresosCSV, type IngresosFilters } from '../hooks/useIngresos';
import type { Ingreso } from '@treasury/types';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@shared/store/ui.store';
import { useEffect } from 'react';
import { useCuentas } from '../hooks/useBancos';
import { Download, Plus } from 'lucide-react';

export const IngresosList = () => {
  const [filters, setFilters] = useState<IngresosFilters>({});
  const { data, isLoading } = useIngresos(filters);
  const { data: cuentas } = useCuentas();
  const navigate = useNavigate();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Ingresos']);
  }, [setBreadcrumb]);

  const columns = useMemo<ColumnDef<Ingreso>[]>(
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
        accessorKey: 'importe',
        header: 'Importe',
        cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.importe)}</span>
      },
      {
        accessorKey: 'fuente',
        header: 'Fuente'
      },
      {
        accessorKey: 'referencia',
        header: 'Referencia',
        cell: ({ row }) => row.original.referencia ?? '—'
      },
      {
        accessorKey: 'cuentaId',
        header: 'Cuenta'
      },
      {
        accessorKey: 'partida',
        header: 'Partida'
      },
      {
        accessorKey: 'capitulo',
        header: 'Capítulo'
      }
    ],
    []
  );

  const manualFilters = (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="date"
        value={filters.fechaInicio ?? ''}
        onChange={(event) => setFilters((prev) => ({ ...prev, fechaInicio: event.target.value }))}
        className="w-40 !bg-white"
      />
      <Input
        type="date"
        value={filters.fechaFin ?? ''}
        onChange={(event) => setFilters((prev) => ({ ...prev, fechaFin: event.target.value }))}
        className="w-40 !bg-white"
      />
      <Input
        placeholder="Fuente"
        value={filters.fuente ?? ''}
        onChange={(event) => setFilters((prev) => ({ ...prev, fuente: event.target.value }))}
        className="w-40 !bg-white"
      />
      <Select value={filters.cuentaId ?? ''} onValueChange={(value) => setFilters((prev) => ({ ...prev, cuentaId: value || undefined }))}>
        <SelectTrigger className="w-52 !bg-white">
          <SelectValue placeholder="Cuenta" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          {cuentas?.map((cuenta) => (
            <SelectItem key={cuenta.id} value={cuenta.id}>
              {cuenta.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="sm" onClick={() => setFilters({})} className="!bg-[#0E1024] hover:!bg-[#1a1d3a] active:!bg-[#060812] !border !border-[#1a1d3a] !text-white">
        Limpiar filtros
      </Button>
    </div>
  );

  return (
    <div className="space-y-4 bg-[#E0E0E0] [&_*]:bg-inherit">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Ingresos capturados</h1>
          <p className="text-sm text-muted-foreground">Control de ingresos municipales por fuente de financiamiento.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#DCFCE7]">
          <Button variant="outline" size="sm" onClick={() => exportIngresosCSV(data ?? [])} disabled={!data?.length} className="!bg-[#0E1024] hover:!bg-[#1a1d3a] active:!bg-[#060812] !border !border-[#1a1d3a] !text-white">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          
          <Button size="sm" className="!bg-[#0E1024] hover:!bg-[#1a1d3a] active:!bg-[#060812] !border !border-[#1a1d3a] !text-white" onClick={() => navigate('/tesoreria/ingresos/nuevo')}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo ingreso
          </Button>
        </div>
      </div>
      <div className="bg-white">
      <DataTable
        data={data ?? []}
        columns={columns}
        searchPlaceholder="Buscar por concepto o referencia"
        manualFilterComponent={manualFilters}
        onRowClick={(row) => navigate(`/tesoreria/ingresos/${row.id}`)}
        bulkActions={[
          {
            label: 'Exportar seleccionados',
            onClick: (rows) => exportIngresosCSV(rows)
          }
        ]}
      />
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Cargando ingresos…</p> : null}
    </div>
  );
};