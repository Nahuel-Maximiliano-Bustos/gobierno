import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { useReportes, exportReporteCSV } from '../hooks/useReportes';
import { formatCurrency, formatDate } from '@shared/lib/utils';
import { toast } from '@shared/hooks/useToast';
import { useUIStore } from '@shared/store/ui.store';

export const ReporteEgresosPage = () => {
  const [filters, setFilters] = useState<{ cuentaId?: string; capitulo?: string; fechaInicio?: string; fechaFin?: string }>({});
  const { data, isLoading } = useReportes(filters);
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Reportes', 'Egresos']);
  }, [setBreadcrumb]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Reporte de Egresos</h1>
      
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Cuenta"
          value={filters.cuentaId ?? ''}
          onChange={(event) => setFilters((prev) => ({ ...prev, cuentaId: event.target.value || undefined }))}
          className="w-36"
        />
        <Input
          placeholder="Capítulo"
          value={filters.capitulo ?? ''}
          onChange={(event) => setFilters((prev) => ({ ...prev, capitulo: event.target.value || undefined }))}
          className="w-36"
        />
        <Input
          type="date"
          value={filters.fechaInicio ?? ''}
          onChange={(event) => setFilters((prev) => ({ ...prev, fechaInicio: event.target.value }))}
          className="w-40"
        />
        <Input
          type="date"
          value={filters.fechaFin ?? ''}
          onChange={(event) => setFilters((prev) => ({ ...prev, fechaFin: event.target.value }))}
          className="w-40"
        />
        <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
          Limpiar
        </Button>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Generando reporte de egresos…</p> : null}
      
      {data && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Libro de egresos</CardTitle>
              <p className="text-xs text-muted-foreground">Total registros: {data.libroEgresos.length}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button className="!bg-[#0E1024] hover:!bg-[#1a1d3a] active:!bg-[#060812] !border !border-[#1a1d3a] !text-white" size="sm" onClick={() => exportReporteCSV('libro_egresos', data.libroEgresos)}>
                Exportar CSV
              </Button>
              <Button className="!bg-[#0E1024] hover:!bg-[#1a1d3a] active:!bg-[#060812] !border !border-[#1a1d3a] !text-white" size="sm" onClick={() => toast({ title: 'Exportación PDF', description: 'Se generará en el sistema de reportes oficial.' })}>
                Exportar PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.libroEgresos.map((item) => (
              <div key={`${item.fecha}-${item.concepto}`} className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm">
                <span>{formatDate(item.fecha)} · {item.concepto}</span>
                <span className="font-medium">{formatCurrency(item.importe)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};