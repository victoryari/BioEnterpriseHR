import React, { useState, useEffect, useRef } from 'react';
import { UsuarioSistema, Sede, EMPRESAS_GRUPO_CARMELITA } from '../../types';

interface AddEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: UsuarioSistema | null;
  availableRoles: string[];
  sedes: Sede[];
  onSaveUser: (user: UsuarioSistema, clave?: string) => void;
}

export const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  availableRoles,
  sedes,
  onSaveUser,
}) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState(availableRoles[0] || 'Gestor de RRHH');
  const [empresaAsignada, setEmpresaAsignada] = useState('Todas');
  const [sedeAsignada, setSedeAsignada] = useState('Todas');
  const [password, setPassword] = useState('');
  const [estado, setEstado] = useState<'Activo' | 'Inactivo'>('Activo');
  const [foto, setFoto] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Cámara Web
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      setValidationError(null);
      if (userToEdit) {
        setNombre(userToEdit.nombre);
        setCorreo(userToEdit.correo);
        setRol(userToEdit.rol);
        setEmpresaAsignada(userToEdit.empresaAsignada || 'Todas');
        setSedeAsignada(userToEdit.sedeAsignada || 'Todas');
        setEstado(userToEdit.estado);
        setFoto(userToEdit.foto || '');
        setPassword('');
      } else {
        setNombre('');
        setCorreo('');
        setRol(availableRoles[0] || 'Gestor de RRHH');
        setEmpresaAsignada('Todas');
        setSedeAsignada('Todas');
        setEstado('Activo');
        setFoto('');
        setPassword('');
      }
    } else {
      handleStopCamera();
    }
  }, [isOpen, userToEdit, availableRoles]);

  if (!isOpen) return null;

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      alert('No se pudo acceder a la cámara web. Asegúrate de otorgar los permisos.');
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 640, 480);
      setFoto(canvas.toDataURL('image/jpeg', 0.9));
    }
    handleStopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setFoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!nombre.trim() || !correo.trim()) {
      setValidationError('Por favor ingrese el nombre completo y el correo corporativo.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setValidationError('Ingrese un correo electrónico válido.');
      return;
    }

    if (!userToEdit && !password.trim()) {
      setValidationError('Debe asignar una contraseña inicial para el nuevo usuario.');
      return;
    }

    const updatedUser: UsuarioSistema = {
      id: userToEdit ? userToEdit.id : `usr-${Date.now()}`,
      nombre: nombre.trim(),
      correo: correo.trim(),
      rol: rol as any,
      empresaAsignada,
      sedeAsignada,
      estado,
      foto: foto || undefined,
      creadoEn: userToEdit ? userToEdit.creadoEn : new Date().toISOString().split('T')[0],
      ultimoAcceso: userToEdit?.ultimoAcceso || 'Nunca',
    };

    onSaveUser(updatedUser, password.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[92vh] space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-headline">
                {userToEdit ? 'Editar Cuenta de Usuario' : 'Crear Nueva Cuenta de Usuario'}
              </h3>
              <p className="text-xs text-slate-500">
                Credenciales de acceso, rol de sistema y restricciones por empresa/sede.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Avatar / Foto */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center text-slate-500 font-bold">
              {foto ? (
                <img src={foto} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[32px]">person</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">upload</span> Subir Foto
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={handleStartCamera}
                className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">photo_camera</span> Cámara Web
              </button>
            </div>
          </div>

          {/* Visor de Cámara */}
          {isCameraActive && (
            <div className="p-3 bg-slate-900 rounded-xl space-y-2 text-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-44 object-cover rounded-lg border border-slate-700" />
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                >
                  Capturar Foto
                </button>
                <button
                  type="button"
                  onClick={handleStopCamera}
                  className="px-3 py-1.5 bg-slate-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Nombres y Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. María Elena Torres"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Correo Corporativo *</label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="mtorres@grupocarmelita.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Rol y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Rol de Sistema (RBAC) *</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Estado de la Cuenta *</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
              >
                <option value="Activo">🟢 Activo</option>
                <option value="Inactivo">🔴 Inactivo</option>
              </select>
            </div>
          </div>

          {/* Restricción Empresa y Sede */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Empresa Asignada</label>
              <select
                value={empresaAsignada}
                onChange={(e) => setEmpresaAsignada(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-600"
              >
                <option value="Todas">Todas las Empresas del Grupo</option>
                {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Sede Asignada</label>
              <select
                value={sedeAsignada}
                onChange={(e) => setSedeAsignada(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-600"
              >
                <option value="Todas">Todas las Sedes</option>
                {sedes.map((s) => (
                  <option key={s.id} value={s.nombre}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Contraseña {userToEdit ? '(Dejar en blanco para mantener la actual)' : '*'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={userToEdit ? '••••••••' : 'Asignar clave inicial'}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer"
            >
              {userToEdit ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
