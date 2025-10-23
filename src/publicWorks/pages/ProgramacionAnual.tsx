import { useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@shared/store/ui.store';
import { useProgramacionAnual, type ProgramacionFilters } from '@publicWorks/hooks/useProgramacionAnual';
import { useConfiguracionObras } from '@publicWorks/hooks/useConfiguracionObras';
import { Button } from '@shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Input } from '@shared/components/ui/input';
import { DataTable } from '@shared/components/DataTable';
import { Badge } from '@shared/components/ui/badge';
import { formatCurrency, downloadFile } from '@shared/lib/utils';
import type { ProgramaAnualItem } from '@publicWorks/types';
import { Filter, Plus, RefreshCcw, Download } from 'lucide-react';

const exportProgramas = (items: ProgramaAnualItem[]) => {
  if (!items.length) return;
  const header = 'Ejercicio,Programa,Fuente,Rubro,Localidad,Monto programado,Beneficiarios,Estatus';
  const rows = items.map((item) =>
    [
      item.ejercicio,
      item.programa,
      item.fuente,
      item.rubro,
      item.localidad,
      item.montoProgramado,
      item.beneficiarios,
      item.estatus
    ].join(',')
  );
  downloadFile('programacion-anual.csv', [header, ...rows].join('\n'), 'text/csv');
};

export const ProgramacionAnual = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ProgramacionFilters>({});
  const { data, isLoading, refetch } = useProgramacionAnual(filters);
  const { data: configuracion } = useConfiguracionObras();

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Programación Anual']);
  }, [setBreadcrumb]);

  const programasFiltrados = useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    return data.filter((programa) =>
      [programa.programa, programa.localidad, programa.rubro]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search.toLowerCase()))
    );
  }, [data, search]);

  const columns = useMemo<ColumnDef<ProgramaAnualItem>[]>(
    () => [
      { accessorKey: 'ejercicio', header: 'Ejercicio' },
      { accessorKey: 'programa', header: 'Programa' },
      { accessorKey: 'fuente', header: 'Fuente', cell: ({ row }) => <Badge variant="outline">{row.original.fuente}</Badge> },
      { accessorKey: 'rubro', header: 'Rubro' },
      { accessorKey: 'localidad', header: 'Localidad' },
      {
        accessorKey: 'montoProgramado',
        header: 'Monto programado',
        cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.montoProgramado)}</span>
      },
      { accessorKey: 'beneficiarios', header: 'Beneficiarios' },
      {
        accessorKey: 'estatus',
        header: 'Estatus',
        cell: ({ row }) => {
          const estatus = row.original.estatus;
          const variant =
            estatus === 'Planeado' ? 'outline' : estatus === 'Publicado' ? 'success' : 'warning';
          return <Badge variant={variant}>{estatus}</Badge>;
        }
      }
    ],
    []
  );

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Programación Anual de Obras</h1>
          <p className="text-sm text-muted-foreground">
            Planeación del POA por ejercicio fiscal, metas y fuentes de financiamiento.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="bg-#095106" variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportProgramas(programasFiltrados)} disabled={!programasFiltrados.length}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button size="sm" onClick={() => navigate('/obras/poa/nuevo')}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo programa
          </Button>
        </div>
      </header>

      <aside className="rounded-lg border border-border/70 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Filter className="h-4 w-4" /> Filtros del POA
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Select
            value={filters.ejercicio?.toString() ?? ''}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, ejercicio: value ? Number(value) : undefined }))
            }
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
          <Select
            value={filters.fuente ?? ''}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, fuente: (value || undefined) as ProgramacionFilters['fuente'] }))
            }
          >
            <SelectTrigger aria-label="Filtrar por fuente">
              <SelectValue placeholder="Fuente de financiamiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {configuracion?.fuentes.map((fuente) => (
                <SelectItem key={fuente} value={fuente}>
                  {fuente}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.rubro ?? ''}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, rubro: value || undefined }))}
          >
            <SelectTrigger aria-label="Filtrar por rubro">
              <SelectValue placeholder="Rubro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {configuracion?.rubros.map((rubro) => (
                <SelectItem key={rubro} value={rubro}>
                  {rubro}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.localidad ?? ''}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, localidad: value || undefined }))}
          >
            <SelectTrigger aria-label="Filtrar por localidad">
              <SelectValue placeholder="Localidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {configuracion?.localidades.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.estatus ?? ''}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, estatus: (value || undefined) as ProgramaAnualItem['estatus'] }))
            }
          >
            <SelectTrigger aria-label="Filtrar por estatus">
              <SelectValue placeholder="Estatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="Planeado">Planeado</SelectItem>
              <SelectItem value="En revisión">En revisión</SelectItem>
              <SelectItem value="Publicado">Publicado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Buscar programa, rubro o localidad"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full max-w-md"
            aria-label="Buscar programa"
          />
          <Button variant="ghost" size="sm" onClick={() => { setFilters({}); setSearch(''); }}>
            Limpiar filtros
          </Button>
        </div>
      </aside>

      <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <DataTable data={programasFiltrados} columns={columns} />
        {isLoading ? <p className="mt-2 text-xs text-muted-foreground">Cargando programas…</p> : null}
        {!isLoading && programasFiltrados.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No se encontraron programas con los filtros aplicados. Ajusta los criterios o registra un nuevo programa.
          </p>
        ) : null}
      </div>
    </section>
  );
};
