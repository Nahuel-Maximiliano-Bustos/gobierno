import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { ColumnDef } from '@tanstack/react-table';
import { useUIStore } from '@shared/store/ui.store';
import { useObrasCatalogo } from '@publicWorks/hooks/useObrasCatalogo';
import { useActas, useRegistrarActa } from '@publicWorks/hooks/useActas';
import { DataTable } from '@shared/components/DataTable';
import { StatusBadge } from '@shared/components/StatusBadge';
import { Button } from '@shared/components/ui/button';
import { PanelLateral } from '@shared/components/PanelLateral';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Input } from '@shared/components/ui/input';
import type { Acta } from '@publicWorks/types';
import { formatDate, downloadFile } from '@shared/lib/utils';
import { toast } from '@shared/hooks/useToast';
import { Download, Plus, FileText } from 'lucide-react';

interface ActaFormValues {
  obraId: string;
  tipo: Acta['tipo'];
  fecha: string;
  estatus: Acta['estatus'];
  participantes: string;
}

export const ActasObra = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const [filtros, setFiltros] = useState<{ obraId?: string; tipo?: Acta['tipo']; estatus?: Acta['estatus'] }>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const { data: obras } = useObrasCatalogo({});
  const { data: actas } = useActas(filtros);
  const { mutateAsync, isPending } = useRegistrarActa();

  const { register, handleSubmit, setValue, watch, reset } = useForm<ActaFormValues>({
    defaultValues: {
      obraId: '',
      tipo: 'Inicio',
      fecha: new Date().toISOString().slice(0, 10),
      estatus: 'Borrador',
      participantes: ''
    }
  });

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Actas']);
  }, [setBreadcrumb]);

  useEffect(() => {
    if (obras?.length) {
      setValue('obraId', obras[0].id);
    }
  }, [obras, setValue]);

  const columns = useMemo<ColumnDef<Acta>[]>(
    () => [
      {
        accessorKey: 'obraId',
        header: 'Obra',
        cell: ({ row }) => obras?.find((obra) => obra.id === row.original.obraId)?.nombre ?? row.original.obraId
      },
      { accessorKey: 'tipo', header: 'Tipo' },
      { accessorKey: 'folio', header: 'Folio', cell: ({ row }) => <span className="font-medium">{row.original.folio}</span> },
      { accessorKey: 'fecha', header: 'Fecha', cell: ({ row }) => formatDate(row.original.fecha) },
      { accessorKey: 'estatus', header: 'Estatus', cell: ({ row }) => <StatusBadge status={row.original.estatus} /> }
    ],
    [obras]
  );

  const exportActas = () => {
    if (!actas?.length) return;
    const header = 'Obra,Tipo,Folio,Fecha,Estatus';
    const rows = actas.map((acta) => {
      const obra = obras?.find((item) => item.id === acta.obraId);
      return [obra?.clave ?? acta.obraId, acta.tipo, acta.folio, formatDate(acta.fecha), acta.estatus].join(',');
    });
    downloadFile('actas-obras.csv', [header, ...rows].join('\n'), 'text/csv');
  };

  const submit = handleSubmit(async (values) => {
    if (!values.obraId) {
      toast({ title: 'Seleccione obra', description: 'Es necesario elegir la obra para generar el acta.', variant: 'warning' });
      return;
    }
    const folio = `ACT-${values.tipo.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`;
    await mutateAsync({
      id: crypto.randomUUID(),
      obraId: values.obraId,
      tipo: values.tipo,
      folio,
      fecha: values.fecha,
      estatus: values.estatus,
      version: 1,
      participantes: values.participantes ? values.participantes.split(',').map((item) => item.trim()) : [],
      auditoria: []
    });
    toast({ title: 'Acta generada', description: `Se creó el folio ${folio}.`, variant: 'success' });
    reset();
    setPanelOpen(false);
  });

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Actas y minutas</h1>
          <p className="text-sm text-muted-foreground">Plantillas para inicio, suspensión, entrega-recepción y finiquito.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportActas} disabled={!actas?.length}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button size="sm" onClick={() => setPanelOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nueva acta
          </Button>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <Select value={filtros.obraId ?? ''} onValueChange={(value) => setFiltros((prev) => ({ ...prev, obraId: value || undefined }))}>
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
        <Select value={filtros.tipo ?? ''} onValueChange={(value) => setFiltros((prev) => ({ ...prev, tipo: (value || undefined) as Acta['tipo'] }))}>
          <SelectTrigger aria-label="Filtrar por tipo">
            <SelectValue placeholder="Tipo de acta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="Inicio">Inicio</SelectItem>
            <SelectItem value="Suspensión">Suspensión</SelectItem>
            <SelectItem value="Reanudación">Reanudación</SelectItem>
            <SelectItem value="Entrega-Recepción">Entrega-Recepción</SelectItem>
            <SelectItem value="Finiquito">Finiquito</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtros.estatus ?? ''} onValueChange={(value) => setFiltros((prev) => ({ ...prev, estatus: (value || undefined) as Acta['estatus'] }))}>
          <SelectTrigger aria-label="Filtrar por estatus">
            <SelectValue placeholder="Estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="Borrador">Borrador</SelectItem>
            <SelectItem value="Firmada">Firmada</SelectItem>
            <SelectItem value="Cerrada">Cerrada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable data={actas ?? []} columns={columns} />
      {!actas?.length ? <p className="text-sm text-muted-foreground">No hay actas registradas con los filtros seleccionados.</p> : null}

      <PanelLateral
        title="Generar acta"
        description="Completa los datos principales y genera la plantilla en PDF."
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
              <label className="text-sm font-medium">Tipo</label>
              <Select value={watch('tipo')} onValueChange={(value) => setValue('tipo', value as Acta['tipo'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inicio">Inicio</SelectItem>
                  <SelectItem value="Suspensión">Suspensión</SelectItem>
                  <SelectItem value="Reanudación">Reanudación</SelectItem>
                  <SelectItem value="Entrega-Recepción">Entrega-Recepción</SelectItem>
                  <SelectItem value="Finiquito">Finiquito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Estatus</label>
              <Select value={watch('estatus')} onValueChange={(value) => setValue('estatus', value as Acta['estatus'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Borrador">Borrador</SelectItem>
                  <SelectItem value="Firmada">Firmada</SelectItem>
                  <SelectItem value="Cerrada">Cerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Fecha del acta</label>
            <Input type="date" {...register('fecha', { required: true })} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Participantes</label>
            <Input placeholder="Separar con comas" {...register('participantes')} />
            <p className="text-xs text-muted-foreground">Ejemplo: Presidente Municipal, Director de Obras, Testigo social.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setPanelOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Generando…' : 'Generar acta'}
            </Button>
          </div>
        </form>
        <div className="mt-4 rounded border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-2"><FileText className="h-4 w-4" /> Al finalizar podrás descargar la plantilla PDF para recoger firmas.</p>
        </div>
      </PanelLateral>
    </section>
  );
};

