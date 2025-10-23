import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicWorksApi } from '@publicWorks/services/publicWorksApi';
import type { ExpedienteDocumento } from '@publicWorks/types';

export const useExpedienteObra = (obraId?: string) =>
  useQuery({
    queryKey: ['obras', 'expediente', obraId],
    queryFn: () => (obraId ? publicWorksApi.listExpediente(obraId) : []),
    enabled: Boolean(obraId)
  });

interface DocumentoPayload extends Omit<ExpedienteDocumento, 'id'> {}

export const useAgregarDocumento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DocumentoPayload) => publicWorksApi.addExpedienteDocumento(payload as ExpedienteDocumento),
    onSuccess: (_doc, payload) => {
      queryClient.invalidateQueries({ queryKey: ['obras', 'expediente', payload.obraId] });
      queryClient.invalidateQueries({ queryKey: ['obras', 'catalogo', payload.obraId] });
    }
  });
};
