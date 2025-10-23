import { NavLink } from 'react-router-dom';
import { cn } from '@shared/lib/utils';
import { useUIStore } from '@shared/store/ui.store';
import {
  Banknote,
  BarChart3,
  BookOpenCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListChecks,
  PiggyBank,
  Settings,
  Users
} from 'lucide-react';

const sections = [
  { to: '/tesoreria/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tesoreria/ingresos', label: 'Ingresos', icon: PiggyBank },
  { to: '/tesoreria/egresos', label: 'Egresos', icon: Banknote },
  { to: '/tesoreria/compromisos', label: 'Compromisos de Pago', icon: ListChecks },
  { to: '/tesoreria/conciliacion', label: 'Conciliación Bancaria', icon: CreditCard },
  { to: '/tesoreria/presupuesto', label: 'Presupuesto', icon: BarChart3 },
  { to: '/tesoreria/proveedores', label: 'Proveedores', icon: Users },
  { to: '/tesoreria/bancos', label: 'Bancos y Cuentas', icon: Building2 },
  { to: '/tesoreria/movimientos', label: 'Movimientos Bancarios', icon: BookOpenCheck },
  { to: '/tesoreria/reportes', label: 'Reportes', icon: FileText },
  { to: '/tesoreria/config', label: 'Configuración de Tesorería', icon: Settings }
];

export const SidebarMenu = () => {
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-[#095106] text-green-100 transition-all sticky top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 px-4 text-lg font-semibold">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#3DD30F] text-sm font-bold text-white">
  TM
</span>
          {!collapsed ? <span>Sistema Tesorería</span> : null}
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-md border border-primary/40 p-1 text-slate-200 transition hover:bg-primary/30"
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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
      'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[#2DB80F]',
      isActive ? 'bg-[#23920B] text-white' : 'text-slate-300'
    )
  }
>
  <Icon className="h-5 w-5" />
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
            Rol activo: <span className="font-semibold text-slate-200">TESORERO</span>
          </p>
        ) : (
          <p className="text-center text-[10px]">TES</p>
        )}
      </footer>
    </aside>
  );
};
