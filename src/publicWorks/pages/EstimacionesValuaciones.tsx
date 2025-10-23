import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { ColumnDef } from '@tanstack/react-table';
import { useUIStore } from '@shared/store/ui.store';
import { useObrasCatalogo } from '@publicWorks/hooks/useObrasCatalogo';
import { useEstimaciones, useCrearEstimacion } from '@publicWorks/hooks/useEstimaciones';
import { DataTable } from '@shared/components/DataTable';
import { Button } from '@shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Input } from '@shared/components/ui/input';
import { PanelLateral } from '@shared/components/PanelLateral';
import { StatusBadge } from '@shared/components/StatusBadge';
import { formatCurrency, downloadFile } from '@shared/lib/utils';
import type { Estimacion } from '@publicWorks/types';
import { toast } from '@shared/hooks/useToast';
import { Download, Plus } from 'lucide-react';

interface EstimacionFormValues {
  obraId: string;
  periodoDel: string;
  periodoAl: string;
  numero: number;
  directo: number;
  indirecto: number;
  utilidad: number;
  anticipo: number;
  retenciones: number;
  deducciones: number;
  iva: number;
  total: number;
}

export const EstimacionesValuaciones = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const [filters, setFilters] = useState<{ obraId?: string; estatus?: Estimacion['estatus']; ejercicio?: number }>({ ejercicio: new Date().getFullYear() });
  const [panelOpen, setPanelOpen] = useState(false);
  const { data: obras } = useObrasCatalogo({});
  const { data: estimaciones } = useEstimaciones(filters);
  const { mutateAsync, isPending } = useCrearEstimacion();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset
  } = useForm<EstimacionFormValues>({
    defaultValues: {
      obraId: '',
      periodoDel: new Date().toISOString().slice(0, 10),
      periodoAl: new Date().toISOString().slice(0, 10),
      numero: 1,
      directo: 0,
      indirecto: 0,
      utilidad: 0,
      anticipo: 0,
      retenciones: 0,
      deducciones: 0,
      iva: 0,
      total: 0
    }
  });

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Estimaciones y Valuaciones']);
  }, [setBreadcrumb]);

  useEffect(() => {
    if (obras?.length) {
      setValue('obraId', obras[0].id);
    }
  }, [obras, setValue]);

  const totalCalculado = useMemo(() => {
    const directo = watch('directo');
    const indirecto = watch('indirecto');
    const utilidad = watch('utilidad');
    const anticipo = watch('anticipo');
    const retenciones = watch('retenciones');
    const deducciones = watch('deducciones');

    const subtotal = directo + indirecto + utilidad - anticipo - retenciones - deducciones;
    const iva = Number((subtotal * 0.16).toFixed(2));
    const total = Number((subtotal + iva).toFixed(2));
    setValue('iva', iva, { shouldDirty: false });
    setValue('total', total, { shouldDirty: false });
    return { subtotal, iva, total };
  }, [watch, setValue]);

  const columns = useMemo<ColumnDef<Estimacion>[]>(
    () => [
      {
        accessorKey: 'obraId',
        header: 'Obra',
        cell: ({ row }) => obras?.find((obra) => obra.id === row.original.obraId)?.nombre ?? row.original.obraId
      },
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
        accessorKey: 'importe.anticipoAplicado',
        header: 'Anticipo',
        cell: ({ row }) => formatCurrency(row.original.importe.anticipoAplicado)
      },
      {
        accessorKey: 'estatus',
        header: 'Estatus',
        cell: ({ row }) => <StatusBadge status={row.original.estatus} />
      }
    ],
    [obras]
  );

  const exportEstimaciones = () => {
    if (!estimaciones?.length) return;
    const header = 'Obra,Periodo,Total,Estatus';
    const rows = estimaciones.map((estimacion) => {
      const obra = obras?.find((item) => item.id === estimacion.obraId);
      return [
        obra?.clave ?? estimacion.obraId,
        `${estimacion.periodo.del} - ${estimacion.periodo.al}`,
        estimacion.importe.total,
        estimacion.estatus
      ].join(',');
    });
    downloadFile('estimaciones-obras.csv', [header, ...rows].join('\n'), 'text/csv');
  };

  const submit = handleSubmit(async (values) => {
    if (!values.obraId) {
      toast({ title: 'Seleccione obra', description: 'La estimación debe asociarse con una obra.', variant: 'warning' });
      return;
    }

    const obra = obras?.find((item) => item.id === values.obraId);
    if (!obra) {
      toast({ title: 'Obra no localizada', variant: 'destructive' });
      return;
    }

    const limite = (obra.montoModificado ?? obra.montoContratado) * 1.05;
    if (totalCalculado.total > limite) {
      toast({
        title: 'Monto excedido',
        description: 'El total supera el monto autorizado para la obra.',
        variant: 'warning'
      });
      return;
    }

    const payload: Estimacion = {
      id: crypto.randomUUID(),
      obraId: values.obraId,
      periodo: { del: values.periodoDel, al: values.periodoAl, numero: values.numero },
      importe: {
        directo: values.directo,
        indirecto: values.indirecto,
        utilidad: values.utilidad,
        anticipoAplicado: values.anticipo,
        retenciones: values.retenciones,
        deducciones: values.deducciones,
        subtotal: Number(totalCalculado.subtotal.toFixed(2)),
        iva: totalCalculado.iva,
        total: totalCalculado.total
      },
      partidas: [
        {
          clave: 'GEN-001',
          descripcion: 'Estimación generada desde el módulo',
          unidad: 'Global',
          cantidad: 1,
          precioUnitario: totalCalculado.total,
          importe: totalCalculado.total
        }
      ],
      estatus: 'Borrador',
      auditoria: []
    };

    await mutateAsync(payload);
    toast({ title: 'Estimación registrada', description: 'Se envió para revisión.', variant: 'success' });
    reset();
    setPanelOpen(false);
  });

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Estimaciones y valuaciones</h1>
          <p className="text-sm text-muted-foreground">Calcula importes, retenciones y envíos a Tesorería.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportEstimaciones} disabled={!estimaciones?.length}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button size="sm" onClick={() => setPanelOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nueva estimación
          </Button>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-4">
        <Select value={filters.obraId ?? ''} onValueChange={(value) => setFilters((prev) => ({ ...prev, obraId: value || undefined }))}>
          <SelectTrigger aria-label="Filtrar por obra">
            <SelectValue placeholder="Obra" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            {obras?.map((obra) => (
              <SelectItem key={obra.id} value={obra.id}>
                {obra.clave}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.estatus ?? ''} onValueChange={(value) => setFilters((prev) => ({ ...prev, estatus: (value || undefined) as Estimacion['estatus'] }))}>
          <SelectTrigger aria-label="Filtrar por estatus">
            <SelectValue placeholder="Estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="Borrador">Borrador</SelectItem>
            <SelectItem value="En revisión">En revisión</SelectItem>
            <SelectItem value="Aprobada">Aprobada</SelectItem>
            <SelectItem value="Enviada a Tesorería">Enviada a Tesorería</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.ejercicio?.toString() ?? ''} onValueChange={(value) => setFilters((prev) => ({ ...prev, ejercicio: value ? Number(value) : undefined }))}>
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
        <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
          Limpiar filtros
        </Button>
      </div>

      <DataTable data={estimaciones ?? []} columns={columns} />
      {!estimaciones?.length ? <p className="text-sm text-muted-foreground">Sin estimaciones registradas.</p> : null}

      <PanelLateral
        title="Nueva estimación"
        description="Completa los importes y deja que el sistema calcule IVA y total."
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
            <div>
              <label className="text-sm font-medium">Periodo del</label>
              <Input type="date" {...register('periodoDel', { required: true })} />
            </div>
            <div>
              <label className="text-sm font-medium">Periodo al</label>
              <Input type="date" {...register('periodoAl', { required: true })} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Número de estimación</label>
            <Input type="number" min={1} {...register('numero', { valueAsNumber: true })} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Importe directo</label>
              <Input type="number" step="0.01" {...register('directo', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-sm font-medium">Indirectos</label>
              <Input type="number" step="0.01" {...register('indirecto', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-sm font-medium">Utilidad</label>
              <Input type="number" step="0.01" {...register('utilidad', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-sm font-medium">Anticipo aplicado</label>
              <Input type="number" step="0.01" {...register('anticipo', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-sm font-medium">Retenciones</label>
              <Input type="number" step="0.01" {...register('retenciones', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-sm font-medium">Deducciones</label>
              <Input type="number" step="0.01" {...register('deducciones', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="rounded border border-dashed border-border bg-muted/40 p-3 text-sm">
            <p>Subtotal: {formatCurrency(totalCalculado.subtotal)}</p>
            <p>IVA (16%): {formatCurrency(totalCalculado.iva)}</p>
            <p className="font-semibold text-primary">Total: {formatCurrency(totalCalculado.total)}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setPanelOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando…' : 'Guardar estimación'}
            </Button>
          </div>
        </form>
      </PanelLateral>
    </section>
  );
};

