import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './auth.store';
import { toast } from '@shared/hooks/useToast';
import { api } from '@shared/lib/api';

export const useAuth = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const loginStore = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: authToken, user: sessionUser } = response.data;
    loginStore(authToken, sessionUser);
    toast({ title: 'Bienvenido', description: `Sesión iniciada como ${sessionUser.nombre}` });
    navigate('/obras/dashboard', { replace: true });
  };

  const logout = () => {
    logoutStore();
    toast({ title: 'Sesión finalizada', variant: 'warning' });
    navigate('/login', { replace: true });
  };

  return useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout
    }),
    [token, user]
  );
};
