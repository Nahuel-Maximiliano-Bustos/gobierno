import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicWorksApi } from '@publicWorks/services/publicWorksApi';
import type { Acta } from '@publicWorks/types';

export interface ActasFilters {
  obraId?: string;
  tipo?: Acta['tipo'];
  estatus?: Acta['estatus'];
}

export const useActas = (filters: ActasFilters) =>
  useQuery({
    queryKey: ['obras', 'actas', filters],
    queryFn: () => publicWorksApi.listActas(filters)
  });

export const useActasObra = (obraId?: string) =>
  useQuery({
    queryKey: ['obras', 'actas', obraId],
    queryFn: () => (obraId ? publicWorksApi.listActas({ obraId }) : []),
    enabled: Boolean(obraId)
  });

interface ActaPayload extends Omit<Acta, 'id' | 'auditoria'> {}

export const useRegistrarActa = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActaPayload) =>
      publicWorksApi.createActa({ ...(payload as Acta), auditoria: (payload as Acta).auditoria ?? [] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras', 'actas'] });
    }
  });
};
