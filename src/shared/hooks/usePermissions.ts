import { useAuthStore } from '@auth/auth.store';

export type TesoreriaPermission = 'VER' | 'CAPTURAR' | 'EDITAR' | 'AUTORIZAR';

const ROLE_POLICIES: Record<'TESORERO', TesoreriaPermission[]> = {
  TESORERO: ['VER', 'CAPTURAR', 'EDITAR', 'AUTORIZAR']
};

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const role = user?.rol ?? 'TESORERO';
  const permissions = ROLE_POLICIES[role] ?? [];
  const has = (perm: TesoreriaPermission) => permissions.includes(perm);
  return { permissions, has };
};
