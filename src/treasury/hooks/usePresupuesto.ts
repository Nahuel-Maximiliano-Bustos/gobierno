import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@shared/lib/api';
import type { Presupuesto } from '@treasury/types';
import { toast } from '@shared/hooks/useToast';

export const usePresupuesto = () =>
  useQuery({
    queryKey: ['presupuesto'],
    queryFn: async () => {
      const { data } = await api.get<Presupuesto & {
        partidas: Array<Presupuesto['partidas'][number] & {
          comprometido: number;
          devengado: number;
          pagado: number;
          disponible: number;
        }>;
      }>('/presupuesto');
      return data;
    }
  });

export const useModificarPresupuesto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ partida, monto, motivo }: { partida: string; monto: number; motivo: string }) => {
      const { data } = await api.post('/presupuesto/modificaciones', { partida, monto, motivo });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presupuesto'] });
      toast({ title: 'Presupuesto actualizado', variant: 'success' });
    }
  });
};
