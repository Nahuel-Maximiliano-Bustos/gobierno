import { create } from 'zustand';
import { setAuthToken } from '@shared/lib/api';

export type TesoreriaUser = {
  email: string;
  nombre: string;
  rol: 'TESORERO';
  permisos: Array<'VER' | 'CAPTURAR' | 'EDITAR' | 'AUTORIZAR'>;
};

type AuthState = {
  token: string | null;
  user: TesoreriaUser | null;
  login: (token: string, user: TesoreriaUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  login: (token, user) => {
    set({ token, user });
    setAuthToken(token);
  },
  logout: () => {
    set({ token: null, user: null });
    setAuthToken(null);
  }
}));
