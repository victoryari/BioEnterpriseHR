import React, { useState, useEffect, useRef } from 'react';
import {
  UsuarioSistema,
  RolSistema,
  Sede,
  EMPRESAS_GRUPO_CARMELITA,
} from '../../types';

interface ManageSystemUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UsuarioSistema[];
  sedes: Sede[];
  onSaveUser: (user: UsuarioSistema, clave?: string) => void;
  onDeleteUser: (userId: string) => void;
  onToggleUserStatus: (userId: string) => void;
  initialEditUserId?: string | null;
}

export const ManageSystemUsersModal: React.FC<ManageSystemUsersModalProps> = ({
  isOpen,
  onClose,
  users,
  sedes,
  onSaveUser,
  onDeleteUser,
  onToggleUserStatus,
  initialEditUserId,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Estado para el modal de crear / editar usuario
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formCorreo, setFormCorreo] = useState('');
  const [formFoto, setFormFoto] = useState('');
  const [formRol, setFormRol] = useState<RolSistema>('Gestor de RRHH');
  const [formEmpresa, setFormEmpresa] = useState<string>('Todas');
  const [formSede, setFormSede] = useState<string>('Todas');
  const [formPassword, setFormPassword] = useState('');
  const [formEstado, setFormEstado] = useState<'Activo' | 'Inactivo'>('Activo');

  // Cámara Web
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError('No se pudo acceder a la cámara web.');
    }
  };

  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive]);

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 640, 480);
      setFormFoto(canvas.toDataURL('image/jpeg', 0.9));
    }
    handleStopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormFoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Abrir en modo edición si se pasa initialEditUserId
  useEffect(() => {
    if (isOpen && initialEditUserId) {
      const u = users.find((item) => item.id === initialEditUserId);
      if (u) {
        handleOpenEdit(u);
      }
    }
  }, [isOpen, initialEditUserId]);

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setFormNombre('');
    setFormCorreo('');
    setFormFoto('');
    setFormRol('Gestor de RRHH');
    setFormEmpresa('Todas');
    setFormSede('Todas');
    setFormPassword('');
    setFormEstado('Activo');
    setIsEditing(true);
    setActiveTab('users');
  };

  const handleOpenEdit = (user: UsuarioSistema) => {
    setEditingUserId(user.id);
    setFormNombre(user.nombre);
    setFormCorreo(user.correo);
    setFormFoto(user.foto || '');
    setFormRol(user.rol);
    setFormEmpresa(user.empresaAsignada || 'Todas');
    setFormSede(user.sedeAsignada || 'Todas');
    setFormPassword('');
    setFormEstado(user.estado || 'Activo');
    setIsEditing(true);
    setActiveTab('users');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formCorreo.trim()) return;

    const userObj: UsuarioSistema = {
      id: editingUserId || `usr-${Date.now()}`,
      nombre: formNombre.trim(),
      correo: formCorreo.trim(),
      rol: formRol,
      estado: formEstado,
      foto: formFoto.trim() || undefined,
      empresaAsignada: formEmpresa,
      sedeAsignada: formSede,
      ultimoAcceso: editingUserId
        ? users.find((u) => u.id === editingUserId)?.ultimoAcceso || 'Nunca'
        : 'Recién Creado',
      creadoEn: editingUserId
        ? users.find((u) => u.id === editingUserId)?.creadoEn || new Date().toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    };

    onSaveUser(userObj, formPassword ? formPassword : undefined);
    handleStopCamera();
    setIsEditing(false);
  };

  // Filtrado de usuarios
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.rol === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (rol: RolSistema) => {
    switch (rol) {
      case 'Super Administrador':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Gestor de RRHH':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Supervisor de Sede':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Colaborador':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 overflow-hidden animate-in fade-in">
      <div
        onClick={() => {
          handleStopCamera();
          onClose();
        }}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
      />

      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-300 max-h-[92vh] z-10">
        {/* Cabecera Institucional ERP */}
        <div className="bg-[#004A99] px-4 py-2.5 flex items-center justify-between text-white shadow-sm shrink-0 border-b border-blue-900">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/10 rounded">
              <span className="material-symbols-outlined text-[18px] text-blue-200">admin_panel_settings</span>
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-tight">
                Gestión de Usuarios del Sistema y Permisos (RBAC)
              </h2>
              <p className="text-[9px] text-blue-200 uppercase font-medium">
                Cuentas de Acceso, Roles y Matriz de Privilegios
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            className="p-1 hover:bg-red-600 rounded text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-slate-100/90 px-3 pt-1 border-b border-slate-200 gap-1 overflow-x-auto text-xs font-bold shrink-0 justify-between items-center select-none">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('users');
                setIsEditing(false);
              }}
              className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'users' && !isEditing
                  ? 'border-[#004A99] text-[#004A99] bg-white rounded-t-md shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">group</span>
              Cuentas de Usuarios ({users.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('roles');
                setIsEditing(false);
              }}
              className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'roles'
                  ? 'border-[#004A99] text-[#004A99] bg-white rounded-t-md shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">security</span>
              Matriz de Privilegios RBAC
            </button>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="h-7 px-3 bg-[#004A99] hover:bg-blue-800 text-white rounded text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer mb-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">person_add</span>
              Nuevo Usuario
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/70">
          {/* TAB 1: LISTADO DE USUARIOS */}
          {activeTab === 'users' && !isEditing && (
            <div className="space-y-2.5">
              {/* Filtros */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-2 justify-between items-center">
                <div className="relative w-full sm:w-80">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o correo..."
                    className="w-full h-8 pl-8 pr-2.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Filtrar Rol:</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-blue-500"
                  >
                    <option value="all">Todos los Roles</option>
                    <option value="Super Administrador">Super Administrador</option>
                    <option value="Gestor de RRHH">Gestor de RRHH</option>
                    <option value="Supervisor de Sede">Supervisor de Sede</option>
                    <option value="Colaborador">Colaborador</option>
                  </select>
                </div>
              </div>

              {/* Tabla de Usuarios */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-2.5">Usuario / Perfil</th>
                        <th className="p-2.5">Rol del Sistema</th>
                        <th className="p-2.5">Empresa</th>
                        <th className="p-2.5">Sede</th>
                        <th className="p-2.5 text-center">Estado</th>
                        <th className="p-2.5">Último Acceso</th>
                        <th className="p-2.5 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                          const badge = getRoleBadge(user.rol);
                          const isUserActive = user.estado === 'Activo';
                          return (
                            <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-2.5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {user.foto ? (
                                    <img
                                      src={user.foto}
                                      alt={user.nombre}
                                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-[#004A99] text-white font-bold flex items-center justify-center text-xs shrink-0">
                                      {user.nombre.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-bold text-slate-800 block text-xs leading-tight">
                                      {user.nombre}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block">{user.correo}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-2.5 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${badge}`}>
                                  {user.rol}
                                </span>
                              </td>

                              <td className="p-2.5 whitespace-nowrap text-slate-700 text-xs">
                                {user.empresaAsignada || 'Todas'}
                              </td>

                              <td className="p-2.5 whitespace-nowrap text-slate-700 text-xs">
                                {user.sedeAsignada || 'Todas'}
                              </td>

                              <td className="p-2.5 whitespace-nowrap text-center">
                                <button
                                  type="button"
                                  onClick={() => onToggleUserStatus(user.id)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                    isUserActive
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isUserActive ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}
                                  />
                                  {user.estado || 'Activo'}
                                </button>
                              </td>

                              <td className="p-2.5 whitespace-nowrap text-slate-500 font-mono text-[10px]">
                                {user.ultimoAcceso || 'Nunca'}
                              </td>

                              <td className="p-2.5 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(user)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                    title="Editar cuenta"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                  </button>
                                  {user.rol !== 'Super Administrador' && (
                                    <button
                                      type="button"
                                      onClick={() => onDeleteUser(user.id)}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                      title="Eliminar usuario"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400 text-xs">
                            No se encontraron usuarios con los criterios de búsqueda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FORMULARIO CREAR / EDITAR USUARIO */}
          {activeTab === 'users' && isEditing && (
            <form onSubmit={handleSubmitForm} className="space-y-2.5 max-w-2xl mx-auto">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-700">
                      {editingUserId ? 'person_edit' : 'person_add'}
                    </span>
                    <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">
                      {editingUserId ? 'Editar Cuenta de Usuario' : 'Crear Nueva Cuenta de Usuario'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleStopCamera();
                      setIsEditing(false);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-800 font-bold uppercase cursor-pointer"
                  >
                    Volver a lista
                  </button>
                </div>

                {/* Foto de perfil */}
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                    {formFoto ? (
                      <img src={formFoto} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-slate-400 text-[24px]">person</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-wrap items-center gap-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-7 px-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">upload</span> Subir Foto
                    </button>
                    <button
                      type="button"
                      onClick={isCameraActive ? handleCapturePhoto : handleStartCamera}
                      className="h-7 px-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isCameraActive ? 'camera' : 'videocam'}
                      </span>
                      {isCameraActive ? 'Capturar' : 'Cámara'}
                    </button>
                    {formFoto && (
                      <button
                        type="button"
                        onClick={() => setFormFoto('')}
                        className="h-7 px-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded text-xs font-bold cursor-pointer"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>

                {isCameraActive && (
                  <div className="relative w-48 h-36 bg-black rounded overflow-hidden border border-blue-500 my-2">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Campos del formulario */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={formNombre}
                      onChange={(e) => setFormNombre(e.target.value)}
                      placeholder="Ej. Valeria Torres"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={formCorreo}
                      onChange={(e) => setFormCorreo(e.target.value)}
                      placeholder="usuario@carmelita.pe"
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Rol de Acceso *</label>
                    <select
                      value={formRol}
                      onChange={(e) => setFormRol(e.target.value as RolSistema)}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none cursor-pointer"
                    >
                      <option value="Super Administrador">🛡️ Super Administrador</option>
                      <option value="Gestor de RRHH">📋 Gestor de RRHH</option>
                      <option value="Supervisor de Sede">📍 Supervisor de Sede</option>
                      <option value="Colaborador">👤 Colaborador</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">
                      {editingUserId ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Ingreso *'}
                    </label>
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={editingUserId ? 'Dejar en blanco para conservar' : 'Contraseña segura'}
                      className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Empresa Asignada</label>
                    <select
                      value={formEmpresa}
                      onChange={(e) => setFormEmpresa(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none cursor-pointer"
                    >
                      <option value="Todas">🏢 Todas las Empresas</option>
                      {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                        <option key={emp} value={emp}>
                          {emp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Sede Permitida</label>
                    <select
                      value={formSede}
                      onChange={(e) => setFormSede(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none cursor-pointer"
                    >
                      <option value="Todas">📍 Todas las Sedes</option>
                      {sedes.map((s) => (
                        <option key={s.id} value={s.nombre}>
                          {s.nombre} ({s.ciudad})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      handleStopCamera();
                      setIsEditing(false);
                    }}
                    className="h-8 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded text-xs cursor-pointer shadow-2xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="h-8 px-4 bg-[#004A99] hover:bg-blue-800 text-white font-bold rounded text-xs shadow-md cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">save</span>
                    {editingUserId ? 'Guardar Cambios' : 'Crear Usuario'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: MATRIZ DE ROLES Y PRIVILEGIOS */}
          {activeTab === 'roles' && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {/* Super Admin */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase border-b border-slate-100 pb-1.5">
                    <span className="material-symbols-outlined text-[18px]">shield_person</span>
                    Super Administrador
                  </div>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Control total de Dispositivos Biométricos (ADMS / Push SDK)
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Gestión de Usuarios y Asignación de Roles del Sistema
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Administración de Sedes, Empresas y Departamentos
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Configuración general y exportación de auditoría SUNAFIL
                    </li>
                  </ul>
                </div>

                {/* Gestor de RRHH */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase border-b border-slate-100 pb-1.5">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                    Gestor de RRHH
                  </div>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Altas, bajas y enrolamiento de colaboradores (DNI/Huella/RFID)
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Control de asistencia y regularización de marcaciones
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Asignación de turnos de trabajo y calendario de feriados
                    </li>
                  </ul>
                </div>

                {/* Supervisor de Sede */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase border-b border-slate-100 pb-1.5">
                    <span className="material-symbols-outlined text-[18px]">location_away</span>
                    Supervisor de Sede
                  </div>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Supervisión de asistencia en tiempo real de su sede/empresa
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Consulta de marcaciones y control de incidencias locales
                    </li>
                  </ul>
                </div>

                {/* Colaborador */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase border-b border-slate-100 pb-1.5">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Colaborador (Autoservicio)
                  </div>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Ver su récord de asistencia y puntualidad
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Descargar boletas de pago y certificados
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 flex justify-end items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            className="h-8 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
