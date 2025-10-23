import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarMenu } from '@publicWorks/components/SidebarMenu';
import { Topbar } from '@publicWorks/components/Topbar';
import { ToastContainer } from '@shared/components/ToastContainer';
import { Breadcrumb } from '@shared/components/ui/breadcrumb';
import { useUIStore } from '@shared/store/ui.store';

const shortcutMap: Record<string, string> = {
  '/obras/poa': '/obras/poa/nuevo',
  '/obras/catalogo': '/obras/catalogo/nueva',
  '/obras/estimaciones': '/obras/estimaciones/nueva',
  '/obras/bitacoras': '/obras/bitacoras/nueva',
  '/obras/actas': '/obras/actas/nueva'
};

const computeNewRoute = (pathname: string) => {
  if (pathname.startsWith('/obras/catalogo/')) return '/obras/catalogo/nueva';
  if (pathname.startsWith('/obras/poa')) return '/obras/poa/nuevo';
  if (pathname.startsWith('/obras/estimaciones')) return '/obras/estimaciones/nueva';
  if (pathname.startsWith('/obras/bitacoras')) return '/obras/bitacoras/nueva';
  if (pathname.startsWith('/obras/actas')) return '/obras/actas/nueva';
  return shortcutMap[pathname];
};

export const PublicWorksLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const breadcrumb = useUIStore((state) => state.breadcrumb);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;
    const handler = (event: KeyboardEvent) => {
      const tagName = (event.target as HTMLElement)?.tagName;
      const isTyping = tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA';

      if (isTyping) {
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
          navigate('/obras/dashboard');
        }
        if (event.key.toLowerCase() === 'c') {
          event.preventDefault();
          navigate('/obras/catalogo');
        }
        lastKey = '';
        lastKeyTime = 0;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <SidebarMenu />
      <div className="flex flex-1 flex-col">
        <Topbar searchRef={searchRef} onSearch={(term) => term && navigate('/obras/reportes', { state: { term } })} />
        <main className="flex-1 space-y-4 p-6">
          <Breadcrumb items={breadcrumb} />
          <Outlet />
        </main>
        <ToastContainer />
      </div>
    </div>
  );
};

