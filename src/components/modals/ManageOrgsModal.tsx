import React, { useState } from 'react';
import { Sede, Departamento, Empleado } from '../../types';

interface ManageOrgsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sedes: Sede[];
  departamentos: Departamento[];
  employees: Empleado[];
  onSaveSede: (sede: Sede) => void;
  onDeleteSede: (id: string) => void;
  onSaveDepartamento: (departamento: Departamento) => void;
  onDeleteDepartamento: (id: string) => void;
}

export const ManageOrgsModal: React.FC<ManageOrgsModalProps> = ({
  isOpen,
  onClose,
  sedes,
  departamentos,
  employees,
  onSaveSede,
  onDeleteSede,
  onSaveDepartamento,
  onDeleteDepartamento,
}) => {
  const [activeTab, setActiveTab] = useState<'sedes' | 'departamentos'>('sedes');

  // Estado del formulario de Sede
  const [editingSede, setEditingSede] = useState<Sede | null>(null);
  const [isSedeFormOpen, setIsSedeFormOpen] = useState(false);
  const [sedeNombre, setSedeNombre] = useState('');
  const [sedeCiudad, setSedeCiudad] = useState('');
  const [sedeDireccion, setSedeDireccion] = useState('');

  // Estado del formulario de Departamento
  const [editingDept, setEditingDept] = useState<Departamento | null>(null);
  const [isDeptFormOpen, setIsDeptFormOpen] = useState(false);
  const [deptNombre, setDeptNombre] = useState('');
  const [deptDescripcion, setDeptDescripcion] = useState('');

  if (!isOpen) return null;

  // Manejo de Sedes
  const handleOpenAddSede = () => {
    setEditingSede(null);
    setSedeNombre('');
    setSedeCiudad('Lima');
    setSedeDireccion('');
    setIsSedeFormOpen(true);
  };

  const handleOpenEditSede = (s: Sede) => {
    setEditingSede(s);
    setSedeNombre(s.nombre);
    setSedeCiudad(s.ciudad);
    setSedeDireccion(s.direccion || '');
    setIsSedeFormOpen(true);
  };

  const handleSaveSedeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sedeNombre.trim() || !sedeCiudad.trim()) return;

    const data: Sede = {
      id: editingSede ? editingSede.id : `sed-${Date.now()}`,
      nombre: sedeNombre.trim(),
      ciudad: sedeCiudad.trim(),
      direccion: sedeDireccion.trim(),
      activo: true,
    };

    onSaveSede(data);
    setIsSedeFormOpen(false);
  };

  // Manejo de Departamentos
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptNombre('');
    setDeptDescripcion('');
    setIsDeptFormOpen(true);
  };

  const handleOpenEditDept = (d: Departamento) => {
    setEditingDept(d);
    setDeptNombre(d.nombre);
    setDeptDescripcion(d.descripcion || '');
    setIsDeptFormOpen(true);
  };

  const handleSaveDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptNombre.trim()) return;

    const data: Departamento = {
      id: editingDept ? editingDept.id : `dep-${Date.now()}`,
      nombre: deptNombre.trim(),
      descripcion: deptDescripcion.trim(),
      activo: true,
    };

    onSaveDepartamento(data);
    setIsDeptFormOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 max-h-[92vh]">
        {/* Cabecera Institucional */}
        <div className="bg-[#004A99] px-5 py-3.5 flex items-center justify-between text-white shadow-sm shrink-0 border-b border-blue-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-200">
              <span className="material-symbols-outlined text-[20px]">apartment</span>
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-white">
                Estructura Organizacional (Sedes y Áreas)
              </h2>
              <p className="text-[10px] text-blue-200 uppercase font-medium">
                Catálogo maestro de sedes operativas y departamentos en Perú
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-600 rounded-lg text-white/80 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tabs de Selección */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-4 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('sedes')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'sedes'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            Sedes y Sucursales ({sedes.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('departamentos')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'departamentos'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">domain</span>
            Departamentos y Áreas ({departamentos.length})
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {/* ========================================================================= */}
          {/* TAB 1: SEDES / SUCURSALES                                                 */}
          {/* ========================================================================= */}
          {activeTab === 'sedes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">
                  Sedes físicas donde labora el personal y están ubicados los terminales.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddSede}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_location</span>
                  Nueva Sede
                </button>
              </div>

              {/* Formulario Inline Sede */}
              {isSedeFormOpen && (
                <form
                  onSubmit={handleSaveSedeSubmit}
                  className="p-4 bg-white rounded-2xl border-2 border-blue-100 shadow-sm space-y-3 animate-in fade-in"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">
                        {editingSede ? 'edit' : 'add_circle'}
                      </span>
                      {editingSede ? 'Editar Sede' : 'Registrar Nueva Sede'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSedeFormOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nombre de la Sede *</label>
                      <input
                        type="text"
                        required
                        value={sedeNombre}
                        onChange={(e) => setSedeNombre(e.target.value)}
                        placeholder="Ej. Sede Callao Almacén Central"
                        className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ciudad (Perú) *</label>
                      <input
                        type="text"
                        required
                        value={sedeCiudad}
                        onChange={(e) => setSedeCiudad(e.target.value)}
                        placeholder="Ej. Lima, Callao, Piura, Arequipa"
                        className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Dirección Física</label>
                      <input
                        type="text"
                        value={sedeDireccion}
                        onChange={(e) => setSedeDireccion(e.target.value)}
                        placeholder="Av. Principal 123, Distrito..."
                        className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSedeFormOpen(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      {editingSede ? 'Actualizar Sede' : 'Guardar Sede'}
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de Sedes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sedes.map((s) => {
                  const empCount = employees.filter((e) => e.sede === s.nombre).length;
                  return (
                    <div
                      key={s.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                              <span className="material-symbols-outlined text-[18px]">store</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs">{s.nombre}</h4>
                              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.2 rounded-md">
                                {s.ciudad}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditSede(s)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Editar sede"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  confirm(
                                    `¿Seguro que deseas eliminar la sede "${s.nombre}"? (${empCount} colaboradores asignados)`
                                  )
                                ) {
                                  onDeleteSede(s.id);
                                }
                              }}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Eliminar sede"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>

                        {s.direccion && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                            <span className="material-symbols-outlined text-[13px] text-slate-400">
                              place
                            </span>
                            {s.direccion}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Personal Asignado:</span>
                        <span className="font-bold font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {empCount} colaboradores
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: DEPARTAMENTOS / ÁREAS                                              */}
          {/* ========================================================================= */}
          {activeTab === 'departamentos' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">
                  Áreas organizacionales de la empresa para reportes de nómina y asistencia.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddDept}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_business</span>
                  Nueva Área
                </button>
              </div>

              {/* Formulario Inline Departamento */}
              {isDeptFormOpen && (
                <form
                  onSubmit={handleSaveDeptSubmit}
                  className="p-4 bg-white rounded-2xl border-2 border-blue-100 shadow-sm space-y-3 animate-in fade-in"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">
                        {editingDept ? 'edit' : 'add_circle'}
                      </span>
                      {editingDept ? 'Editar Departamento' : 'Registrar Nuevo Departamento'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDeptFormOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nombre del Área / Departamento *</label>
                      <input
                        type="text"
                        required
                        value={deptNombre}
                        onChange={(e) => setDeptNombre(e.target.value)}
                        placeholder="Ej. Contabilidad y Finanzas, Logística..."
                        className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Descripción / Funciones</label>
                      <input
                        type="text"
                        value={deptDescripcion}
                        onChange={(e) => setDeptDescripcion(e.target.value)}
                        placeholder="Breve descripción del departamento..."
                        className="w-full h-8 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDeptFormOpen(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      {editingDept ? 'Actualizar Área' : 'Guardar Área'}
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de Departamentos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {departamentos.map((d) => {
                  const empCount = employees.filter((e) => e.departamento === d.nombre).length;
                  return (
                    <div
                      key={d.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                              <span className="material-symbols-outlined text-[18px]">group_work</span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-xs">{d.nombre}</h4>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditDept(d)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Editar departamento"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  confirm(
                                    `¿Seguro que deseas eliminar el departamento "${d.nombre}"? (${empCount} colaboradores asignados)`
                                  )
                                ) {
                                  onDeleteDepartamento(d.id);
                                }
                              }}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Eliminar departamento"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>

                        {d.descripcion && (
                          <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                            {d.descripcion}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Personal en esta Área:</span>
                        <span className="font-bold font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {empCount} colaboradores
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-slate-500">
            Total: <strong>{sedes.length}</strong> sedes y <strong>{departamentos.length}</strong>{' '}
            áreas registradas.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
