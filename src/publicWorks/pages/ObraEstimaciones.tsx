import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { useUIStore } from '@shared/store/ui.store';
import { useObraDetalle } from '@publicWorks/hooks/useObrasCatalogo';
import { useObraEstimaciones } from '@publicWorks/hooks/useEstimaciones';
import { DataTable } from '@shared/components/DataTable';
import { StatusBadge } from '@shared/components/StatusBadge';
import { formatCurrency } from '@shared/lib/utils';
import type { Estimacion } from '@publicWorks/types';
import { Button } from '@shared/components/ui/button';

export const ObraEstimaciones = () => {
  const { id } = useParams();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const navigate = useNavigate();
  const { data: detalle } = useObraDetalle(id);
  const { data: estimaciones } = useObraEstimaciones(id);

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Catálogo de Obras', detalle?.obra.nombre ?? `Obra ${id}`, 'Estimaciones']);
  }, [setBreadcrumb, detalle?.obra.nombre, id]);

  const columns = useMemo<ColumnDef<Estimacion>[]>(
    () => [
      {
        accessorKey: 'periodo',
        header: 'Periodo',
        cell: ({ row }) => `Del ${row.original.periodo.del} al ${row.original.periodo.al}`
      },
      {
        accessorKey: 'importe.total',
        header: 'Total',
        cell: ({ row }) => formatCurrency(row.original.importe.total)
      },
      {
        accessorKey: 'importe.retenciones',
        header: 'Retenciones',
        cell: ({ row }) => formatCurrency(row.original.importe.retenciones + row.original.importe.deducciones)
      },
      {
        accessorKey: 'estatus',
        header: 'Estatus',
        cell: ({ row }) => <StatusBadge status={row.original.estatus} />
      }
    ],
    []
  );

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Estimaciones de {detalle?.obra.nombre ?? 'la obra'}</h1>
          <p className="text-sm text-muted-foreground">Revisa el historial de valuaciones y su estatus actual.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/obras/estimaciones')}>
          Administrar estimaciones globales
        </Button>
      </header>

      <DataTable data={estimaciones ?? []} columns={columns} />
      {!estimaciones?.length ? <p className="text-sm text-muted-foreground">Esta obra aún no tiene estimaciones registradas.</p> : null}
    </section>
  );
};

