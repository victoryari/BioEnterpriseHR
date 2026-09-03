import React from 'react';
import { ViewMode } from '../types';
import { LOGO_URL } from '../data/mockData';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenSyncModal?: () => void;
  onLogout: () => void;
  userRole: 'admin' | 'employee';
  onToggleRole?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onLogout,
  userRole,
}) => {
  const adminMenuItems = [
    {
      id: 'overview' as ViewMode,
      label: 'Resumen',
      icon: 'dashboard',
    },
    {
      id: 'hardware' as ViewMode,
      label: 'Hardware',
      icon: 'fingerprint',
    },
    {
      id: 'personnel' as ViewMode,
      label: 'Personal',
      icon: 'group',
    },
    {
      id: 'users-roles' as ViewMode,
      label: 'Usuarios y Roles',
      icon: 'manage_accounts',
    },
    {
      id: 'master-tables' as ViewMode,
      label: 'Tablas Maestras',
      icon: 'database',
    },
    {
      id: 'insights' as ViewMode,
      label: 'Análisis',
      icon: 'analytics',
    },
    {
      id: 'attendance' as ViewMode,
      label: 'Asistencia',
      icon: 'calendar_today',
    },
    {
      id: 'shifts-rules' as ViewMode,
      label: 'Turnos y Reglas',
      icon: 'schedule',
    },
    {
      id: 'payroll' as ViewMode,
      label: 'Nóminas y Boletas',
      icon: 'payments',
    },
    {
      id: 'self-service' as ViewMode,
      label: 'Autoservicio',
      icon: 'person',
    },
  ];

  const employeeMenuItems = [
    {
      id: 'self-service' as ViewMode,
      label: 'Mi Autoservicio',
      icon: 'badge',
    },
  ];

  const menuItems = userRole === 'employee' ? employeeMenuItems : adminMenuItems;

  return (
    <aside className="hidden lg:flex flex-col p-4 gap-2 w-64 h-screen sticky left-0 top-0 bg-white border-r border-slate-200 z-40 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-5 px-2 pt-2">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-white flex items-center justify-center p-0.5">
          <img
            alt="Enterprise HR Logo"
            className="w-full h-full rounded-lg object-cover"
            src={LOGO_URL}
          />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight font-headline tracking-tight">Enterprise HR</h1>
          <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">V3.2.0-Seguro</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-0.5">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 text-sm font-medium ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-colors ${
                  isActive ? 'fill text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[13px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>


      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-2 pt-3 border-t border-slate-200">
        <div className="flex flex-col gap-0.5 pt-1">
          <button
            onClick={() => onNavigate('self-service')}
            className="flex items-center gap-2.5 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all text-xs font-medium"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-400">help</span>
            <span>Soporte & Ayuda</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-xs font-medium"
          >
            <span className="material-symbols-outlined text-[18px] text-rose-500">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
