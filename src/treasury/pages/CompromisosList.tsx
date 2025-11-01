import { useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { DataTable } from '@shared/components/DataTable';
import { formatCurrency, formatDate } from '@shared/lib/utils';
import { useCompromisos, type CompromisosFilters } from '../hooks/useCompromisos';
import type { Compromiso } from '@treasury/types';
import { useProveedores } from '../hooks/useProveedores';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@shared/store/ui.store';
import { StatusBadge } from '@shared/components/StatusBadge';
import { Plus } from 'lucide-react';

const ESTATUS = ['BORRADOR', 'REVISION', 'RECHAZADO', 'AUTORIZADO', 'PAGADO', 'CERRADO'] as const;

export const CompromisosList = () => {
  const [filters, setFilters] = useState<CompromisosFilters>({});
  const { data, isLoading } = useCompromisos(filters);
  const { data: proveedores } = useProveedores();
  const navigate = useNavigate();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Compromisos de Pago']);
  }, [setBreadcrumb]);

  const columns = useMemo<ColumnDef<Compromiso>[]>(
    () => [
      {
        accessorKey: 'fechaDocumento',
        header: 'Fecha documento',
        cell: ({ row }) => formatDate(row.original.fechaDocumento)
      },
      {
        accessorKey: 'concepto',
        header: 'Concepto'
      },
      {
        accessorKey: 'proveedor',
        header: 'Proveedor',
        cell: ({ row }) => row.original.proveedor.nombre
      },
      {
        accessorKey: 'importe',
        header: 'Importe',
        cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.importe)}</span>
      },
      {
        accessorKey: 'partida',
        header: 'Partida'
      },
      {
        accessorKey: 'estatus',
        header: 'Estatus',
        cell: ({ row }) => <StatusBadge status={row.original.estatus} />
      }
    ],
    []
  );

  const filtersComponent = (
    <div className="flex flex-wrap items-center gap-2 !bg-transparent">
      <Input
        type="date"
        value={filters.fechaInicio ?? ''}
        onChange={(event) => setFilters((prev) => ({ ...prev, fechaInicio: event.target.value }))}
        className="w-36 !bg-white"
      />
      <Input
        type="date"
        value={filters.fechaFin ?? ''}
        onChange={(event) => setFilters((prev) => ({ ...prev, fechaFin: event.target.value }))}
        className="w-36 !bg-white"
      />
      <Select value={filters.estatus ?? ''} onValueChange={(value) => setFilters((prev) => ({ ...prev, estatus: (value as Compromiso['estatus']) || undefined }))}>
        <SelectTrigger className="w-44 !bg-white">
          <SelectValue placeholder="Estatus" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos</SelectItem>
          {ESTATUS.map((estatus) => (
            <SelectItem key={estatus} value={estatus}>
              {estatus}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.proveedorId ?? ''} onValueChange={(value) => setFilters((prev) => ({ ...prev, proveedorId: value || undefined }))}>
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
      <Button variant="ghost" size="sm" onClick={() => setFilters({})} className="!bg-white">
        Limpiar filtros
      </Button>
    </div>
  );

  return (
    <div className="space-y-4 bg-[#E0E0E0] [&_*]:bg-inherit">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Compromisos de pago</h1>
          <p className="text-sm text-muted-foreground">Gestione el flujo de autorizaciones y pagos.</p>
        </div>
        <div className="bg-[#DCFCE7]">
          <Button size="sm" className="!bg-[#095106] hover:!bg-[#095106] text-white" onClick={() => navigate('/tesoreria/compromisos/nuevo')}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo compromiso
          </Button>
        </div>
      </div>
      <div className="bg-white">
      <DataTable
        data={data ?? []}
        columns={columns}
        searchPlaceholder="Buscar por concepto"
        manualFilterComponent={filtersComponent}
        onRowClick={(row) => navigate(`/tesoreria/compromisos/${row.id}`)}
      />
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Cargando compromisos…</p> : null}
    </div>
  );
};