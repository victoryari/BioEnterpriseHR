import React, { useState } from 'react';
import { Empleado, Dispositivo, MarcacionAsistencia } from '../../types';

interface ManualPunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Empleado[];
  devices: Dispositivo[];
  onAddPunch: (punch: MarcacionAsistencia) => void;
}

export const ManualPunchModal: React.FC<ManualPunchModalProps> = ({
  isOpen,
  onClose,
  employees,
  devices,
  onAddPunch,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    employees[0]?.id || ''
  );
  const [tipo, setTipo] = useState<'Entrada' | 'Salida'>('Entrada');
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [hora, setHora] = useState<string>('08:30');
  const [dispositivoId, setDispositivoId] = useState<string>(
    devices[0]?.id || ''
  );
  const [motivo, setMotivo] = useState<string>(
    'Olvido de marcación (Autorizado por Jefatura)'
  );
  const [observacion, setObservacion] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      if (employees.length > 0) setSelectedEmployeeId(employees[0].id);
      if (devices.length > 0) setDispositivoId(devices[0].id);
      setTipo('Entrada');
      setFecha(new Date().toISOString().split('T')[0]);
      setHora('08:30');
      setMotivo('Olvido de marcación (Autorizado por Jefatura)');
      setObservacion('');
    }
  }, [isOpen, employees, devices]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === selectedEmployeeId);
    if (!emp) return;

    const dev = devices.find((x) => x.id === dispositivoId) || devices[0];

    const newPunch: MarcacionAsistencia = {
      id: `manual-${Date.now()}`,
      hora: `${hora}:00`,
      fecha,
      empleadoId: emp.id,
      nombreEmpleado: emp.nombre,
      pin: emp.pin,
      numeroTarjeta: emp.numeroTarjeta,
      dispositivoId: dev?.id || '',
      nombreDispositivo: dev ? `${dev.nombre} (Regularizado)` : 'Sede Principal (Manual)',
      tipo,
      estado: 'Regularizado por RRHH',
      metodoVerificacion: 'Manual RRHH',
      motivoRegularizacion: observacion.trim()
        ? `${motivo} — ${observacion.trim()}`
        : motivo,
      regularizadoPor: 'Recursos Humanos',
    };

    onAddPunch(newPunch);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[24px]">edit_calendar</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">
                Regularización Manual de Asistencia
              </h3>
              <p className="text-xs text-slate-500">
                Registro extemporáneo de entrada o salida por olvido o justificación laboral.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 py-4 text-xs">
          {/* Selector de Colaborador */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Colaborador *
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium focus:border-blue-600 focus:bg-white outline-none cursor-pointer"
              required
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} — {emp.cargo} (DNI: {emp.numeroDocumento || emp.pin})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Marcación (Entrada o Salida) */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Tipo de Evento *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipo('Entrada')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  tipo === 'Entrada'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Entrada (Ingreso)
              </button>
              <button
                type="button"
                onClick={() => setTipo('Salida')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  tipo === 'Salida'
                    ? 'bg-amber-50 border-amber-600 text-amber-800 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Salida (Egreso)
              </button>
            </div>
          </div>

          {/* Fecha y Hora Exacta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Fecha del Evento *
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:border-blue-600 focus:bg-white outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Hora Exacta (Hora Perú) *
              </label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:border-blue-600 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Terminal / Sede de Referencia */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Terminal o Sede Asignada
            </label>
            <select
              value={dispositivoId}
              onChange={(e) => setDispositivoId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:border-blue-600 focus:bg-white outline-none cursor-pointer"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre} ({d.ubicacion})
                </option>
              ))}
            </select>
          </div>

          {/* Motivo de Regularización (Auditoría SUNAFIL) */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Motivo de Justificación Legal (SUNAFIL) *
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:border-blue-600 focus:bg-white outline-none cursor-pointer"
            >
              <option value="Olvido de marcación (Autorizado por Jefatura)">
                Olvido de marcación (Autorizado por Jefatura)
              </option>
              <option value="Falla técnica de lector biométrico / fluido eléctrico">
                Falla técnica de lector biométrico / fluido eléctrico
              </option>
              <option value="Comisión de servicios externa / Salida laboral">
                Comisión de servicios externa / Salida laboral
              </option>
              <option value="Trabajo de campo / Inspección fuera de sede">
                Trabajo de campo / Inspección fuera de sede
              </option>
              <option value="Atención médica de urgencia / EsSalud">
                Atención médica de urgencia / EsSalud
              </option>
              <option value="Otro motivo justificado">Otro motivo justificado</option>
            </select>
          </div>

          {/* Observación Adicional */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Detalle u Observación Interna
            </label>
            <textarea
              rows={2}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej. Memo interno Nº 042-2026 firmado por Jefatura de Área."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:bg-white outline-none resize-none"
            />
          </div>

          {/* Aviso Legal de Auditoría */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0">
              policy
            </span>
            <p>
              <strong>Registro de Auditoría Laboral:</strong> Esta marcación quedará registrada con el método <em>"Manual RRHH"</em> y el usuario responsable para efectos de inspección según D.S. Nº 004-2006-TR.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              Regularizar Marcación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
