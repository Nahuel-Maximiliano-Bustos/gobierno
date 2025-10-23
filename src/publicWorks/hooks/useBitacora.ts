import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicWorksApi } from '@publicWorks/services/publicWorksApi';
import type { BitacoraEntrada } from '@publicWorks/types';

export interface BitacoraFilters {
  obraId?: string;
  tipo?: BitacoraEntrada['tipo'];
  fechaDel?: string;
  fechaAl?: string;
}

export const useBitacoraObra = (obraId?: string, filters: Omit<BitacoraFilters, 'obraId'> = {}) =>
  useQuery({
    queryKey: ['obras', 'bitacora', obraId, filters],
    queryFn: () => (obraId ? publicWorksApi.listBitacoraPorObra(obraId, filters) : []),
    enabled: Boolean(obraId)
  });

export const useBitacoraGlobal = (filters: BitacoraFilters) =>
  useQuery({
    queryKey: ['obras', 'bitacora', 'global', filters],
    queryFn: () => publicWorksApi.listBitacora(filters)
  });

export const useRegistrarBitacora = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<BitacoraEntrada, 'id'>) =>
      publicWorksApi.createBitacoraEntrada(payload as BitacoraEntrada),
    onSuccess: (_entrada, payload) => {
      queryClient.invalidateQueries({ queryKey: ['obras', 'bitacora', payload.obraId] });
      queryClient.invalidateQueries({ queryKey: ['obras', 'bitacora', 'global'] });
      queryClient.invalidateQueries({ queryKey: ['obras', 'dashboard'] });
    }
  });
};
