// Este es el menu de obras públicas (Lo aclaro porque hay dos menús, uno para tesorería y otro para obras públicas)
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@shared/lib/utils';
import { useUIStore } from '@shared/store/ui.store';
import {
  Banknote,
  BarChart3,
  BookOpenCheck,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
  BadgeDollarSign,
  BanknoteArrowUp,
  BanknoteArrowDown,
  LogOut
} from 'lucide-react';
import { useAuth } from '@auth/useAuth';

const sections = [
  { to: '/tesoreria/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tesoreria/ingresos', label: 'Ingresos', icon: BadgeDollarSign },
  { to: '/tesoreria/egresos', label: 'Egresos', icon: Banknote },
  { to: '/tesoreria/compromisos', label: 'Compromisos de Pago', icon: ListChecks },
  { to: '/tesoreria/conciliacion', label: 'Conciliación Bancaria', icon: CreditCard },
  { to: '/tesoreria/presupuesto', label: 'Presupuesto', icon: BarChart3 },
  { to: '/tesoreria/proveedores', label: 'Proveedores', icon: Users },
  { to: '/tesoreria/bancos', label: 'Bancos y Cuentas', icon: Building2 },
  { to: '/tesoreria/config', label: 'Configuración de Tesorería', icon: Settings }
];

export const SidebarMenu = () => {
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const [openReportes, setOpenReportes] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-[#0E1024] text-green-100 transition-all sticky top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 px-4 text-lg font-semibold">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFFFF] text-sm font-bold text-black">
            TM
          </span>
          {!collapsed ? <span className="text-white">Sistema Tesorería</span> : null}
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
            
            // Si tiene subItems, renderizar desplegable
            if ('subItems' in section) {
              return (
                <li key={section.label}>
                  <button
                    onClick={() => setOpenReportes(!openReportes)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[#6f707a] text-slate-300',
                      openReportes && 'bg-[#868791] text-white'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{section.label}</span>
                        {openReportes ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>
                  
                  {/* Submenú - se muestra tanto colapsado como expandido */}
                  {openReportes && (
                    <ul className={cn("mt-1 space-y-1", collapsed ? "ml-0" : "ml-8")}>
                      {section.subItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <li key={subItem.to}>
                            <NavLink
                              to={subItem.to}
                              className={({ isActive }) =>
                                cn(
                                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[#6f707a]',
                                  isActive ? 'bg-[#868791] text-white' : 'text-slate-300'
                                )
                              }
                              title={collapsed ? subItem.label : undefined}
                            >
                              <SubIcon className="h-4 w-4" />
                              {!collapsed && <span>{subItem.label}</span>}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }
            
            // Items normales sin submenú
            return (
              <li key={section.to}>
                <NavLink
                  to={section.to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-[#6f707a]',
                      isActive ? 'bg-[#868791] text-white' : 'text-slate-300'
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  {!collapsed ? <span>{section.label}</span> : null}
                </NavLink>
              </li>
            );
          })}
          
          {/* Cerrar sesión */}
          <li>
            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-red-900/30 text-slate-300 hover:text-red-300"
            >
              <LogOut className="h-5 w-5" />
              {!collapsed ? <span>Cerrar Sesión</span> : null}
            </button>
          </li>
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