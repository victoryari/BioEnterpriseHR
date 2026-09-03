import React, { useState, useEffect } from 'react';

export interface PermisoSistema {
  id: string;
  modulo: string;
  nombre: string;
  descripcion: string;
}

export const ALL_PERMISOS: PermisoSistema[] = [
  { id: 'personal_ver', modulo: 'Módulo de Personal', nombre: 'Ver Fichas de Personal', descripcion: 'Acceso de lectura a listado y fichas de colaboradores' },
  { id: 'personal_editar', modulo: 'Módulo de Personal', nombre: 'Crear / Editar Colaboradores', descripcion: 'Registrar nuevo personal, editar sueldos, DNI y biometría' },
  { id: 'personal_eliminar', modulo: 'Módulo de Personal', nombre: 'Dar de Baja Colaboradores', descripcion: 'Inactivar empleados y registrar motivo de cese' },

  { id: 'asistencia_ver', modulo: 'Módulo de Asistencia', nombre: 'Ver Marcaciones de Asistencia', descripcion: 'Visualizar registros, entradas, salidas y tardanzas' },
  { id: 'asistencia_justificar', modulo: 'Módulo de Asistencia', nombre: 'Justificar Tardanzas / Faltas', descripcion: 'Aprobar licencias, permisos y justificar inasistencias' },
  { id: 'asistencia_turnos', modulo: 'Módulo de Asistencia', nombre: 'Gestionar Turnos y Reglas', descripcion: 'Crear horarios, asignación semanal y minutos de tolerancia' },

  { id: 'nominas_ver', modulo: 'Nómina & Boletas', nombre: 'Ver Remuneraciones y Boletas', descripcion: 'Acceso a la vista de sueldos y descarga de boletas D.L. 728' },
  { id: 'nominas_calcular', modulo: 'Nómina & Boletas', nombre: 'Calcular Planillas, CTS y Grati', descripcion: 'Procesar liquidaciones semestrales y emisión de boletas' },
  { id: 'nominas_plame', modulo: 'Nómina & Boletas', nombre: 'Generar Archivos PLAME SUNAT', descripcion: 'Exportar archivos de ingesta T-Registro / PLAME' },

  { id: 'hardware_ver', modulo: 'Hardware & Biometría', nombre: 'Ver Dispositivos ZKTeco', descripcion: 'Estado de conexión e IP de relojes biométricos' },
  { id: 'hardware_administrar', modulo: 'Hardware & Biometría', nombre: 'Administrar Hardware y Enrolar', descripcion: 'Enviar comandos a terminales y sintonizar huellas/rostros' },

  { id: 'usuarios_administrar', modulo: 'Seguridad & Parámetros', nombre: 'Administrar Usuarios y Roles (RBAC)', descripcion: 'Crear usuarios de sistema y modificar permisos de roles' },
  { id: 'parametros_editar', modulo: 'Seguridad & Parámetros', nombre: 'Editar Parámetros Laborales Perú', descripcion: 'Modificar valores de UIT, RMV y tasas de comisiones AFP' },
];

export interface RolPersonalizado {
  id: string;
  nombre: string;
  descripcion: string;
  colorTag: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose';
  permisos: string[]; // IDs de permisos asignados
  esSistema?: boolean;
}

interface AddEditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit: RolPersonalizado | null;
  onSaveRole: (role: RolPersonalizado) => void;
}

export const AddEditRoleModal: React.FC<AddEditRoleModalProps> = ({
  isOpen,
  onClose,
  roleToEdit,
  onSaveRole,
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [colorTag, setColorTag] = useState<'purple' | 'blue' | 'emerald' | 'amber' | 'rose'>('blue');
  const [selectedPermisos, setSelectedPermisos] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValidationError(null);
      if (roleToEdit) {
        setNombre(roleToEdit.nombre);
        setDescripcion(roleToEdit.descripcion);
        setColorTag(roleToEdit.colorTag);
        setSelectedPermisos(roleToEdit.permisos || []);
      } else {
        setNombre('');
        setDescripcion('');
        setColorTag('blue');
        setSelectedPermisos([]);
      }
    }
  }, [isOpen, roleToEdit]);

  if (!isOpen) return null;

  const handleTogglePermiso = (permisoId: string) => {
    if (selectedPermisos.includes(permisoId)) {
      setSelectedPermisos(selectedPermisos.filter((p) => p !== permisoId));
    } else {
      setSelectedPermisos([...selectedPermisos, permisoId]);
    }
  };

  const handleSelectAllInModulo = (modulo: string) => {
    const moduloPerms = ALL_PERMISOS.filter((p) => p.modulo === modulo).map((p) => p.id);
    const allSelected = moduloPerms.every((p) => selectedPermisos.includes(p));

    if (allSelected) {
      setSelectedPermisos(selectedPermisos.filter((p) => !moduloPerms.includes(p)));
    } else {
      const merged = Array.from(new Set([...selectedPermisos, ...moduloPerms]));
      setSelectedPermisos(merged);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!nombre.trim()) {
      setValidationError('Por favor ingrese el nombre del rol.');
      return;
    }

    if (selectedPermisos.length === 0) {
      setValidationError('Debe seleccionar al menos un permiso para este rol.');
      return;
    }

    const updatedRole: RolPersonalizado = {
      id: roleToEdit ? roleToEdit.id : `rol-${Date.now()}`,
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || 'Rol de acceso personalizado en el sistema.',
      colorTag,
      permisos: selectedPermisos,
      esSistema: roleToEdit?.esSistema || false,
    };

    onSaveRole(updatedRole);
    onClose();
  };

  const modulos = Array.from(new Set(ALL_PERMISOS.map((p) => p.modulo)));

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[92vh] space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <span className="material-symbols-outlined text-[24px]">verified_user</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-headline">
                {roleToEdit ? 'Editar Rol de Sistema & Permisos' : 'Crear Nuevo Rol de Sistema (RBAC)'}
              </h3>
              <p className="text-xs text-slate-500">
                Defina la denominación, alcance y matriz de autorizaciones para este perfil de usuario.
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
          {/* Nombre y Color Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">Nombre del Rol *</label>
              <input
                type="text"
                required
                disabled={roleToEdit?.esSistema}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Supervisor de Planta / Analista de Asistencia"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Color de Etiqueta</label>
              <select
                value={colorTag}
                onChange={(e) => setColorTag(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-600"
              >
                <option value="purple">💜 Morado (Admin)</option>
                <option value="blue">💙 Azul (RRHH)</option>
                <option value="emerald">💚 Verde (Supervisor)</option>
                <option value="amber">💛 Ámbar (Colaborador)</option>
                <option value="rose">❤️ Rojo (Auditor)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Descripción del Rol</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describa el alcance de funciones de este perfil de usuario..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-600"
            />
          </div>

          {/* Matriz de Permisos por Módulo */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-slate-800 font-extrabold uppercase text-[11px] tracking-wider">
                Matriz Granular de Permisos ({selectedPermisos.length} seleccionados)
              </label>
            </div>

            <div className="space-y-3">
              {modulos.map((mod) => {
                const permsInMod = ALL_PERMISOS.filter((p) => p.modulo === mod);
                const allModSelected = permsInMod.every((p) => selectedPermisos.includes(p.id));

                return (
                  <div key={mod} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-[16px]">verified</span>
                        {mod}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectAllInModulo(mod)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        {allModSelected ? 'Desmarcar Módulo' : 'Marcar Todo el Módulo'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {permsInMod.map((perm) => {
                        const isChecked = selectedPermisos.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className={`p-2 rounded-lg border transition-all flex items-start gap-2.5 cursor-pointer ${
                              isChecked
                                ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermiso(perm.id)}
                              className="mt-0.5 rounded text-blue-600"
                            />
                            <div>
                              <p className="font-bold leading-tight">{perm.nombre}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{perm.descripcion}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
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
              {roleToEdit ? 'Guardar Rol' : 'Crear Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
