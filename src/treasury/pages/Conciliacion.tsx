import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { useMovimientos, useConciliarMovimientos, useImportarMovimientos } from '../hooks/useBancos';
import { BankMatchTable } from '../components/BankMatchTable';
import { toast } from '@shared/hooks/useToast';
import { useUIStore } from '@shared/store/ui.store';
import { downloadFile } from '@shared/lib/utils';
import sampleConciliacion from '@mocks/data/conciliacion_ejemplo.csv?raw';

const parseCSV = async (file: File) => {
  const text = await file.text();
  const [header, ...rows] = text.trim().split(/\r?\n/);
  const columns = header.split(',');
  return rows.map((row) => {
    const values = row.split(',');
    const record: Record<string, string> = {};
    columns.forEach((col, index) => {
      record[col.trim()] = values[index]?.replace(/"/g, '') ?? '';
    });
    return {
      id: crypto.randomUUID(),
      cuentaId: record.cuenta,
      fecha: record.fecha,
      concepto: record.concepto,
      importe: Number(record.importe),
      tipo: record.tipo === 'CARGO' ? 'CARGO' : 'ABONO',
      ref: record.ref,
      conciliado: record.conciliado === 'true'
    };
  });
};

export const Conciliacion = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const [cuentaId, setCuentaId] = useState<string | undefined>();
  const { data: movimientos } = useMovimientos({ cuentaId });
  const conciliar = useConciliarMovimientos();
  const importar = useImportarMovimientos();

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Conciliación Bancaria']);
  }, [setBreadcrumb]);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const registros = await parseCSV(file);
    await importar.mutateAsync(registros as any);
    toast({ title: 'Archivo importado', description: `${registros.length} movimientos agregados.` });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Conciliación bancaria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Filtrar por cuenta (ej. CTA-001)"
              value={cuentaId ?? ''}
              onChange={(event) => setCuentaId(event.target.value || undefined)}
              className="w-48"
            />
            <Input type="file" accept=".csv" onChange={handleImport} className="w-60" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadFile('conciliacion_ejemplo.csv', sampleConciliacion, 'text/csv')}
            >
              Descargar plantilla
            </Button>
            <p className="text-xs text-muted-foreground">Periodo bloqueado después del cierre mensual del día 25.</p>
          </div>
          <BankMatchTable
            movimientos={movimientos ?? []}
            onToggle={async (ids, conciliado) => {
              await conciliar.mutateAsync({ ids, conciliado });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
