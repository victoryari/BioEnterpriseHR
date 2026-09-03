import React, { useState, useEffect } from 'react';
import { MarcacionAsistencia, Empleado, LogAuditoriaMarcacion } from '../../types';

interface EditPunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  punch: MarcacionAsistencia | null;
  employees: Empleado[];
  onSavePunch: (updatedPunch: MarcacionAsistencia) => void;
}

export const EditPunchModal: React.FC<EditPunchModalProps> = ({
  isOpen,
  onClose,
  punch,
  employees,
  onSavePunch,
}) => {
  const [fecha, setFecha] = useState<string>('');
  const [hora, setHora] = useState<string>('');
  const [tipo, setTipo] = useState<'Entrada' | 'Salida'>('Entrada');
  const [metodoVerificacion, setMetodoVerificacion] = useState<
    'Huella' | 'Tarjeta RFID' | 'PIN' | 'Sistema' | 'Rostro' | 'Manual RRHH'
  >('Manual RRHH');
  const [motivo, setMotivo] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && punch) {
      setValidationError(null);
      setFecha(punch.fecha || new Date().toISOString().split('T')[0]);
      const timePart = (punch.hora || '08:30').substring(0, 5);
      setHora(timePart);
      setTipo(punch.tipo === 'Salida' ? 'Salida' : 'Entrada');
      setMetodoVerificacion(punch.metodoVerificacion || 'Manual RRHH');
      setMotivo(punch.motivoRegularizacion || 'Corrección justificada por RRHH');
    }
  }, [isOpen, punch]);

  if (!isOpen || !punch) return null;

  const isBiometricOriginal =
    punch.metodoVerificacion === 'Huella' ||
    punch.metodoVerificacion === 'Rostro' ||
    punch.metodoVerificacion === 'Tarjeta RFID';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!fecha || !hora) {
      setValidationError('Por favor ingrese una fecha y hora válidas.');
      return;
    }

    if (!motivo || motivo.trim().length < 5) {
      setValidationError('Debe ingresar un sustento/motivo justificado de al menos 5 caracteres.');
      return;
    }

    const formattedHora = hora.length === 5 ? `${hora}:00` : hora;

    const newAuditLog: LogAuditoriaMarcacion = {
      id: `audit-${Date.now()}`,
      marcacionId: punch.id,
      fechaHoraCambio: new Date().toISOString().replace('T', ' ').substring(0, 19),
      usuarioResponsable: 'admin@carmelita.pe (Gestor RRHH)',
      accion: 'EDICION',
      valoresAnteriores: {
        fecha: punch.fecha,
        hora: punch.hora,
        tipo: punch.tipo,
        metodo: punch.metodoVerificacion || 'Huella',
        estado: punch.estado,
      },
      valoresNuevos: {
        fecha,
        hora: formattedHora,
        tipo,
        metodo: metodoVerificacion,
        estado: 'Regularizado por RRHH',
      },
      motivoSustento: motivo.trim(),
    };

    const updatedPunch: MarcacionAsistencia = {
      ...punch,
      fecha,
      hora: formattedHora,
      tipo,
      estado: 'Regularizado por RRHH',
      metodoVerificacion,
      motivoRegularizacion: motivo.trim(),
      regularizadoPor: 'Recursos Humanos',
      historialAuditoria: [newAuditLog, ...(punch.historialAuditoria || [])],
    };

    onSavePunch(updatedPunch);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">edit_square</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-headline">
                Editar Marcación de Asistencia
              </h3>
              <p className="text-xs text-slate-500">
                {punch.nombreEmpleado} &bull; ID: {punch.id}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {isBiometricOriginal && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">
              shield_lock
            </span>
            <div>
              <strong className="font-bold block text-amber-900 mb-0.5">Protección de Trama Biométrica (SUNAFIL)</strong>
              La marca física original capturada por el reloj marcador permanecerá inalterada. Esta modificación quedará asentada como una <strong>Regularización de Ajuste por RRHH</strong> en la bitácora de auditoría.
            </div>
          </div>
        )}

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Fila 1: Fecha y Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Fecha de Marcación *</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 font-bold outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Hora Exacta (HH:mm) *</label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900 font-bold outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Fila 2: Tipo de Evento */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Tipo de Evento *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipo('Entrada')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  tipo === 'Entrada'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Entrada</span>
              </button>

              <button
                type="button"
                onClick={() => setTipo('Salida')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  tipo === 'Salida'
                    ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Salida</span>
              </button>
            </div>
          </div>

          {/* Método de Verificación */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Método de Marcado *</label>
            <select
              value={metodoVerificacion}
              onChange={(e) => setMetodoVerificacion(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="Manual RRHH">Manual RRHH (Regularizado)</option>
              <option value="Huella">Huella Dactilar</option>
              <option value="Rostro">Reconocimiento Facial</option>
              <option value="Tarjeta RFID">Tarjeta RFID</option>
              <option value="PIN">Código PIN</option>
            </select>
          </div>

          {/* Motivo de Corrección */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Motivo / Sustento del Cambio *</label>
            <textarea
              rows={2}
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Corrección por error de digitación en la hora de marcado manual."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-600"
            ></textarea>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
