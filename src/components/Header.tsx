import React, { useState } from 'react';
import { ViewMode, Dispositivo, SolicitudPermiso, MarcacionAsistencia, Empleado, UsuarioSistema } from '../types';
import { ADMIN_AVATAR } from '../data/mockData';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onLogout: () => void;
  notificationCount?: number;
  devices?: Dispositivo[];
  leaveRequests?: SolicitudPermiso[];
  punchLogs?: MarcacionAsistencia[];
  userRole?: 'admin' | 'employee';
  currentEmployee?: Empleado | null;
  currentAdminUser?: UsuarioSistema | null;
  onOpenManageUsers?: () => void;
  onOpenEditProfile?: () => void;
  isBackendConnected?: boolean | null;
  onRetryConnect?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
  onLogout,
  devices = [],
  leaveRequests = [],
  punchLogs = [],
  userRole = 'admin',
  currentEmployee,
  currentAdminUser,
  onOpenManageUsers,
  onOpenEditProfile,
  isBackendConnected,
  onRetryConnect,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const avatarSrc =
    userRole === 'employee'
      ? (currentEmployee?.foto || null)
      : (currentAdminUser?.foto || ADMIN_AVATAR);
  const displayName =
    userRole === 'employee'
      ? (currentEmployee?.nombre || 'Colaborador')
      : (currentAdminUser?.nombre || 'Valeria Torres');
  const displayEmail =
    userRole === 'employee'
      ? (currentEmployee?.correo || 'colaborador@bioenterprise.pe')
      : (currentAdminUser?.correo || 'admin@bioenterprise.pe');
  const displayRoleBadge =
    userRole === 'employee'
      ? (currentEmployee?.cargo || 'Colaborador')
      : (currentAdminUser?.rol || 'Super Admin');

  // Construir notificaciones dinámicas basadas en el rol del usuario
  const notificationItems = [];
  if (userRole === 'admin') {
    const offlineDev = devices.find((d) => d.estado === 'offline');
    const pendingReq = leaveRequests.find((r) => r.estado === 'Pendiente');
    const latestPunch = punchLogs[0];

    if (offlineDev) {
      notificationItems.push({
        icon: 'warning',
        iconColor: 'text-rose-500',
        title: `Terminal ${offlineDev.nombre} desconectado`,
        desc: `Sin respuesta en ${offlineDev.ubicacion} (${offlineDev.ip})`,
      });
    }

    if (pendingReq) {
      notificationItems.push({
        icon: 'pending_actions',
        iconColor: 'text-amber-500',
        title: `Solicitud de ${pendingReq.tipo}`,
        desc: `${pendingReq.nombreEmpleado || 'Colaborador'} solicita ${pendingReq.fechaInicio} al ${pendingReq.fechaFin}`,
      });
    }

    if (latestPunch) {
      notificationItems.push({
        icon: 'fingerprint',
        iconColor: 'text-blue-500',
        title: `Marcación: ${latestPunch.nombreEmpleado}`,
        desc: `${latestPunch.tipo} a las ${latestPunch.hora} en ${latestPunch.nombreDispositivo}`,
      });
    }
  } else {
    // Para el colaborador: notificaciones personales de sus solicitudes
    const myReq = leaveRequests.find((r) => r.nombreEmpleado === currentEmployee?.nombre);
    if (myReq) {
      notificationItems.push({
        icon: myReq.estado === 'Aprobado' ? 'check_circle' : myReq.estado === 'Rechazado' ? 'cancel' : 'schedule',
        iconColor: myReq.estado === 'Aprobado' ? 'text-emerald-500' : myReq.estado === 'Rechazado' ? 'text-rose-500' : 'text-amber-500',
        title: `Solicitud de ${myReq.tipo}: ${myReq.estado}`,
        desc: `Período: ${myReq.fechaInicio} al ${myReq.fechaFin}`,
      });
    }
    notificationItems.push({
      icon: 'verified',
      iconColor: 'text-blue-500',
      title: 'Portal de Autoservicio Activo',
      desc: 'Gestiona tus descansos médicos, vacaciones y permisos laborales',
    });
  }

  const realNotificationCount = notificationItems.length;

  return (
    <header className="flex justify-between items-center w-full px-4 lg:px-8 h-16 sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Mobile Title or Search on Desktop */}
      <div className="flex items-center gap-4">
        <span
          onClick={() => onNavigate('overview')}
          className="text-lg font-bold text-slate-900 lg:hidden cursor-pointer tracking-tight font-headline"
        >
          BioEnterprise HR
        </span>

        {/* Global Search (Solo Admin) */}
        {userRole === 'admin' && (
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar empleados, dispositivos o PIN..."
              className="pl-9 pr-8 py-1.5 bg-slate-50/80 text-xs text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl outline-none w-56 lg:w-72 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Notifications, Settings, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 relative">
        {/* Status BD Indicator */}
        {isBackendConnected === true && (
          <div
            title="Base de Datos MySQL conectada vía API (Puerto 8002)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>BD Conectada</span>
          </div>
        )}
        {isBackendConnected === false && (
          <button
            onClick={onRetryConnect}
            title="Sin conexión con el backend MySQL. Clic para reintentar."
            className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-[11px] font-semibold cursor-pointer transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>Sin Conexión BD</span>
          </button>
        )}
        {isBackendConnected === null && (
          <div
            title="Comprobando conexión con la API de MySQL..."
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-semibold"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Conectando...</span>
          </div>
        )}

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors relative border border-transparent hover:border-slate-200 cursor-pointer"
            title="Notificaciones"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {realNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-lg p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Notificaciones del Sistema
                </h4>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {notificationItems.length} Activas
                </span>
              </div>
              <ul className="divide-y divide-slate-100 text-xs py-1">
                {notificationItems.map((item, idx) => (
                  <li
                    key={idx}
                    className="py-2.5 flex items-start gap-2.5 hover:bg-slate-50 px-1 rounded-xl transition-colors"
                  >
                    <span className={`material-symbols-outlined ${item.iconColor} text-[18px] mt-0.5`}>
                      {item.icon}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setShowNotifications(false);
                  onNavigate('overview');
                }}
                className="w-full text-center text-xs font-semibold text-blue-600 pt-2.5 hover:underline border-t border-slate-100 block cursor-pointer"
              >
                Ver todos los registros
              </button>
            </div>
          )}
        </div>

        {/* Botón Gestión de Usuarios y Roles (Solo Administradores) */}
        {userRole === 'admin' && onOpenManageUsers && (
          <button
            onClick={onOpenManageUsers}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
            title="Gestión de Usuarios del Sistema y Roles (RBAC)"
          >
            <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
          </button>
        )}

        {/* Settings Button (Solo Administradores) */}
        {userRole === 'admin' && (
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
            title="Configuración de Sistema"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        )}

        {/* Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-blue-500/30 transition-all ml-1 cursor-pointer"
            title={displayName}
          >
            {avatarSrc ? (
              <img
                alt={displayName}
                src={avatarSrc}
                className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-2xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 z-50 animate-in fade-in text-xs">
              <div className="p-2 border-b border-slate-100 flex items-center gap-3">
                <div className="relative group shrink-0">
                  {avatarSrc ? (
                    <img
                      alt={displayName}
                      src={avatarSrc}
                      className="w-12 h-12 rounded-2xl border border-slate-200 object-cover shadow-2xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-2xs">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {userRole === 'admin' && onOpenEditProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenEditProfile();
                        setShowProfileMenu(false);
                      }}
                      title="Cambiar foto de perfil"
                      className="absolute inset-0 bg-slate-900/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                    </button>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate text-sm">{displayName}</p>
                  <p className="text-slate-500 text-[11px] truncate font-mono">{displayEmail}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    userRole === 'admin'
                      ? 'bg-blue-50 text-blue-700 border-blue-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    {displayRoleBadge}
                  </span>
                </div>
              </div>

              <div className="py-1.5 space-y-0.5">
                {userRole === 'admin' && onOpenEditProfile && (
                  <button
                    onClick={() => {
                      onOpenEditProfile();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-blue-50/80 text-blue-700 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px] text-blue-600">photo_camera</span>
                    Cambiar Foto / Editar Mi Perfil
                  </button>
                )}

                <button
                  onClick={() => {
                    onNavigate('self-service');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                  Mi Perfil de Autoservicio
                </button>
                {userRole === 'admin' && (
                  <>
                    {onOpenManageUsers && (
                      <button
                        onClick={() => {
                          onOpenManageUsers();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-blue-600">manage_accounts</span>
                        Usuarios y Roles del Sistema
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowSettingsModal(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-slate-400">tune</span>
                      Parámetros del Sistema
                    </button>
                  </>
                )}
              </div>
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-rose-500">logout</span>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5 text-slate-900">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                </div>
                <h3 className="text-base font-bold font-headline">Configuración de BioEnterprise HR</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="space-y-4 py-4 text-xs text-slate-600">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Intervalo de Latido (Heartbeat)
                </label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-600">
                  <option>Cada 30 segundos (Recomendado)</option>
                  <option>Cada 60 segundos</option>
                  <option>Cada 5 minutos</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Protocolo de Comunicación Preferido
                </label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-600">
                  <option>ADMS (Automatic Data Master Server)</option>
                  <option>Push SDK v3.2</option>
                  <option>Autónomo / Polling</option>
                </select>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Cifrado de Plantillas Biométricas</p>
                  <p className="text-[11px] text-slate-500">AES-256 en reposo y tránsito</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded cursor-pointer" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Sincronización Automática en Tiempo Real</p>
                  <p className="text-[11px] text-slate-500">Propagar huellas y rostros a todas las sedes</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded cursor-pointer" />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
              >
                Guardar Ajustes
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
