import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { useUIStore } from '@shared/store/ui.store';
import { useObraDetalle } from '@publicWorks/hooks/useObrasCatalogo';
import { useBitacoraObra } from '@publicWorks/hooks/useBitacora';
import { DataTable } from '@shared/components/DataTable';
import { Badge } from '@shared/components/ui/badge';
import type { BitacoraEntrada } from '@publicWorks/types';
import { formatDate } from '@shared/lib/utils';
import { Button } from '@shared/components/ui/button';

export const ObraBitacora = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const { data: detalle } = useObraDetalle(id);
  const { data: bitacora } = useBitacoraObra(id, {});

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Catálogo de Obras', detalle?.obra.nombre ?? `Obra ${id}`, 'Bitácora']);
  }, [setBreadcrumb, detalle?.obra.nombre, id]);

  const columns = useMemo<ColumnDef<BitacoraEntrada>[]>(
    () => [
      { accessorKey: 'fecha', header: 'Fecha', cell: ({ row }) => formatDate(row.original.fecha) },
      { accessorKey: 'tipo', header: 'Tipo', cell: ({ row }) => <Badge variant="outline">{row.original.tipo}</Badge> },
      { accessorKey: 'descripcion', header: 'Descripción' },
      { accessorKey: 'responsable', header: 'Responsable' }
    ],
    []
  );

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Bitácora de {detalle?.obra.nombre ?? 'la obra'}</h1>
          <p className="text-sm text-muted-foreground">Consulta los eventos y avances registrados por el residente y supervisión.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/obras/bitacoras')}>
          Ver bitácoras del módulo
        </Button>
      </header>

      <DataTable data={bitacora ?? []} columns={columns} />
      {!bitacora?.length ? <p className="text-sm text-muted-foreground">No hay entradas registradas aún.</p> : null}
    </section>
  );
};

