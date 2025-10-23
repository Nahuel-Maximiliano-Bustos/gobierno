import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { ColumnDef } from '@tanstack/react-table';
import { useUIStore } from '@shared/store/ui.store';
import { useObrasCatalogo } from '@publicWorks/hooks/useObrasCatalogo';
import { useContratos, useRegistrarContrato } from '@publicWorks/hooks/useContratos';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { DataTable } from '@shared/components/DataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import { PanelLateral } from '@shared/components/PanelLateral';
import type { ContratoProcedimiento, Modalidad } from '@publicWorks/types';
import { formatCurrency, formatDate, downloadFile } from '@shared/lib/utils';
import { toast } from '@shared/hooks/useToast';
import { Plus, Download } from 'lucide-react';

interface ContratoFormValues {
  obraId: string;
  modalidad: Modalidad;
  descripcion: string;
  convocatoria: string;
  fallo?: string;
  firma?: string;
  contratistaId: string;
  monto: number;
  anticipo: number;
  garantia?: string;
}

export const ContratosProcedimientos = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const [modalidadFiltro, setModalidadFiltro] = useState<Modalidad | ''>('');
  const [panelOpen, setPanelOpen] = useState(false);
  const { data: obras } = useObrasCatalogo({});
  const { data: contratos } = useContratos({ modalidad: modalidadFiltro || undefined });
  const { mutateAsync, isPending } = useRegistrarContrato();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch
  } = useForm<ContratoFormValues>({
    defaultValues: {
      obraId: obras?.[0]?.id ?? '',
      modalidad: 'Licitación',
      descripcion: '',
      convocatoria: new Date().toISOString().slice(0, 10),
      contratistaId: '',
      monto: 0,
      anticipo: 0
    }
  });

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Contratos y Procedimientos']);
  }, [setBreadcrumb]);

  useEffect(() => {
    if (obras?.length) {
      setValue('obraId', obras[0].id);
      if (obras[0].contratistaId) setValue('contratistaId', obras[0].contratistaId);
    }
  }, [obras, setValue]);

  const columnas = useMemo<ColumnDef<ContratoProcedimiento>[]>(
    () => [
      {
        accessorKey: 'obraId',
        header: 'Obra',
        cell: ({ row }) => obras?.find((obra) => obra.id === row.original.obraId)?.nombre ?? row.original.obraId
      },
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
        accessorKey: 'fechas.fallo',
        header: 'Fallo',
        cell: ({ row }) => (row.original.fechas.fallo ? formatDate(row.original.fechas.fallo) : 'Pendiente')
      }
    ],
    [obras]
  );

  const exportContratos = () => {
    if (!contratos?.length) return;
    const header = 'Obra,Modalidad,Monto,Convocatoria,Firma';
    const rows = contratos.map((contrato) => {
      const obra = obras?.find((item) => item.id === contrato.obraId);
      return [
        obra?.clave ?? contrato.obraId,
        contrato.modalidad,
        contrato.monto,
        formatDate(contrato.fechas.convocatoria),
        contrato.fechas.firma ? formatDate(contrato.fechas.firma) : 'Pendiente'
      ].join(',');
    });
    downloadFile('contratos-obras.csv', [header, ...rows].join('\n'), 'text/csv');
  };

  const submit = handleSubmit(async (values) => {
    if (!values.obraId) {
      toast({ title: 'Seleccione obra', description: 'Es necesario asociar el contrato a una obra.', variant: 'warning' });
      return;
    }
    await mutateAsync({
      obraId: values.obraId,
      modalidad: values.modalidad,
      descripcion: values.descripcion,
      fechas: {
        convocatoria: values.convocatoria,
        fallo: values.fallo,
        firma: values.firma
      },
      contratistaId: values.contratistaId || 'sin-contratista',
      monto: values.monto,
      anticipo: values.anticipo,
      plazos: {
        inicio: values.convocatoria,
        termino: values.firma ?? values.fallo ?? values.convocatoria
      },
      garantias: values.garantia ? [values.garantia] : [],
      penasConvencionales: undefined,
      documentos: [],
      auditoria: []
    });
    toast({ title: 'Contrato registrado', description: 'El procedimiento se agregó correctamente.', variant: 'success' });
    reset();
    setPanelOpen(false);
  });

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Contratos y procedimientos</h1>
          <p className="text-sm text-muted-foreground">Da seguimiento a licitaciones, adjudicaciones y contratos vigentes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportContratos} disabled={!contratos?.length}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button size="sm" onClick={() => setPanelOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo procedimiento
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Contratos registrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={modalidadFiltro} onValueChange={(value) => setModalidadFiltro(value as Modalidad | '')}>
              <SelectTrigger className="w-64" aria-label="Filtrar por modalidad">
                <SelectValue placeholder="Todas las modalidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="Licitación">Licitación</SelectItem>
                <SelectItem value="Invitación">Invitación</SelectItem>
                <SelectItem value="Adjudicación">Adjudicación</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable data={contratos ?? []} columns={columnas} />
          {!contratos?.length ? <p className="text-sm text-muted-foreground">Sin contratos registrados con los filtros actuales.</p> : null}
        </CardContent>
      </Card>

      <PanelLateral
        title="Registrar procedimiento"
        description="Documenta los hitos principales del proceso de contratación."
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      >
        <form className="space-y-3" onSubmit={submit}>
          <div className="space-y-2">
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Modalidad</label>
            <Select value={watch('modalidad')} onValueChange={(value) => setValue('modalidad', value as Modalidad)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Licitación">Licitación</SelectItem>
                <SelectItem value="Invitación">Invitación</SelectItem>
                <SelectItem value="Adjudicación">Adjudicación</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Input placeholder="Resumen del procedimiento" {...register('descripcion', { required: true })} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Convocatoria</label>
              <Input type="date" {...register('convocatoria', { required: true })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Fallo</label>
              <Input type="date" {...register('fallo')} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Firma</label>
              <Input type="date" {...register('firma')} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Contratista</label>
              <Input placeholder="Contratista adjudicado" {...register('contratistaId')} />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Monto</label>
              <Input type="number" step="0.01" {...register('monto', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Anticipo (%)</label>
              <Input type="number" step="0.1" {...register('anticipo', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Garantías</label>
            <Input placeholder="Fianza, póliza, etc." {...register('garantia')} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setPanelOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando…' : 'Guardar procedimiento'}
            </Button>
          </div>
        </form>
      </PanelLateral>
    </section>
  );
};

