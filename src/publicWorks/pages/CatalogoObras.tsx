import { useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@shared/store/ui.store';
import { useObrasCatalogo, type ObrasFilters } from '@publicWorks/hooks/useObrasCatalogo';
import { useConfiguracionObras } from '@publicWorks/hooks/useConfiguracionObras';
import { Button } from '@shared/components/ui/button';
import { DataTable } from '@shared/components/DataTable';
import { Input } from '@shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Badge } from '@shared/components/ui/badge';
import { StatusBadge } from '@shared/components/StatusBadge';
import { formatCurrency } from '@shared/lib/utils';
import type { Obra } from '@publicWorks/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@shared/components/ui/dropdown-menu';
import { Download, Filter, MoreHorizontal, Plus } from 'lucide-react';
import { toast } from '@shared/hooks/useToast';

const exportObras = (obras: Obra[]) => {
  if (!obras.length) return;
  const header = 'Clave,Obra,Localidad,Fuente,Modalidad,Monto contratado,Monto modificado,Avance físico,Avance financiero,Estatus';
  const rows = obras.map((obra) =>
    [
      obra.clave,
      obra.nombre,
      obra.localidad,
      obra.fuente,
      obra.modalidad ?? '',
      obra.montoContratado,
      obra.montoModificado ?? obra.montoContratado,
      obra.avance.fisico,
      obra.avance.financiero,
      obra.estatus
    ].join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'catalogo-obras.csv';
  link.click();
  URL.revokeObjectURL(link.href);
};

export const CatalogoObras = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ObrasFilters>({});
  const { data, isLoading } = useObrasCatalogo(filters);
  const { data: configuracion } = useConfiguracionObras();

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Catálogo de Obras']);
  }, [setBreadcrumb]);

  const obrasFiltradas = useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const term = search.toLowerCase();
    return data.filter((obra) =>
      [obra.clave, obra.nombre, obra.localidad, obra.rubro]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [data, search]);

  const columns = useMemo<ColumnDef<Obra>[]>(
    () => [
      { accessorKey: 'clave', header: 'Clave' },
      {
        accessorKey: 'nombre',
        header: 'Obra',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.nombre}</p>
            <p className="text-xs text-muted-foreground">{row.original.rubro}</p>
          </div>
        )
      },
      { accessorKey: 'localidad', header: 'Localidad' },
      { accessorKey: 'fuente', header: 'Fuente', cell: ({ row }) => <Badge variant="outline">{row.original.fuente}</Badge> },
      {
        accessorKey: 'montoContratado',
        header: 'Monto contratado',
        cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.montoContratado)}</span>
      },
      {
        accessorKey: 'montoModificado',
        header: 'Monto modificado',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatCurrency(row.original.montoModificado ?? row.original.montoContratado)}
          </span>
        )
      },
      {
        accessorKey: 'avance.fisico',
        header: '% físico / % financiero',
        cell: ({ row }) => (
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-10 rounded bg-emerald-500" aria-hidden />
              {row.original.avance.fisico}%
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-10 rounded bg-sky-500" aria-hidden />
              {row.original.avance.financiero}%
            </div>
          </div>
        )
      },
      {
        accessorKey: 'estatus',
        header: 'Estatus',
        cell: ({ row }) => <StatusBadge status={row.original.estatus} />
      },
      {
        id: 'acciones',
        header: '',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Acciones de la obra">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => navigate(`/obras/catalogo/${row.original.id}`)}>
                Ver detalle
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate(`/obras/catalogo/${row.original.id}/estimaciones`)}>
                Crear estimación
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate(`/obras/catalogo/${row.original.id}/bitacora`)}>
                Registrar avance
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate(`/obras/catalogo/${row.original.id}/contratos`)}>
                Ver contratos
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate(`/obras/expedientes?obra=${row.original.id}`)}>
                Ver expediente técnico
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  const ficha = JSON.stringify(row.original, null, 2);
                  const blob = new Blob([ficha], { type: 'application/json' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = `${row.original.clave}-ficha.json`;
                  link.click();
                  URL.revokeObjectURL(link.href);
                  toast({ title: 'Ficha exportada', description: `Se generó la ficha de ${row.original.nombre}` });
                }}
              >
                Exportar ficha
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    ],
    [navigate]
  );

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Catálogo de Obras</h1>
          <p className="text-sm text-muted-foreground">
            Consulta, filtra y da seguimiento a las obras públicas por ejercicio, fuente y estado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportObras(obrasFiltradas)} disabled={!obrasFiltradas.length}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button size="sm" onClick={() => navigate('/obras/catalogo/nueva')}>
            <Plus className="mr-2 h-4 w-4" /> Nueva obra
          </Button>
        </div>
      </header>

      <aside className="rounded-lg border border-border/70 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Filter className="h-4 w-4" /> Filtros avanzados
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <Input
            placeholder="Buscar por clave o nombre"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="md:col-span-2"
            aria-label="Buscar obra"
          />
          <Select
            value={filters.ejercicio?.toString() ?? ''}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, ejercicio: value ? Number(value) : undefined }))}
          >
            <SelectTrigger aria-label="Filtrar por ejercicio">
              <SelectValue placeholder="Ejercicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {[2023, 2024, 2025].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.fuente ?? ''} onValueChange={(value) => setFilters((prev) => ({ ...prev, fuente: (value || undefined) as Obra['fuente'] }))}>
            <SelectTrigger aria-label="Filtrar por fuente">
              <SelectValue placeholder="Fuente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {(configuracion?.fuentes ?? []).map((fuente) => (
                <SelectItem key={fuente} value={fuente}>
                  {fuente}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.modalidad ?? ''} onValueChange={(value) => setFilters((prev) => ({ ...prev, modalidad: (value || undefined) as Obra['modalidad'] }))}>
            <SelectTrigger aria-label="Filtrar por modalidad">
              <SelectValue placeholder="Modalidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {(configuracion?.modalidades ?? []).map((modalidad) => (
                <SelectItem key={modalidad} value={modalidad}>
                  {modalidad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.localidad ?? ''} onValueChange={(value) => setFilters((prev) => ({ ...prev, localidad: value || undefined }))}>
            <SelectTrigger aria-label="Filtrar por localidad">
              <SelectValue placeholder="Localidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {(configuracion?.localidades ?? []).map((localidad) => (
                <SelectItem key={localidad} value={localidad}>
                  {localidad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.estatus ?? ''} onValueChange={(value) => setFilters((prev) => ({ ...prev, estatus: (value || undefined) as Obra['estatus'] }))}>
            <SelectTrigger aria-label="Filtrar por estatus">
              <SelectValue placeholder="Estatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {['Programada', 'En proceso', 'Suspendida', 'Terminada', 'Cancelada'].map((estatus) => (
                <SelectItem key={estatus} value={estatus}>
                  {estatus}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Total obras: {obrasFiltradas.length}</span>
          <button type="button" className="text-primary" onClick={() => { setFilters({}); setSearch(''); }}>
            Limpiar filtros
          </button>
        </div>
      </aside>

      <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <DataTable data={obrasFiltradas} columns={columns} />
        {isLoading ? <p className="mt-2 text-xs text-muted-foreground">Cargando catálogo…</p> : null}
        {!isLoading && obrasFiltradas.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No se encontraron obras. Ajusta los filtros o agrega una nueva obra al catálogo.
          </p>
        ) : null}
      </div>
    </section>
  );
};

