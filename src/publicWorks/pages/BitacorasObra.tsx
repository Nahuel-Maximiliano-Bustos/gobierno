import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { ColumnDef } from '@tanstack/react-table';
import { useUIStore } from '@shared/store/ui.store';
import { useObrasCatalogo } from '@publicWorks/hooks/useObrasCatalogo';
import { useBitacoraGlobal, useRegistrarBitacora } from '@publicWorks/hooks/useBitacora';
import { DataTable } from '@shared/components/DataTable';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { PanelLateral } from '@shared/components/PanelLateral';
import { Badge } from '@shared/components/ui/badge';
import type { BitacoraEntrada } from '@publicWorks/types';
import { formatDate } from '@shared/lib/utils';
import { toast } from '@shared/hooks/useToast';
import { CalendarPlus } from 'lucide-react';

interface BitacoraFormValues {
  obraId: string;
  fecha: string;
  descripcion: string;
  tipo: BitacoraEntrada['tipo'];
  responsable: string;
}

export const BitacorasObra = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const [filters, setFilters] = useState<{ tipo?: BitacoraEntrada['tipo']; fechaDel?: string; fechaAl?: string }>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const { data: obras } = useObrasCatalogo({});
  const { data: bitacora } = useBitacoraGlobal(filters);
  const { mutateAsync, isPending } = useRegistrarBitacora();

  const { register, handleSubmit, setValue, reset, watch } = useForm<BitacoraFormValues>({
    defaultValues: {
      obraId: '',
      fecha: new Date().toISOString().slice(0, 10),
      descripcion: '',
      tipo: 'Residente',
      responsable: ''
    }
  });

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Bitácoras de Obra']);
  }, [setBreadcrumb]);

  useEffect(() => {
    if (obras?.length) {
      setValue('obraId', obras[0].id);
      setValue('responsable', obras[0].contratistaId ? `Residente ${obras[0].contratistaId}` : 'Residente de obra');
    }
  }, [obras, setValue]);

  const columns = useMemo<ColumnDef<BitacoraEntrada>[]>(
    () => [
      {
        accessorKey: 'obraId',
        header: 'Obra',
        cell: ({ row }) => obras?.find((obra) => obra.id === row.original.obraId)?.nombre ?? row.original.obraId
      },
      { accessorKey: 'fecha', header: 'Fecha', cell: ({ row }) => formatDate(row.original.fecha) },
      { accessorKey: 'tipo', header: 'Tipo', cell: ({ row }) => <Badge variant="outline">{row.original.tipo}</Badge> },
      { accessorKey: 'responsable', header: 'Responsable' },
      { accessorKey: 'descripcion', header: 'Descripción' }
    ],
    [obras]
  );

  const submit = handleSubmit(async (values) => {
    if (!values.obraId) {
      toast({ title: 'Seleccione obra', description: 'El registro debe asociarse a una obra.', variant: 'warning' });
      return;
    }
    await mutateAsync({
      obraId: values.obraId,
      fecha: values.fecha,
      tipo: values.tipo,
      descripcion: values.descripcion,
      responsable: values.responsable
    });
    toast({ title: 'Bitácora registrada', description: 'La entrada quedó disponible para consulta.', variant: 'success' });
    reset();
    setPanelOpen(false);
  });

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Bitácoras de obra</h1>
          <p className="text-sm text-muted-foreground">Registro cronológico de avances, incidencias y evidencias.</p>
        </div>
        <Button size="sm" onClick={() => setPanelOpen(true)}>
          <CalendarPlus className="mr-2 h-4 w-4" /> Nueva entrada
        </Button>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <Select value={filters.tipo ?? ''} onValueChange={(value) => setFilters((prev) => ({ ...prev, tipo: (value || undefined) as BitacoraEntrada['tipo'] }))}>
          <SelectTrigger aria-label="Filtrar por tipo">
            <SelectValue placeholder="Tipo de registro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="Residente">Residente</SelectItem>
            <SelectItem value="Supervisión">Supervisión</SelectItem>
            <SelectItem value="Observación">Observación</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filters.fechaDel ?? ''}
          onChange={(event) => setFilters((prev) => ({ ...prev, fechaDel: event.target.value || undefined }))}
        />
        <Input
          type="date"
          value={filters.fechaAl ?? ''}
          onChange={(event) => setFilters((prev) => ({ ...prev, fechaAl: event.target.value || undefined }))}
        />
        <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
          Limpiar filtros
        </Button>
      </div>

      <DataTable data={bitacora ?? []} columns={columns} />
      {!bitacora?.length ? <p className="text-sm text-muted-foreground">Sin registros en el rango seleccionado.</p> : null}

      <PanelLateral
        title="Nueva entrada de bitácora"
        description="Documenta eventos relevantes para el seguimiento de la obra."
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      >
        <form className="space-y-3" onSubmit={submit}>
          <div className="space-y-1">
            <label className="text-sm font-medium">Obra</label>
            <Select value={watch('obraId')} onValueChange={(value) => setValue('obraId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione obra" />
              </SelectTrigger>
              <SelectContent>
                {obras?.map((obra) => (
                  <SelectItem key={obra.id} value={obra.id}>
                    {obra.clave} · {obra.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Fecha</label>
              <Input type="date" {...register('fecha', { required: true })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={watch('tipo')} onValueChange={(value) => setValue('tipo', value as BitacoraEntrada['tipo'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residente">Residente</SelectItem>
                  <SelectItem value="Supervisión">Supervisión</SelectItem>
                  <SelectItem value="Observación">Observación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
              rows={3}
              placeholder="Describe el evento, hallazgo o avance registrado"
              {...register('descripcion', { required: true })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Responsable</label>
            <Input placeholder="Nombre del responsable" {...register('responsable', { required: true })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setPanelOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando…' : 'Registrar entrada'}
            </Button>
          </div>
        </form>
      </PanelLateral>
    </section>
  );
};
