import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicWorksApi } from '@publicWorks/services/publicWorksApi';
import type { ContratoProcedimiento, Modalidad } from '@publicWorks/types';

export interface ContratosFilters {
  obraId?: string;
  modalidad?: Modalidad;
}

export const useContratos = (filters: ContratosFilters) =>
  useQuery({
    queryKey: ['obras', 'contratos', filters],
    queryFn: () => publicWorksApi.listContratos(filters)
  });

export const useContratosObra = (obraId?: string) =>
  useQuery({
    queryKey: ['obras', 'contratos', obraId],
    queryFn: () => (obraId ? publicWorksApi.listContratosPorObra(obraId) : []),
    enabled: Boolean(obraId)
  });

interface ContratoPayload extends Omit<ContratoProcedimiento, 'id' | 'auditoria'> {}

export const useRegistrarContrato = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ContratoPayload) => publicWorksApi.createContrato(payload as ContratoProcedimiento),
    onSuccess: (_contrato, payload) => {
      queryClient.invalidateQueries({ queryKey: ['obras', 'contratos'] });
      queryClient.invalidateQueries({ queryKey: ['obras', 'contratos', payload.obraId] });
    }
  });
};
