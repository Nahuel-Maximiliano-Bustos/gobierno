import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@auth/LoginPage';
import { RequireAuth } from './guards/RequireAuth';
import { TreasuryLayout } from './layouts/TreasuryLayout';
import { DashboardTesoreria } from '@treasury/pages/DashboardTesoreria';
import { IngresosList } from '@treasury/pages/IngresosList';
import { IngresoNew } from '@treasury/pages/IngresoNew';
import { IngresoDetail } from '@treasury/pages/IngresoDetail';
import { EgresosList } from '@treasury/pages/EgresosList';
import { EgresoNew } from '@treasury/pages/EgresoNew';
import { EgresoDetail } from '@treasury/pages/EgresoDetail';
import { CompromisosList } from '@treasury/pages/CompromisosList';
import { CompromisoNew } from '@treasury/pages/CompromisoNew';
import { CompromisoDetail } from '@treasury/pages/CompromisoDetail';
import { Conciliacion } from '@treasury/pages/Conciliacion';
import { PresupuestoPage } from '@treasury/pages/Presupuesto';
import { ProveedoresPage } from '@treasury/pages/Proveedores';
import { BancosCuentasPage } from '@treasury/pages/BancosCuentas';
import { MovimientosBancariosPage } from '@treasury/pages/MovimientosBancarios';
import { ReporteIngresosPage } from '@treasury/pages/ReporteIngresos';
import { ReporteEgresosPage } from '@treasury/pages/ReporteEgresos';
import { PerfilTesoreriaPage } from '@treasury/pages/Perfil';
import { ConfigTesoreriaPage } from '@treasury/pages/ConfigTesoreria';
import { NotFound } from '@pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <Navigate to="/tesoreria/dashboard" replace />
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/tesoreria',
        element: <TreasuryLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <DashboardTesoreria /> },
          { path: 'ingresos', element: <IngresosList /> },
          { path: 'ingresos/nuevo', element: <IngresoNew /> },
          { path: 'ingresos/:id', element: <IngresoDetail /> },
          { path: 'egresos', element: <EgresosList /> },
          { path: 'egresos/nuevo', element: <EgresoNew /> },
          { path: 'egresos/:id', element: <EgresoDetail /> },
          { path: 'compromisos', element: <CompromisosList /> },
          { path: 'compromisos/nuevo', element: <CompromisoNew /> },
          { path: 'compromisos/:id', element: <CompromisoDetail /> },
          { path: 'conciliacion', element: <Conciliacion /> },
          { path: 'presupuesto', element: <PresupuestoPage /> },
          { path: 'proveedores', element: <ProveedoresPage /> },
          { path: 'bancos', element: <BancosCuentasPage /> },
          { path: 'movimientos', element: <MovimientosBancariosPage /> },
          // { path: 'reportes/ingresos', element: <ReporteIngresosPage /> },
          // { path: 'reportes/egresos', element: <ReporteEgresosPage /> },
          { path: 'reportes/ingresos', element: <ReporteIngresosPage /> },
          { path: 'reportes/egresos', element: <ReporteEgresosPage /> },
          { path: "/tesoreria/perfil", element: <PerfilTesoreriaPage />},
          
          { path: 'config', element: <ConfigTesoreriaPage /> }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
]);