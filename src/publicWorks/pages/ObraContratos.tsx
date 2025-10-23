import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { useUIStore } from '@shared/store/ui.store';
import { useObraDetalle } from '@publicWorks/hooks/useObrasCatalogo';
import { useContratosObra } from '@publicWorks/hooks/useContratos';
import { DataTable } from '@shared/components/DataTable';
import type { ContratoProcedimiento } from '@publicWorks/types';
import { formatCurrency, formatDate } from '@shared/lib/utils';
import { Button } from '@shared/components/ui/button';

export const ObraContratos = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const { data: detalle } = useObraDetalle(id);
  const { data: contratos } = useContratosObra(id);

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Catálogo de Obras', detalle?.obra.nombre ?? `Obra ${id}`, 'Contratos']);
  }, [setBreadcrumb, detalle?.obra.nombre, id]);

  const columns = useMemo<ColumnDef<ContratoProcedimiento>[]>(
    () => [
      { accessorKey: 'modalidad', header: 'Modalidad' },
      { accessorKey: 'descripcion', header: 'Descripción' },
      {
        accessorKey: 'monto',
        header: 'Monto',
        cell: ({ row }) => formatCurrency(row.original.monto)
      },
      {
        accessorKey: 'fechas.convocatoria',
        header: 'Convocatoria',
        cell: ({ row }) => formatDate(row.original.fechas.convocatoria)
      },
      {
        accessorKey: 'fechas.firma',
        header: 'Firma de contrato',
        cell: ({ row }) => (row.original.fechas.firma ? formatDate(row.original.fechas.firma) : 'Pendiente')
      }
    ],
    []
  );

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Contratos vinculados a {detalle?.obra.nombre ?? 'la obra'}</h1>
          <p className="text-sm text-muted-foreground">Consulta los procedimientos y garantías registradas.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/obras/contratos')}>
          Gestionar contratos del módulo
        </Button>
      </header>

      <DataTable data={contratos ?? []} columns={columns} />
      {!contratos?.length ? <p className="text-sm text-muted-foreground">La obra aún no tiene contratos registrados.</p> : null}
    </section>
  );
};

