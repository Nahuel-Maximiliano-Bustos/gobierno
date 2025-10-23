import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/es-mx';
import { router } from '@app/routes';
import './global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

dayjs.locale('es-mx');

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Elemento root no encontrado');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    import('workbox-window').then(({ Workbox }) => {
      try {
        const wb = new Workbox('/sw.js');
        wb.register();
      } catch (error) {
        console.error('No se pudo registrar el Service Worker', error);
      }
    });
  });
}
