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
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [formRol, setFormRol] = useState<RolSistema>('Gestor de RRHH');
  const [formEmpresa, setFormEmpresa] = useState<string>('Todas');
  const [formSede, setFormSede] = useState<string>('Todas');
  const [formPassword, setFormPassword] = useState('');
  const [formEstado, setFormEstado] = useState<'Activo' | 'Inactivo'>('Activo');

  // Estado y referencias para Cámara Web
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<{
    code: 'INSECURE_CONTEXT' | 'PERMISSION_DENIED' | 'NO_DEVICE' | 'DEVICE_BUSY' | 'NOT_SUPPORTED' | 'GENERAL';
    message: string;
    actionType?: 'switch_localhost' | 'site_settings';
  } | null>(null);
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

    // 1. Detección de Contexto Inseguro (HTTP no localhost)
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    const isHttps = window.location.protocol === 'https:';

    if (!isLocal && !isHttps) {
      const port = window.location.port ? `:${window.location.port}` : '';
      setCameraError({
        code: 'INSECURE_CONTEXT',
        message:
          `Por políticas de seguridad, los navegadores (Chrome/Edge) solo permiten encender la cámara web en vivo sobre conexiones seguras (localhost o HTTPS). Actualmente estás en "${window.location.origin}". Para usar el visor en vivo, ingresa desde "http://localhost${port}" o pulsa el botón de Cámara Nativa abajo.`,
        actionType: 'switch_localhost',
      });
      return;
    }

    // 2. Comprobar si el navegador expone mediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError({
        code: 'NOT_SUPPORTED',
        message:
          'Tu navegador no expone la API de cámara web en vivo para este origen. Abre la aplicación mediante http://localhost:3000.',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Error detallado de cámara:', err);
      setIsCameraActive(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError({
          code: 'PERMISSION_DENIED',
          message:
            'El navegador bloqueó la solicitud porque el permiso de cámara fue denegado o bloqueado previamente en este sitio web.',
          actionType: 'site_settings',
        });
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError({
          code: 'NO_DEVICE',
          message:
            'No se detectó ninguna cámara web física conectada o habilitada en este equipo.',
        });
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError({
          code: 'DEVICE_BUSY',
          message:
            'La cámara web está ocupada por otra aplicación abierta (Zoom, Google Meet, Teams o la app Cámara de Windows). Ciérralas y vuelve a intentar.',
        });
      } else {
        setCameraError({
          code: 'GENERAL',
          message: `No se pudo iniciar la cámara web (${err.name || 'Error'}: ${err.message || ''}).`,
        });
      }
    }
  };

  // Conectar el stream al video tan pronto el elemento se monte
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((e) => console.warn('Error video play:', e));
    }
  }, [isCameraActive]);

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Efecto espejo horizontal idéntico a lo que ve el usuario en pantalla
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setFormFoto(dataUrl);
    }
    handleStopCamera();
  };

  // Limpiar stream de la cámara al desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Si se abre para editar a un usuario específico (ej: desde el perfil de usuario del Header)
  useEffect(() => {
    if (isOpen && initialEditUserId) {
      const user = users.find((u) => u.id === initialEditUserId || u.correo === initialEditUserId);
      if (user) {
        handleOpenEdit(user);
      }
    }
  }, [isOpen, initialEditUserId]);

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    handleStopCamera();
    setEditingUserId(null);
    setFormNombre('');
    setFormCorreo('');
    setFormFoto('');
    setShowUrlInput(false);
    setFormRol('Gestor de RRHH');
    setFormEmpresa('Todas');
    setFormSede('Todas');
    setFormPassword('Carmelita2026!');
    setFormEstado('Activo');
    setIsEditing(true);
  };

  const handleOpenEdit = (user: UsuarioSistema) => {
    handleStopCamera();
    setEditingUserId(user.id);
    setFormNombre(user.nombre);
    setFormCorreo(user.correo);
    setFormFoto(user.foto || '');
    setShowUrlInput(false);
    setFormRol(user.rol);
    setFormEmpresa(user.empresaAsignada || 'Todas');
    setFormSede(user.sedeAsignada || 'Todas');
    setFormPassword('');
    setFormEstado(user.estado);
    setIsEditing(true);
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

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim() || !formCorreo.trim()) return;

    const existing = users.find((u) => u.id === editingUserId);

    const updatedUser: UsuarioSistema = {
      id: editingUserId || `user-${Date.now()}`,
      nombre: formNombre.trim(),
      correo: formCorreo.trim().toLowerCase(),
      foto: formFoto.trim() || undefined,
      rol: formRol,
      empresaAsignada: formEmpresa,
      sedeAsignada: formSede,
      estado: formEstado,
      ultimoAcceso: existing?.ultimoAcceso || 'Reciente',
      creadoEn: existing?.creadoEn || new Date().toLocaleDateString('es-PE'),
    };

    onSaveUser(updatedUser, formPassword.trim() !== '' ? formPassword.trim() : undefined);
    setIsEditing(false);
  };

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
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: 'shield_person',
        };
      case 'Gestor de RRHH':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: 'badge',
        };
      case 'Supervisor de Sede':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: 'location_away',
        };
      case 'Colaborador':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: 'person',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: 'person',
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
            </div>
            <div>
              <h2 className="text-lg font-bold font-headline text-slate-900 leading-tight">
                Gestión de Usuarios del Sistema y Roles de Acceso (RBAC)
              </h2>
              <p className="text-xs text-slate-500">
                Administra cuentas, foto de perfil, perfiles de seguridad y asignación por empresa de Grupo Carmelita.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              MySQL: bioenterprise_hr
            </span>
            <button
              type="button"
              onClick={() => {
                handleStopCamera();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs: Lista de Usuarios vs Matriz de Roles */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('users');
                setIsEditing(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">group</span>
              Cuentas de Usuarios ({users.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('roles');
                setIsEditing(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'roles'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">admin_panel_settings</span>
              Matriz de Roles & Privilegios
            </button>
          </div>

          {activeTab === 'users' && !isEditing && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              Crear Nuevo Usuario
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: LISTADO DE USUARIOS */}
          {activeTab === 'users' && !isEditing && (
            <div className="space-y-4">
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-80">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o correo de acceso..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-bold text-slate-500">Filtrar Rol:</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none cursor-pointer focus:border-blue-600"
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
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Usuario / Perfil</th>
                        <th className="p-3">Rol del Sistema</th>
                        <th className="p-3">Empresa Permiso</th>
                        <th className="p-3">Sede Asignada</th>
                        <th className="p-3 text-center">Estado</th>
                        <th className="p-3">Último Acceso</th>
                        <th className="p-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                          const badge = getRoleBadge(user.rol);
                          return (
                            <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Usuario con Foto */}
                              <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  {user.foto ? (
                                    <img
                                      src={user.foto}
                                      alt={user.nombre}
                                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                                      {user.nombre.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-slate-900">{user.nombre}</p>
                                    <p className="text-[11px] text-slate-500 font-mono">{user.correo}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Rol */}
                              <td className="p-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                                >
                                  <span className="material-symbols-outlined text-[13px]">
                                    {badge.icon}
                                  </span>
                                  {user.rol}
                                </span>
                              </td>

                              {/* Empresa */}
                              <td className="p-3 whitespace-nowrap">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    user.empresaAsignada === 'Todas'
                                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                                      : user.empresaAsignada.includes('Carmelita')
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : user.empresaAsignada.includes('Chemmer')
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-purple-50 text-purple-700 border-purple-200'
                                  }`}
                                >
                                  {user.empresaAsignada}
                                </span>
                              </td>

                              {/* Sede */}
                              <td className="p-3 whitespace-nowrap text-slate-600">
                                {user.sedeAsignada}
                              </td>

                              {/* Estado */}
                              <td className="p-3 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => onToggleUserStatus(user.id)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                                    user.estado === 'Activo'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  }`}
                                  title="Clic para activar o suspender acceso"
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      user.estado === 'Activo' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                  ></span>
                                  {user.estado}
                                </button>
                              </td>

                              {/* Último Acceso */}
                              <td className="p-3 text-slate-500 whitespace-nowrap text-[11px]">
                                {user.ultimoAcceso || '---'}
                              </td>

                              {/* Acciones */}
                              <td className="p-3 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(user)}
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Editar datos, foto y permisos de usuario"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                  </button>
                                  {user.correo !== 'admin@bioenterprise.pe' && (
                                    <button
                                      type="button"
                                      onClick={() => onDeleteUser(user.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                      title="Eliminar usuario"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">
                                        delete
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
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
            <form onSubmit={handleSubmitForm} className="space-y-4 max-w-2xl mx-auto bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-bold font-headline text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">
                    {editingUserId ? 'person_edit' : 'person_add'}
                  </span>
                  {editingUserId ? 'Editar Cuenta y Perfil de Usuario' : 'Crear Nueva Cuenta de Usuario'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    handleStopCamera();
                    setIsEditing(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              {/* FOTO DE PERFIL DEL USUARIO */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">photo_camera</span>
                    Foto de Perfil del Usuario
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold underline cursor-pointer"
                  >
                    {showUrlInput ? 'Ocultar entrada URL' : 'Ingresar enlace web / URL'}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    {formFoto ? (
                      <img
                        src={formFoto}
                        alt="Foto de perfil"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-white shadow-xs ring-1 ring-slate-200 flex items-center justify-center text-xl font-bold text-blue-600">
                        {formNombre ? formNombre.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    {formFoto && (
                      <button
                        type="button"
                        onClick={() => setFormFoto('')}
                        title="Quitar foto"
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-200">
                        <span className="material-symbols-outlined text-[16px] text-blue-600">upload</span>
                        <span>Cargar desde PC</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={isCameraActive ? handleStopCamera : handleStartCamera}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors border cursor-pointer ${
                          isCameraActive
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isCameraActive ? 'videocam_off' : 'photo_camera'}
                        </span>
                        <span>{isCameraActive ? 'Apagar Cámara' : 'Tomar Foto con Cámara'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Soporta JPG, PNG o captura directa mediante la cámara web de este dispositivo.
                    </p>
                  </div>
                </div>

                {/* Visualizador de Cámara Web en Vivo */}
                {isCameraActive && (
                  <div className="mt-3 p-4 bg-slate-900 rounded-2xl text-white space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                        <span className="text-xs font-bold font-headline tracking-wide uppercase text-slate-200">
                          Cámara en Vivo — Alinea tu rostro al centro
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleStopCamera}
                        className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Cerrar cámara"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>

                    <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center max-w-sm mx-auto aspect-4/3 border border-slate-800 shadow-inner">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover -scale-x-100"
                      />
                      {/* Guía facial biométrica ovalada */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-44 h-56 rounded-full border-2 border-dashed border-white/60 shadow-sm flex items-center justify-center">
                          <span className="text-[10px] text-white/80 font-semibold bg-black/50 px-2.5 py-0.5 rounded-full">
                            Enfoque Facial
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCapturePhoto}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">camera</span>
                        Capturar Foto Ahora
                      </button>
                      <button
                        type="button"
                        onClick={handleStopCamera}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Diagnóstico y Solución de Cámara */}
                {cameraError && (
                  <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-2.5 animate-in fade-in shadow-2xs">
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
                        {cameraError.code === 'PERMISSION_DENIED' ? 'lock' : 'videocam_off'}
                      </span>
                      <div className="flex-1 space-y-1">
                        <p className="font-bold text-amber-950 text-xs">
                          {cameraError.code === 'PERMISSION_DENIED' && 'Permiso de Cámara Bloqueado en el Navegador'}
                          {cameraError.code === 'INSECURE_CONTEXT' && 'Se requiere Conexión Segura (localhost o HTTPS)'}
                          {cameraError.code === 'NO_DEVICE' && 'No se detectó Cámara Web'}
                          {cameraError.code === 'DEVICE_BUSY' && 'Cámara en uso por otra aplicación'}
                          {cameraError.code === 'NOT_SUPPORTED' && 'API de Cámara no compatible'}
                          {cameraError.code === 'GENERAL' && 'No se pudo acceder a la Cámara'}
                        </p>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          {cameraError.message}
                        </p>

                        {cameraError.code === 'PERMISSION_DENIED' && (
                          <div className="mt-2 p-2.5 bg-white/90 rounded-xl border border-amber-200 text-[11px] text-slate-700 space-y-1">
                            <p className="font-bold text-slate-800 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-blue-600">tune</span>
                              Cómo desbloquear el permiso en 3 pasos:
                            </p>
                            <ol className="list-decimal list-inside space-y-0.5 text-slate-600 pl-1">
                              <li>Haz clic en el icono 🔒 a la izquierda de la URL en la barra de direcciones.</li>
                              <li>Busca <b>Cámara</b> y cámbialo a <b>"Permitir"</b>.</li>
                              <li>Recarga la página (F5) y vuelve a pulsar el botón.</li>
                            </ol>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60 justify-end">
                      {cameraError.actionType === 'switch_localhost' && (
                        <a
                          href={`http://localhost:${window.location.port || '3000'}`}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                          Abrir en http://localhost:{window.location.port || '3000'}
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => setCameraError(null)}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-amber-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                )}

                {showUrlInput && (
                  <div className="pt-2 border-t border-slate-100">
                    <input
                      type="url"
                      value={formFoto}
                      onChange={(e) => setFormFoto(e.target.value)}
                      placeholder="https://ejemplo.com/mi-foto-perfil.jpg"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Nombre */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    placeholder="Ej. Valeria Torres"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>

                {/* Correo */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correo de Acceso *</label>
                  <input
                    type="email"
                    required
                    value={formCorreo}
                    onChange={(e) => setFormCorreo(e.target.value)}
                    placeholder="usuario@grupocarmelita.com"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rol de Acceso *</label>
                  <select
                    value={formRol}
                    onChange={(e) => setFormRol(e.target.value as RolSistema)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Super Administrador">🛡️ Super Administrador (Acceso Total)</option>
                    <option value="Gestor de RRHH">📋 Gestor de RRHH (Personal, Asistencia y Nómina)</option>
                    <option value="Supervisor de Sede">📍 Supervisor de Sede (Auditoría Local)</option>
                    <option value="Colaborador">👤 Colaborador (Portal de Autoservicio)</option>
                  </select>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {editingUserId ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Ingreso *'}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingUserId ? 'Dejar en blanco para mantener' : 'Contraseña segura'}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>

                {/* Empresa */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Empresa Asignada (Grupo Carmelita)
                  </label>
                  <select
                    value={formEmpresa}
                    onChange={(e) => setFormEmpresa(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Todas">🏢 Todas las Empresas del Grupo</option>
                    {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                      <option key={emp} value={emp}>
                        {emp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sede */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sede Permitida</label>
                  <select
                    value={formSede}
                    onChange={(e) => setFormSede(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600 cursor-pointer"
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

              {/* Resumen de Alcance del Rol */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  Privilegios del Rol Seleccionado:
                </p>
                {formRol === 'Super Administrador' && (
                  <p className="text-[11px] text-blue-700">
                    Tiene acceso irrestricto a Relojes Biométricos, gestión de usuarios, creación de sedes, exportación de auditoría SUNAFIL y configuración de hardware.
                  </p>
                )}
                {formRol === 'Gestor de RRHH' && (
                  <p className="text-[11px] text-blue-700">
                    Acceso para gestionar el Módulo de Personal, Asistencias, Turnos, Horarios, Feriados y Regularizaciones manuales de marcaciones.
                  </p>
                )}
                {formRol === 'Supervisor de Sede' && (
                  <p className="text-[11px] text-blue-700">
                    Visualiza y supervisa las marcaciones y asistencia de su sede o empresa asignada en tiempo real.
                  </p>
                )}
                {formRol === 'Colaborador' && (
                  <p className="text-[11px] text-blue-700">
                    Acceso exclusivo y restringido a su Portal de Autoservicio (mis asistencias, boletas, permisos y solicitudes de vacaciones).
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    handleStopCamera();
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingUserId ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MATRIZ DE ROLES Y PRIVILEGIOS */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">
                  Esquema de Control de Acceso Basado en Roles (RBAC)
                </h4>
                <p className="text-slate-500">
                  Define el nivel de visibilidad y acción que tiene cada tipo de usuario sobre los módulos del sistema BioEnterprise HR.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Super Admin */}
                <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2.5 text-rose-700 font-bold text-sm">
                    <span className="material-symbols-outlined text-[22px]">shield_person</span>
                    Super Administrador
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Perfil técnico y directivo con privilegios totales sobre la infraestructura.
                  </p>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Control total de Dispositivos Biométricos (ADMS / Push SDK)
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Gestión de Usuarios y Asignación de Roles del Sistema
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Administración de Sedes, Empresas y Departamentos
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Configuración general y exportación de auditoría SUNAFIL
                    </li>
                  </ul>
                </div>

                {/* Gestor de RRHH */}
                <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2.5 text-blue-700 font-bold text-sm">
                    <span className="material-symbols-outlined text-[22px]">badge</span>
                    Gestor de RRHH
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Personal de Recursos Humanos, nóminas y control de tiempo del personal.
                  </p>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Altas, bajas y enrolamiento de colaboradores (DNI/Huella/RFID)
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Control de asistencia y regularización de marcaciones
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Asignación de turnos de trabajo y calendario de feriados
                    </li>
                    <li className="flex items-center gap-1.5 text-rose-500 font-medium">
                      <span className="material-symbols-outlined text-[15px]">cancel</span>
                      Sin acceso a parámetros técnicos de red de los terminales
                    </li>
                  </ul>
                </div>

                {/* Supervisor de Sede */}
                <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-700 font-bold text-sm">
                    <span className="material-symbols-outlined text-[22px]">location_away</span>
                    Supervisor de Sede / Planta
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Jefes de planta o supervisores locales en Zárate, San Borja, Los Olivos o provincias.
                  </p>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Supervisión de asistencia en tiempo real de su sede/empresa
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Consulta de marcaciones y control de incidencias locales
                    </li>
                    <li className="flex items-center gap-1.5 text-rose-500 font-medium">
                      <span className="material-symbols-outlined text-[15px]">cancel</span>
                      Sin permisos para modificar turnos globales ni nómina
                    </li>
                  </ul>
                </div>

                {/* Colaborador */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm">
                    <span className="material-symbols-outlined text-[22px]">person</span>
                    Colaborador (Portal Autoservicio)
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Todos los trabajadores del Grupo Carmelita que ingresan con su DNI o correo corporativo.
                  </p>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Ver su propio récord de asistencia y puntualidad
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Solicitar permisos, licencias y vacaciones con sustento
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Descargar boletas de pago y constancias de trabajo
                    </li>
                    <li className="flex items-center gap-1.5 text-rose-500 font-medium">
                      <span className="material-symbols-outlined text-[15px]">cancel</span>
                      Totalmente bloqueado de los módulos de administración del sistema
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex justify-end items-center bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
