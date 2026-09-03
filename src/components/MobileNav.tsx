import React from 'react';
import { ViewMode } from '../types';

interface MobileNavProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  userRole?: 'admin' | 'employee';
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate, userRole = 'admin' }) => {
  const adminItems: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'overview', label: 'Inicio', icon: 'home' },
    { id: 'hardware', label: 'Dispositivos', icon: 'fingerprint' },
    { id: 'personnel', label: 'Personal', icon: 'group' },
    { id: 'attendance', label: 'Asistencia', icon: 'calendar_today' },
    { id: 'self-service', label: 'Perfil', icon: 'account_circle' },
  ];

  const employeeItems: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'self-service', label: 'Mi Autoservicio', icon: 'account_circle' },
  ];

  const items = userRole === 'employee' ? employeeItems : adminItems;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 py-2 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      {items.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-xl transition-all active:scale-95 ${
              isActive
                ? 'bg-blue-50 text-blue-600 font-semibold shadow-2xs border border-blue-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
