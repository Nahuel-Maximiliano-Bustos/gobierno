import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicWorksApi } from '@publicWorks/services/publicWorksApi';
import type { ConfiguracionObras } from '@publicWorks/types';

export const useConfiguracionObras = () =>
  useQuery({
    queryKey: ['obras', 'configuracion'],
    queryFn: () => publicWorksApi.getConfiguracion(),
    staleTime: 1000 * 60 * 30
  });

export const useActualizarConfiguracion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: ConfiguracionObras) => publicWorksApi.updateConfiguracion(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras', 'configuracion'] });
    }
  });
};
