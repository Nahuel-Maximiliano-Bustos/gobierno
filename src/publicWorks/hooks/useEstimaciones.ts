import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicWorksApi } from '@publicWorks/services/publicWorksApi';
import type { Estimacion } from '@publicWorks/types';

export interface EstimacionesFilters {
  obraId?: string;
  estatus?: Estimacion['estatus'];
  ejercicio?: number;
}

export const useEstimaciones = (filters: EstimacionesFilters) =>
  useQuery({
    queryKey: ['obras', 'estimaciones', filters],
    queryFn: () => publicWorksApi.listEstimaciones(filters)
  });

export const useObraEstimaciones = (obraId?: string) =>
  useQuery({
    queryKey: ['obras', 'catalogo', obraId, 'estimaciones'],
    queryFn: async () => (obraId ? publicWorksApi.listEstimacionesPorObra(obraId) : []),
    enabled: Boolean(obraId)
  });

interface EstimacionPayload extends Omit<Estimacion, 'id' | 'auditoria'> {}

export const useCrearEstimacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EstimacionPayload) =>
      publicWorksApi.createEstimacion({
        ...(payload as Estimacion),
        auditoria: (payload as Estimacion).auditoria ?? []
      }),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: ['obras', 'estimaciones'] });
      queryClient.invalidateQueries({ queryKey: ['obras', 'catalogo', payload.obraId, 'estimaciones'] });
      queryClient.invalidateQueries({ queryKey: ['obras', 'catalogo'] });
      queryClient.invalidateQueries({ queryKey: ['obras', 'dashboard'] });
    }
  });
};
