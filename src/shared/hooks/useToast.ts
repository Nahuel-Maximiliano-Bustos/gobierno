import { create } from 'zustand';

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastStore = {
  toasts: ToastMessage[];
  remove: (id: string) => void;
  push: (toast: ToastMessage) => void;
};

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
  push: (toast) =>
    set((state) => ({
      toasts: [...state.toasts.filter((item) => item.id !== toast.id), toast]
    }))
}));

export const toast = (payload: Omit<ToastMessage, 'id'> & { id?: string }) => {
  const id = payload.id ?? crypto.randomUUID();
  useToastStore.getState().push({ ...payload, id });
  const duration = payload.duration ?? 5_000;
  window.setTimeout(() => useToastStore.getState().remove(id), duration);
};

export const useToast = () => useToastStore();
