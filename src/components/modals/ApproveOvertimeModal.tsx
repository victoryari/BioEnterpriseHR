import React, { useState, useEffect } from 'react';
import { SolicitudHoraExtra } from '../../types';

interface ApproveOvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  overtimeItem: SolicitudHoraExtra | null;
  onProcessOvertime: (
    id: string,
    action: 'Aprobado' | 'Rechazado' | 'Compensado',
    minutosAprobados: number,
    tipoHe: '25%' | '35%' | '100%' | 'Mixto',
    motivoRechazo?: string
  ) => void;
}

export const ApproveOvertimeModal: React.FC<ApproveOvertimeModalProps> = ({
  isOpen,
  onClose,
  overtimeItem,
  onProcessOvertime,
}) => {
  const [action, setAction] = useState<'Aprobado' | 'Rechazado' | 'Compensado'>('Aprobado');
  const [minutosAprobados, setMinutosAprobados] = useState<number>(60);
  const [tipoHe, setTipoHe] = useState<'25%' | '35%' | '100%' | 'Mixto'>('25%');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && overtimeItem) {
      setValidationError(null);
      setAction(overtimeItem.estado === 'Rechazado' ? 'Rechazado' : overtimeItem.estado === 'Compensado' ? 'Compensado' : 'Aprobado');
      setMinutosAprobados(overtimeItem.minutosAprobados || overtimeItem.minutosDetectados || 60);
      setTipoHe(overtimeItem.tipoHe || '25%');
      setMotivoRechazo(overtimeItem.motivoRechazo || '');
    }
  }, [isOpen, overtimeItem]);

  if (!isOpen || !overtimeItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (action === 'Rechazado' && !motivoRechazo.trim()) {
      setValidationError('Por favor ingrese el motivo del rechazo para fines de auditoría.');
      return;
    }

    if (action === 'Aprobado' && (isNaN(minutosAprobados) || minutosAprobados <= 0)) {
      setValidationError('Ingrese una cantidad válida de minutos aprobados.');
      return;
    }

    onProcessOvertime(
      overtimeItem.id,
      action,
      action === 'Aprobado' || action === 'Compensado' ? minutosAprobados : 0,
      tipoHe,
      action === 'Rechazado' ? motivoRechazo.trim() : undefined
    );
    onClose();
  };

  const horas = Math.floor(overtimeItem.minutosDetectados / 60);
  const mins = overtimeItem.minutosDetectados % 60;
  const tiempoDetectadoTexto = `${horas > 0 ? `${horas}h ` : ''}${mins}min`;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[24px]">schedule</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-headline">
                Evaluación de Horas Extras (Overtime)
              </h3>
              <p className="text-xs text-slate-500">
                {overtimeItem.nombreEmpleado} &bull; {overtimeItem.fecha}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Resumen Detectado */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Salida Programada:</span>
            <span className="font-mono font-bold text-slate-800">{overtimeItem.horaSalidaProgramada}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Salida Marcada en Biométrico:</span>
            <span className="font-mono font-bold text-slate-800">{overtimeItem.horaSalidaMarcada}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-1.5">
            <span className="font-bold text-slate-700">Tiempo Excedente Detectado:</span>
            <span className="font-mono font-extrabold text-blue-700">{tiempoDetectadoTexto} ({overtimeItem.minutosDetectados} min)</span>
          </div>
        </div>

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Resolución de Jefatura / RRHH *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAction('Aprobado')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  action === 'Aprobado'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
                <span>🟢 Aprobar Pago</span>
              </button>

              <button
                type="button"
                onClick={() => setAction('Rechazado')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  action === 'Rechazado'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-rose-600">cancel</span>
                <span>🔴 Rechazar</span>
              </button>

              <button
                type="button"
                onClick={() => setAction('Compensado')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  action === 'Compensado'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-blue-600">event_repeat</span>
                <span>🔄 Canje Descanso</span>
              </button>
            </div>
          </div>

          {(action === 'Aprobado' || action === 'Compensado') && (
            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Minutos Aprobados *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={minutosAprobados}
                    onChange={(e) => setMinutosAprobados(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                  <span className="text-[10px] text-slate-400">Pactados con el trabajador</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sobretasa Legal (D.L. 728)</label>
                  <select
                    value={tipoHe}
                    onChange={(e) => setTipoHe(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600"
                  >
                    <option value="25%">25% (Primeras 2 horas)</option>
                    <option value="35%">35% (3ra hora en adelante)</option>
                    <option value="100%">100% (Feriado / Domingo)</option>
                    <option value="Mixto">Mixto (25% + 35%)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {action === 'Rechazado' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Motivo / Sustento de Rechazo *</label>
              <textarea
                rows={3}
                required
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Ej. Permanencia sin autorización previa de la jefatura de área / Atención de asuntos personales."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-600"
              ></textarea>
            </div>
          )}

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
              Confirmar Resolución
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
