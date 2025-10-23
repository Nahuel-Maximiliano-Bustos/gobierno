import { NavLink } from 'react-router-dom';
import { cn } from '@shared/lib/utils';
import { useUIStore } from '@shared/store/ui.store';
import {
  Activity,
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Cog,
  Layers3,
  LayoutDashboard,
  NotebookPen,
  ScrollText
} from 'lucide-react';

const sections = [
  { to: '/obras/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/obras/poa', label: 'Programación Anual', icon: CalendarRange },
  { to: '/obras/catalogo', label: 'Catálogo de Obras', icon: Layers3 },
  { to: '/obras/expedientes', label: 'Expedientes Técnicos', icon: BookOpen },
  { to: '/obras/contratos', label: 'Contratos y Procedimientos', icon: Briefcase },
  { to: '/obras/bitacoras', label: 'Bitácoras de Obra', icon: NotebookPen },
  { to: '/obras/estimaciones', label: 'Estimaciones y Valuaciones', icon: ClipboardList },
  { to: '/obras/avances', label: 'Avances Físico-Financieros', icon: Activity },
  { to: '/obras/actas', label: 'Actas y Minutas', icon: ScrollText },
  { to: '/obras/reportes', label: 'Reportes y Exportación', icon: BarChart3 },
  { to: '/obras/config', label: 'Configuración del módulo', icon: Cog }
];

export const SidebarMenu = () => {
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <aside
      className={cn(
        'flex min-h-screen flex-col border-r border-border bg-[#095106] text-slate-100 transition-all fixed left-0 top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 px-4 text-lg font-semibold">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            OP
          </span>
          {!collapsed ? <span>Obras Públicas</span> : null}
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-md border border-primary/40 p-1 text-slate-200 transition hover:bg-primary/30"
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" aria-hidden /> : <ChevronLeft className="h-4 w-4" aria-hidden />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-6">
        <ul className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <li key={section.to}>
                <NavLink
                  to={section.to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/20',
                      isActive ? 'bg-primary/30 text-white' : 'text-slate-300'
                    )
                  }
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {!collapsed ? <span>{section.label}</span> : null}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <footer className="border-t border-slate-800 px-3 py-4 text-xs text-slate-500">
        {!collapsed ? (
          <p>
            Rol activo: <span className="font-semibold text-slate-200">OBRAS PÚBLICAS</span>
          </p>
        ) : (
          <p className="text-center text-[10px]">OP</p>
        )}
      </footer>
    </aside>
  );
};
