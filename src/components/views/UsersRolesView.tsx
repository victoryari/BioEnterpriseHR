import React, { useState } from 'react';
import { UsuarioSistema, Sede, EMPRESAS_GRUPO_CARMELITA } from '../../types';
import { AddEditUserModal } from '../modals/AddEditUserModal';
import { AddEditRoleModal, RolPersonalizado, ALL_PERMISOS } from '../modals/AddEditRoleModal';

export const INITIAL_ROLES: RolPersonalizado[] = [
  {
    id: 'rol-1',
    nombre: 'Super Administrador',
    descripcion: 'Acceso total y sin restricciones a todos los módulos, parámetros, MySQL, usuarios y configuraciones del sistema.',
    colorTag: 'purple',
    permisos: ALL_PERMISOS.map((p) => p.id),
    esSistema: true,
  },
  {
    id: 'rol-2',
    nombre: 'Gestor de RRHH',
    descripcion: 'Administración operativa de personal, control de asistencias, cálculo de planillas, boletas de pago y CTS.',
    colorTag: 'blue',
    permisos: [
      'personal_ver',
      'personal_editar',
      'personal_eliminar',
      'asistencia_ver',
      'asistencia_justificar',
      'asistencia_turnos',
      'nominas_ver',
      'nominas_calcular',
      'nominas_plame',
      'hardware_ver',
    ],
    esSistema: true,
  },
  {
    id: 'rol-3',
    nombre: 'Supervisor de Sede',
    descripcion: 'Monitoreo de asistencia y marcaciones en tiempo real restringido a su sede y departamentos asignados.',
    colorTag: 'emerald',
    permisos: [
      'personal_ver',
      'asistencia_ver',
      'asistencia_justificar',
      'asistencia_turnos',
      'hardware_ver',
      'hardware_administrar',
    ],
    esSistema: true,
  },
  {
    id: 'rol-4',
    nombre: 'Colaborador',
    descripcion: 'Acceso exclusivo al Portal de Autoservicio para marcaciones web, solicitudes y descarga de boletas.',
    colorTag: 'amber',
    permisos: ['asistencia_ver', 'nominas_ver'],
    esSistema: true,
  },
];

interface UsersRolesViewProps {
  users: UsuarioSistema[];
  sedes: Sede[];
  onSaveUser: (user: UsuarioSistema, clave?: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({
  users,
  sedes,
  onSaveUser,
  onToggleUserStatus,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');

  // Estado para gestión dinámica de Roles
  const [roles, setRoles] = useState<RolPersonalizado[]>(INITIAL_ROLES);

  // Modales
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UsuarioSistema | null>(null);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<RolPersonalizado | null>(null);

  // Handlers para Usuarios
  const handleOpenAddUser = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (usr: UsuarioSistema) => {
    setUserToEdit(usr);
    setIsUserModalOpen(true);
  };

  // Handlers para Roles
  const handleOpenAddRole = () => {
    setRoleToEdit(null);
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (rol: RolPersonalizado) => {
    setRoleToEdit(rol);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (savedRole: RolPersonalizado) => {
    if (roles.some((r) => r.id === savedRole.id)) {
      setRoles(roles.map((r) => (r.id === savedRole.id ? savedRole : r)));
    } else {
      setRoles([...roles, savedRole]);
    }
  };

  const handleDeleteRole = (roleId: string) => {
    const roleToDelete = roles.find((r) => r.id === roleId);
    if (roleToDelete?.esSistema) {
      alert('Los roles base del sistema no pueden ser eliminados.');
      return;
    }
    if (confirm(`¿Está seguro de eliminar el rol "${roleToDelete?.nombre}"?`)) {
      setRoles(roles.filter((r) => r.id !== roleId));
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.correo.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.rol === roleFilter;
    const matchesCompany = companyFilter === 'all' || (u.empresaAsignada || 'Todas') === companyFilter;
    return matchesSearch && matchesRole && matchesCompany;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.estado === 'Activo').length;
  const adminUsers = users.filter((u) => u.rol === 'Super Administrador').length;
  const rrhhUsers = users.filter((u) => u.rol === 'Gestor de RRHH').length;

  const availableRoleNames = roles.map((r) => r.nombre);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-600 text-[28px]">manage_accounts</span>
            Módulo de Usuarios & Roles (RBAC)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administración de cuentas de acceso al sistema, credenciales y matriz de seguridad.
          </p>
        </div>

        {activeTab === 'users' ? (
          <button
            type="button"
            onClick={handleOpenAddUser}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Crear Nuevo Usuario
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOpenAddRole}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_moderator</span>
            Crear Nuevo Rol de Sistema
          </button>
        )}
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <span className="material-symbols-outlined text-[22px]">group</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Usuarios</p>
            <p className="text-xl font-extrabold text-slate-900 font-headline">{totalUsers}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cuentas Activas</p>
            <p className="text-xl font-extrabold text-emerald-600 font-headline">{activeUsers}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Administradores</p>
            <p className="text-xl font-extrabold text-purple-600 font-headline">{adminUsers}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Roles Configurados</p>
            <p className="text-xl font-extrabold text-amber-600 font-headline">{roles.length} Roles</p>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación del Módulo */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
          Cuentas de Usuarios ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'roles'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          Matriz de Roles & Permisos (RBAC) ({roles.length})
        </button>
      </div>

      {/* PESTAÑA 1: GESTIÓN DE USUARIOS */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Barra de Filtros */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por usuario, correo o rol..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none font-medium cursor-pointer"
              >
                <option value="all">Todos los Roles ({roles.length})</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.nombre}>
                    {r.nombre}
                  </option>
                ))}
              </select>

              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none font-medium cursor-pointer"
              >
                <option value="all">Todas las Empresas ({EMPRESAS_GRUPO_CARMELITA.length})</option>
                {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Usuario / Correo</th>
                    <th className="p-3.5">Rol de Sistema</th>
                    <th className="p-3.5">Empresa Asignada</th>
                    <th className="p-3.5">Sede Asignada</th>
                    <th className="p-3.5">Último Acceso</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {usr.foto ? (
                            <img
                              src={usr.foto}
                              alt={usr.nombre}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                              {usr.nombre.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{usr.nombre}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{usr.correo}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                            usr.rol === 'Super Administrador'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : usr.rol === 'Gestor de RRHH'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : usr.rol === 'Supervisor de Sede'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {usr.rol}
                        </span>
                      </td>

                      <td className="p-3.5 font-medium text-slate-700">
                        {usr.empresaAsignada || 'Todas las Empresas'}
                      </td>

                      <td className="p-3.5 font-medium text-slate-700">
                        {usr.sedeAsignada || 'Todas las Sedes'}
                      </td>

                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {usr.ultimoAcceso || 'Recientemente'}
                      </td>

                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => onToggleUserStatus(usr.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            usr.estado === 'Activo'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${usr.estado === 'Activo' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {usr.estado}
                        </button>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditUser(usr)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar Usuario"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteUser(usr.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Cuenta"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: MATRIZ DE ROLES & PERMISOS */}
      {activeTab === 'roles' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((item) => {
              const colorClasses =
                item.colorTag === 'purple'
                  ? 'border-purple-200 bg-purple-50/50 text-purple-900'
                  : item.colorTag === 'blue'
                  ? 'border-blue-200 bg-blue-50/50 text-blue-900'
                  : item.colorTag === 'emerald'
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                  : item.colorTag === 'amber'
                  ? 'border-amber-200 bg-amber-50/50 text-amber-900'
                  : 'border-rose-200 bg-rose-50/50 text-rose-900';

              const assignedPermObjs = ALL_PERMISOS.filter((p) => item.permisos?.includes(p.id));

              return (
                <div key={item.id} className={`p-5 rounded-2xl border ${colorClasses} space-y-4 shadow-2xs flex flex-col justify-between`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between border-b border-slate-200/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold font-headline tracking-tight">{item.nombre}</h3>
                          {item.esSistema && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200/80 text-slate-700">
                              Sistema Base
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.descripcion}</p>
                      </div>
                      <span className="material-symbols-outlined text-[24px]">verified_user</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Permisos Habilitados ({assignedPermObjs.length} de {ALL_PERMISOS.length}):
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-800 max-h-48 overflow-y-auto pr-1">
                        {assignedPermObjs.map((perm) => (
                          <li key={perm.id} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                            <span>{perm.nombre}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => handleOpenEditRole(item)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px] text-blue-600">edit</span> Editar Rol & Permisos
                    </button>

                    {!item.esSistema && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRole(item.id)}
                        className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span> Eliminar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR USUARIO */}
      <AddEditUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        userToEdit={userToEdit}
        availableRoles={availableRoleNames}
        sedes={sedes}
        onSaveUser={onSaveUser}
      />

      {/* MODAL CREAR / EDITAR ROL */}
      <AddEditRoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        roleToEdit={roleToEdit}
        onSaveRole={handleSaveRole}
      />
    </div>
  );
};
