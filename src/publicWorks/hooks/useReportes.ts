import { useQuery } from '@tanstack/react-query';
import { publicWorksApi } from '@publicWorks/services/publicWorksApi';
import type { ReportePlantilla } from '@publicWorks/types';

export const useReportesObras = () =>
  useQuery({
    queryKey: ['obras', 'reportes'],
    queryFn: () => publicWorksApi.listReportes(),
    staleTime: 1000 * 60 * 10
  });
