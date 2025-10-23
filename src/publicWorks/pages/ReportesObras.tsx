import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '@shared/store/ui.store';
import { useReportesObras } from '@publicWorks/hooks/useReportes';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from '@shared/hooks/useToast';

export const ReportesObras = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const location = useLocation();
  const searchTerm = (location.state as { term?: string } | undefined)?.term;
  const { data: reportes } = useReportesObras();

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Reportes y exportación']);
  }, [setBreadcrumb]);

  const handleExport = (nombre: string, formatos: string[]) => {
    toast({ title: `Generando ${nombre}`, description: `Formatos: ${formatos.join(', ')}` });
  };

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Reportes y exportación</h1>
        <p className="text-sm text-muted-foreground">Descarga reportes operativos, fichas de obra y estados de estimaciones.</p>
        {searchTerm ? <p className="text-xs text-muted-foreground">Búsqueda recibida: “{searchTerm}”.</p> : null}
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportes?.map((reporte) => (
          <Card key={reporte.id} className="flex h-full flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" /> {reporte.nombre}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{reporte.descripcion}</p>
              {reporte.ultimaGeneracion ? (
                <p className="text-xs text-muted-foreground">Última generación: {reporte.ultimaGeneracion}</p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {reporte.formatos.map((formato) => (
                  <span key={formato} className="rounded-full border border-border px-2 py-0.5">
                    {formato}
                  </span>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport(reporte.nombre, reporte.formatos)}>
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!reportes?.length ? <p className="text-sm text-muted-foreground">No hay reportes configurados.</p> : null}
    </section>
  );
};

