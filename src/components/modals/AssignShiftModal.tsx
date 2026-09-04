import React, { useState } from 'react';
import { Turno, Empleado, AsignacionTurno, Sede, Departamento } from '../../types';

interface AssignShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Turno[];
  employees: Empleado[];
  sedes?: Sede[];
  departamentos?: Departamento[];
  onAssign: (newAssignments: AsignacionTurno[]) => void;
}

export const AssignShiftModal: React.FC<AssignShiftModalProps> = ({
  isOpen,
  onClose,
  shifts,
  employees,
  sedes,
  departamentos,
  onAssign,
}) => {
  const [selectedShiftId, setSelectedShiftId] = useState(shifts[0]?.id || '');
  const [assignmentMode, setAssignmentMode] = useState<'individual' | 'departamento' | 'sede'>('individual');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || '');
  const [selectedDept, setSelectedDept] = useState<string>(departamentos?.[0]?.nombre || 'Operaciones');
  const [selectedSede, setSelectedSede] = useState<string>(sedes?.[0]?.nombre || '');
  const [fechaInicio, setFechaInicio] = useState(() => new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (sedes && sedes.length > 0 && (!selectedSede || !sedes.some((s) => s.nombre === selectedSede))) {
        setSelectedSede(sedes[0].nombre);
      }
      if (departamentos && departamentos.length > 0 && (!selectedDept || !departamentos.some((d) => d.nombre === selectedDept))) {
        setSelectedDept(departamentos[0].nombre);
      }
    }
  }, [isOpen, sedes, departamentos]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftId) return;

    let targetEmployeeIds: string[] = [];

    if (assignmentMode === 'individual') {
      targetEmployeeIds = [selectedEmployeeId];
    } else if (assignmentMode === 'departamento') {
      targetEmployeeIds = employees
        .filter((emp) => emp.departamento === selectedDept && emp.estado === 'Activo')
        .map((emp) => emp.id);
    } else if (assignmentMode === 'sede') {
      targetEmployeeIds = employees
        .filter((emp) => emp.sede === selectedSede && emp.estado === 'Activo')
        .map((emp) => emp.id);
    }

    if (targetEmployeeIds.length === 0) {
      alert('No se encontraron colaboradores activos en la selección.');
      return;
    }

    const newAssignments: AsignacionTurno[] = targetEmployeeIds.map((empId) => ({
      id: `asig-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      empleadoId: empId,
      turnoId: selectedShiftId,
      fechaInicio,
      fechaFin: fechaFin || undefined,
    }));

    onAssign(newAssignments);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">assignment_ind</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">
                Asignar Turno al Personal
              </h3>
              <p className="text-xs text-slate-500">
                Programa turnos por colaborador, departamento o sede.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Turno a Programar *</label>
            <select
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium outline-none focus:border-blue-600 focus:bg-white"
            >
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.tipo})
                </option>
              ))}
            </select>
          </div>

          {/* Modalidad de Asignación */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">Alcance de la Asignación</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'individual', label: 'Individual' },
                { id: 'departamento', label: 'Por Área' },
                { id: 'sede', label: 'Por Sede' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setAssignmentMode(m.id as any)}
                  className={`py-2 px-3 rounded-xl font-semibold text-xs border transition-all ${
                    assignmentMode === m.id
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selección según modo */}
          {assignmentMode === 'individual' && (
            <div>
              <label className="block font-bold text-slate-800 mb-1">Colaborador *</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} ({e.tipoDocumento || 'DNI'}: {e.numeroDocumento || e.pin}) - {e.cargo}
                  </option>
                ))}
              </select>
            </div>
          )}

          {assignmentMode === 'departamento' && (
            <div>
              <label className="block font-bold text-slate-800 mb-1">Departamento / Área *</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
              >
                {(departamentos && departamentos.length > 0
                  ? departamentos.map((d) => d.nombre)
                  : Array.from(new Set(employees.map((e) => e.departamento)))
                ).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                Se aplicará a todos los colaboradores activos de esta área.
              </p>
            </div>
          )}

          {assignmentMode === 'sede' && (
            <div>
              <label className="block font-bold text-slate-800 mb-1">Sede de Trabajo *</label>
              <select
                value={selectedSede}
                onChange={(e) => setSelectedSede(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
              >
                {(sedes && sedes.length > 0
                  ? sedes.map((s) => s.nombre)
                  : Array.from(new Set(employees.map((e) => e.sede)))
                ).map((sName) => (
                  <option key={sName} value={sName}>
                    {sName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Fecha de Inicio *</label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Fecha de Fin (Opcional)</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              Asignar Turno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
