import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicWorksApi } from '@publicWorks/services/publicWorksApi';
import type { FuenteFin, ProgramaAnualItem } from '@publicWorks/types';

export interface ProgramacionFilters {
  ejercicio?: number;
  fuente?: FuenteFin;
  rubro?: string;
  localidad?: string;
  estatus?: ProgramaAnualItem['estatus'];
}

export const useProgramacionAnual = (filters: ProgramacionFilters) =>
  useQuery({
    queryKey: ['obras', 'programacion', filters],
    queryFn: () => publicWorksApi.listProgramas(filters)
  });

interface ProgramaPayload extends Omit<ProgramaAnualItem, 'id' | 'auditoria'> {}

export const useCrearPrograma = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProgramaPayload) =>
      publicWorksApi.createPrograma({
        ...payload,
        auditoria: payload.auditoria ?? []
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras', 'programacion'] });
      queryClient.invalidateQueries({ queryKey: ['obras', 'dashboard'] });
    }
  });
};
