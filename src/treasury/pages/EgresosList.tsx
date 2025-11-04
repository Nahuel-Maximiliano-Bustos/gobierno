import { useMemo, useState, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { DataTable } from '@shared/components/DataTable';
import { formatCurrency, formatDate } from '@shared/lib/utils';
import { useEgresos, exportEgresosCSV, type EgresosFilters } from '../hooks/useEgresos';
import { useProveedores } from '../hooks/useProveedores';
import type { Egreso } from '@treasury/types';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@shared/store/ui.store';
import { Download, Plus } from 'lucide-react';
import { StatusBadge } from '@shared/components/StatusBadge';

export const EgresosList = () => {
  const [filters, setFilters] = useState<EgresosFilters>({});
  const { data, isLoading } = useEgresos(filters);
  const { data: proveedores } = useProveedores();
  const navigate = useNavigate();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Egresos']);
  }, [setBreadcrumb]);

  const columns = useMemo<ColumnDef<Egreso>[]>(
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
        accessorKey: 'proveedorId',
        header: 'Proveedor'
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
        accessorKey: 'partida',
        header: 'Partida'
      },
      {
        accessorKey: 'capitulo',
        header: 'Capítulo'
      },
      {
        accessorKey: 'estatus',
        header: 'Estatus',
        cell: ({ row }) => <StatusBadge status={row.original.estatus} />
      }
    ],
    []
  );

  const manualFilters = (
    <div className="flex flex-wrap items-center gap-2 !bg-transparent">
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
      <Select
        value={filters.proveedorId ?? ''}
        onValueChange={(value) => setFilters((prev) => ({ ...prev, proveedorId: value || undefined }))}
      >
        <SelectTrigger className="w-48 !bg-white">
          <SelectValue placeholder="Proveedor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos</SelectItem>
          {proveedores?.map((prov) => (
            <SelectItem key={prov.id} value={prov.id}>
              {prov.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.estatus ?? ''} onValueChange={(value) => setFilters((prev) => ({ ...prev, estatus: (value as Egreso['estatus']) || undefined }))}>
        <SelectTrigger className="w-40 !bg-white">
          <SelectValue placeholder="Estatus" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos</SelectItem>
          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
          <SelectItem value="PAGADO">Pagado</SelectItem>
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
          <h1 className="text-xl font-semibold">Egresos comprometidos</h1>
          <p className="text-sm text-muted-foreground">Pagos a proveedores y compromisos devengados.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#DCFCE7]">
          <Button variant="outline" size="sm" onClick={() => exportEgresosCSV(data ?? [])} disabled={!data?.length} className="!bg-[#0E1024] hover:!bg-[#1a1d3a] active:!bg-[#060812] !border !border-[#1a1d3a] !text-white">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button size="sm" className="!bg-[#0E1024] hover:!bg-[#1a1d3a] active:!bg-[#060812] !border !border-[#1a1d3a] !text-white" onClick={() => navigate('/tesoreria/egresos/nuevo')}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo egreso
          </Button>
        </div>
      </div>
      <div className="bg-white">
      <DataTable
        data={data ?? []}
        columns={columns}
        searchPlaceholder="Buscar por concepto"
        manualFilterComponent={manualFilters}
        onRowClick={(row) => navigate(`/tesoreria/egresos/${row.id}`)}
        bulkActions={[
          {
            label: 'Exportar seleccionados',
            onClick: (rows) => exportEgresosCSV(rows)
          }
        ]}
      />
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Cargando egresos…</p> : null}
    </div>
  );
};