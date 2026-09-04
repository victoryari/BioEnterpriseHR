import React, { useState } from 'react';
import { LOGIN_BG } from '../../data/mockData';

interface LoginViewProps {
  onLogin: (role: 'admin' | 'employee', identifier?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState('ES');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = identifier.trim().toLowerCase();
    if (clean.includes('admin') || clean === 'soporte' || clean === 'sistemas' || clean === 'superadmin') {
      onLogin('admin', identifier);
    } else {
      onLogin('employee', identifier);
    }
  };

  return (
    <div className="bg-[#F8FAFC] text-[#1E293B] min-h-screen flex items-center justify-center p-4">
      <main className="w-full max-w-[1024px] bg-white rounded-2xl border border-slate-200 flex flex-col md:flex-row overflow-hidden shadow-sm">
        {/* Left: Brand & Visual */}
        <div className="hidden md:flex flex-col justify-between w-1/2 p-8 lg:p-10 bg-slate-50 border-r border-slate-200 relative overflow-hidden group">
          {/* Background Illustration */}
          <div
            className="absolute inset-0 z-0 opacity-30 mix-blend-multiply pointer-events-none bg-cover bg-center"
            style={{ backgroundImage: `url('${LOGIN_BG}')` }}
          ></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <span className="material-symbols-outlined text-[24px]">fingerprint</span>
              </div>
              <h1 className="text-2xl font-bold font-headline text-slate-900">BioEnterprise HR</h1>
            </div>
            <p className="text-base text-slate-600 font-medium max-w-xs leading-relaxed">
              Sistema de Gestión de Biometría y RRHH.
            </p>
          </div>

          <div className="relative z-10 flex gap-6 items-center text-slate-500 text-[11px] font-bold uppercase tracking-wider mt-12">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-600">
                verified_user
              </span>
              <span>V3.2.0-Seguro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-600">
                lock
              </span>
              <span>Cifrado SSL</span>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          {/* Mobile Header */}
          <div className="flex justify-between items-center mb-6 md:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[20px]">fingerprint</span>
              </div>
              <h1 className="text-lg font-bold font-headline text-slate-900">BioEnterprise HR</h1>
            </div>
          </div>

          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold font-headline text-slate-900">Bienvenido de nuevo</h2>
              <p className="text-xs text-slate-500 mt-1">
                Inicie sesión con su DNI, PIN o cuenta corporativa.
              </p>
            </div>
            {/* Language Selector */}
            <div className="relative inline-block text-left">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="block pl-2.5 pr-7 py-1 text-xs border border-slate-200 bg-slate-50 text-slate-700 rounded-lg shadow-2xs focus:border-blue-600 focus:bg-white cursor-pointer appearance-none outline-none transition-colors"
              >
                <option value="ES">ES</option>
                <option value="EN">EN</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-500">
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5" htmlFor="identifier">
                DNI, PIN o Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">badge</span>
                </div>
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ingrese su DNI, PIN o correo"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-800" htmlFor="password">
                  Contraseña
                </label>
                <span className="text-[11px] text-slate-400">DNI o PIN inicial</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">key</span>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                💡 <strong>Colaboradores:</strong> Ingrese su contraseña personal o su número de <strong>DNI / PIN</strong> registrado.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <span className="ml-2 text-slate-600">Recordarme</span>
              </label>
              <button
                type="button"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-xs active:scale-[0.99] cursor-pointer"
              >
                Iniciar Sesión
              </button>
            </div>
          </form>

          {/* Quick Demo Selector */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Acceso Rápido de Prueba:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIdentifier('admin@bioenterprise.pe');
                  setPassword('admin123');
                  onLogin('admin', 'admin@bioenterprise.pe');
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-left transition-colors group cursor-pointer"
              >
                <div className="font-bold text-slate-900 group-hover:text-blue-700">Administrador HR</div>
                <div className="text-[10px] text-slate-500">Acceso total de gestión</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIdentifier('legal@grupocarmelita.com');
                  setPassword('carmelita2026');
                  onLogin('employee', 'legal@grupocarmelita.com');
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-left transition-colors group cursor-pointer"
              >
                <div className="font-bold text-slate-900 group-hover:text-blue-700">Colaborador Legal</div>
                <div className="text-[10px] text-slate-500">Autoservicio Carmelita</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
