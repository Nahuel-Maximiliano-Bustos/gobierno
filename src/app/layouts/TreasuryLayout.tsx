import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarMenu } from '@treasury/components/SidebarMenu';
import { Topbar } from '@treasury/components/Topbar';
import { ToastContainer } from '@shared/components/ToastContainer';
import { Breadcrumb } from '@shared/components/ui/breadcrumb';
import { useUIStore } from '@shared/store/ui.store';

const shortcutMap: Record<string, string> = {
  '/tesoreria/ingresos': '/tesoreria/ingresos/nuevo',
  '/tesoreria/egresos': '/tesoreria/egresos/nuevo',
  '/tesoreria/compromisos': '/tesoreria/compromisos/nuevo'
};

const computeNewRoute = (pathname: string) => {
  if (pathname.startsWith('/tesoreria/ingresos')) return '/tesoreria/ingresos/nuevo';
  if (pathname.startsWith('/tesoreria/egresos')) return '/tesoreria/egresos/nuevo';
  if (pathname.startsWith('/tesoreria/compromisos')) return '/tesoreria/compromisos/nuevo';
  return shortcutMap[pathname];
};

export const TreasuryLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const breadcrumb = useUIStore((state) => state.breadcrumb);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;
    const handler = (event: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) {
        if (event.key === '/' && event.ctrlKey) {
          event.preventDefault();
          searchRef.current?.focus();
        }
        return;
      }

      if (event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        const next = computeNewRoute(location.pathname);
        if (next) navigate(next);
      }

      if (event.key.toLowerCase() === 'g') {
        lastKey = 'g';
        lastKeyTime = Date.now();
        return;
      }

      if (lastKey === 'g' && Date.now() - lastKeyTime < 800) {
        if (event.key.toLowerCase() === 'd') {
          event.preventDefault();
          navigate('/tesoreria/dashboard');
        }
        if (event.key.toLowerCase() === 'c') {
          event.preventDefault();
          navigate('/tesoreria/compromisos');
        }
        lastKey = '';
        lastKeyTime = 0;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-screen bg-[#E0E0E0] text-green-900">
      <SidebarMenu />
      <div className="flex flex-1 flex-col">
        <Topbar searchRef={searchRef} onSearch={(term) => term && navigate('/tesoreria/reportes', { state: { term } })} />
        <main className="flex-1 space-y-4 p-6">
          <Breadcrumb items={breadcrumb} />
          <Outlet />
        </main>
        <ToastContainer />
      </div>
    </div>
  );
};
