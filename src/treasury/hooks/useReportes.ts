import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/lib/api';
import { downloadFile } from '@shared/lib/utils';

export interface ReportesFilters {
  cuentaId?: string;
  capitulo?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ReporteData {
  libroIngresos: Array<{ tipo: string; fecha: string; concepto: string; importe: number }>;
  libroEgresos: Array<{ tipo: string; fecha: string; concepto: string; importe: number; proveedorId: string }>;
  compromisosPorEstatus: Record<string, { total: number; items: any[] }>;
  flujoCaja: number;
}

export const useReportes = (filters?: ReportesFilters) =>
  useQuery({
    queryKey: ['reportes', filters],
    queryFn: async () => {
      const { data } = await api.get<ReporteData>('/reportes', { params: filters });
      return data;
    }
  });

export const exportReporteCSV = (titulo: string, rows: Array<Record<string, unknown>>) => {
  if (!rows.length) return;
  const header = Object.keys(rows[0]).join(',');
  const dataRows = rows.map((row) => Object.values(row).map((value) => `"${value ?? ''}"`).join(','));
  downloadFile(`${titulo}-${new Date().toISOString()}.csv`, [header, ...dataRows].join('\n'));
};
