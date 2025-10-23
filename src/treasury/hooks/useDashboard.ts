import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/lib/api';
import type { Compromiso, MovimientoBancario } from '@treasury/types';

export interface DashboardData {
  ingresosMes: number;
  metaMensual: number;
  egresosCapitulo: Record<string, number>;
  avancePresupuestal: Array<{ clave: string; nombre: string; disponible: number; pagado: number }>;
  compromisosPorVencer: Compromiso[];
  alertasConciliacion: MovimientoBancario[];
  bitacoraReciente: Array<{ ts: string; user: string; action: string; entidad: string }>;
  tareasHoy: Compromiso[];
}

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get<DashboardData>('/dashboard/tesoreria');
      return data;
    }
  });
