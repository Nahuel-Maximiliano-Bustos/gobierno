import { useQuery } from '@tanstack/react-query';
import { publicWorksApi } from '@publicWorks/services/publicWorksApi';
import type { FuenteFin, ObraEstatus } from '@publicWorks/types';

export interface ObrasDashboardData {
  totalProgramadas: number;
  totalProceso: number;
  totalTerminadas: number;
  montoProgramado: number;
  montoEjercido: number;
  avanceFisicoPromedio: number;
  avanceFinancieroPromedio: number;
  obrasRiesgo: Array<{
    id: string;
    nombre: string;
    localidad: string;
    fuente: FuenteFin;
    estatus: ObraEstatus;
    riesgo: 'Alto' | 'Medio' | 'Bajo';
    diasAtraso: number;
    desviacionFinanciera: number;
  }>;
  financiacionPorFuente: Array<{ fuente: FuenteFin; programado: number; ejercido: number }>;
  avanceTemporal: Array<{ fecha: string; fisico: number; financiero: number }>;
  estatusDistribucion: Array<{ estatus: ObraEstatus; total: number }>;
  obrasAlerta: Array<{
    id: string;
    obra: string;
    localidad: string;
    fuente: FuenteFin;
    monto: number;
    avanceFisico: number;
    avanceFinanciero: number;
    diasAtraso: number;
    desviacion: number;
  }>;
  fechaCorte: string;
}

export const useObrasDashboard = () =>
  useQuery({
    queryKey: ['obras', 'dashboard'],
    queryFn: () => publicWorksApi.getDashboard(),
    staleTime: 1000 * 60 * 5
  });
