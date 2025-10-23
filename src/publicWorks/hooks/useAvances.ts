import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicWorksApi } from '@publicWorks/services/publicWorksApi';
import type { AvanceCurvaS } from '@publicWorks/types';

export interface AvancesFilters {
  obraId?: string;
  periodo?: string;
}

export const useAvances = (filters: AvancesFilters) =>
  useQuery({
    queryKey: ['obras', 'avances', filters],
    queryFn: () => publicWorksApi.listAvances(filters)
  });

export const useAvancesObra = (obraId?: string) =>
  useQuery({
    queryKey: ['obras', 'avances', obraId],
    queryFn: () => (obraId ? publicWorksApi.listAvancesPorObra(obraId) : []),
    enabled: Boolean(obraId)
  });

interface AvancePayload extends Omit<AvanceCurvaS, 'id'> {}

export const useRegistrarAvance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AvancePayload) => publicWorksApi.createAvance(payload as AvanceCurvaS),
    onSuccess: (_avance, payload) => {
      queryClient.invalidateQueries({ queryKey: ['obras', 'avances'] });
      queryClient.invalidateQueries({ queryKey: ['obras', 'avances', payload.obraId] });
      queryClient.invalidateQueries({ queryKey: ['obras', 'dashboard'] });
    }
  });
};
