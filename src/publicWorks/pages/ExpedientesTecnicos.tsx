import { useEffect, useMemo, useState } from 'react';
import { useUIStore } from '@shared/store/ui.store';
import { useObrasCatalogo } from '@publicWorks/hooks/useObrasCatalogo';
import { useExpedienteObra, useAgregarDocumento } from '@publicWorks/hooks/useExpedientes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Progress } from '@shared/components/ui/progress';
import { Uploader } from '@shared/components/Uploader';
import { Button } from '@shared/components/ui/button';
import { formatDate } from '@shared/lib/utils';
import { Download } from 'lucide-react';
import type { ExpedienteDocumento } from '@publicWorks/types';
import { toast } from '@shared/hooks/useToast';

const requiredDocs = [
  'Estudio socioeconómico',
  'Catálogo de conceptos',
  'Planos arquitectónicos',
  'Especificaciones técnicas',
  'Presupuesto base',
  'Bitácora de obra',
  'Programa de ejecución',
  'Programa de suministros',
  'Actas administrativas',
  'Evidencia fotográfica'
];

export const ExpedientesTecnicos = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const [obraId, setObraId] = useState<string>('');
  const { data: obras } = useObrasCatalogo({});
  const { data: documentos, refetch } = useExpedienteObra(obraId);
  const { mutateAsync, isPending } = useAgregarDocumento();

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Expedientes Técnicos']);
  }, [setBreadcrumb]);

  useEffect(() => {
    if (!obraId && obras?.[0]) {
      setObraId(obras[0].id);
    }
  }, [obras, obraId]);

  const cumplimiento = useMemo(() => {
    if (!documentos?.length) return 0;
    const tipos = new Set(documentos.map((doc) => doc.tipo));
    return Math.round((Array.from(tipos).length / requiredDocs.length) * 100);
  }, [documentos]);

  const checklist = requiredDocs.map((doc) => {
    const encontrado = documentos?.find((item) => item.tipo === doc);
    return {
      nombre: doc,
      cumplido: Boolean(encontrado),
      version: encontrado?.version,
      fecha: encontrado?.fecha,
      responsable: encontrado?.responsable
    };
  });

  const handleUpload = async (files: File[]) => {
    if (!obraId) {
      toast({ title: 'Seleccione obra', description: 'Elija una obra para asociar los documentos.', variant: 'warning' });
      return;
    }
    await Promise.all(
      files.map((file) =>
        mutateAsync({
          obraId,
          tipo: file.name.split('.')[0],
          version: 1,
          fecha: new Date().toISOString(),
          responsable: 'Residente de obra',
          archivo: {
            nombre: file.name,
            tipo: file.type || 'application/octet-stream',
            tamano: file.size
          }
        })
      )
    );
    toast({ title: 'Documentos cargados', description: 'Se registraron en el expediente técnico.' });
    refetch();
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Expedientes técnicos</h1>
          <p className="text-sm text-muted-foreground">
            Valida que cada obra cuente con la documentación normativa completa.
          </p>
        </div>
        <Select value={obraId} onValueChange={setObraId}>
          <SelectTrigger className="w-72" aria-label="Seleccionar obra">
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
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Semáforo de cumplimiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Progress value={cumplimiento} className="h-2 w-full" />
            <span className="text-sm font-semibold text-slate-700">{cumplimiento}%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Se consideran {requiredDocs.length} documentos obligatorios conforme al manual técnico del módulo.
          </p>
          <Uploader
            accept=".pdf,.jpg,.jpeg,.png,.dwg,.zip"
            maxSizeMB={15}
            onFiles={handleUpload}
            files={(documentos ?? []).map((doc) => ({ name: doc.archivo.nombre, size: doc.archivo.tamano }))}
          />
          {isPending ? <p className="text-xs text-muted-foreground">Registrando documentos…</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {checklist.map((item) => (
          <Card key={item.nombre} className={item.cumplido ? 'border-emerald-300/70' : 'border-amber-300/60'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                {item.nombre}
                {item.cumplido ? (
                  <Badge className="ml-2" variant="success">
                    Completo
                  </Badge>
                ) : (
                  <Badge className="ml-2" variant="warning">
                    Pendiente
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {item.cumplido ? (
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt>Versión</dt>
                    <dd>v{item.version}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Fecha</dt>
                    <dd>{item.fecha ? formatDate(item.fecha) : '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Responsable</dt>
                    <dd>{item.responsable}</dd>
                  </div>
                </dl>
              ) : (
                <p>Sube el documento en formato PDF, JPG, PNG, DWG o ZIP.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de versiones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(documentos ?? []).map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded border border-border/60 px-3 py-2">
              <div>
                <p className="font-medium text-foreground">{doc.tipo}</p>
                <p className="text-xs text-muted-foreground">
                  v{doc.version} · {formatDate(doc.fecha)} · {doc.responsable}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast({ title: 'Descarga simulada', description: doc.archivo.nombre })}
              >
                <Download className="mr-2 h-4 w-4" /> Descargar
              </Button>
            </div>
          ))}
          {!documentos?.length ? (
            <p className="text-sm text-muted-foreground">Sin documentos registrados para esta obra.</p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
};
