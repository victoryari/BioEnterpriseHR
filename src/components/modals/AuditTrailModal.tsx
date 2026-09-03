import React from 'react';
import { MarcacionAsistencia } from '../../types';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  punch: MarcacionAsistencia | null;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  punch,
}) => {
  if (!isOpen || !punch) return null;

  const logs = punch.historialAuditoria || [];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <span className="material-symbols-outlined text-[24px]">history_edu</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-headline">
                Bitácora de Auditoría e Historial de Cambios
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

        {/* Resumen del Registro Actual */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
          <div>
            <span className="text-slate-500 font-medium">Marcación Actual:</span>
            <p className="font-bold text-slate-900 mt-0.5">
              {punch.fecha} &bull; <span className="font-mono text-blue-700">{punch.hora}</span> &bull; {punch.tipo}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            {punch.metodoVerificacion || 'Manual RRHH'}
          </span>
        </div>

        {/* Línea de Tiempo de Auditoría */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {logs.length > 0 ? (
            logs.map((item, idx) => {
              const isCreation = item.accion === 'CREACION_MANUAL';
              const isDeletion = item.accion === 'ANULACION';

              return (
                <div
                  key={item.id || idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2 relative"
                >
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          isCreation
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDeletion
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {item.accion.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-slate-800">{item.usuarioResponsable}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.fechaHoraCambio}
                    </span>
                  </div>

                  {/* Comparación de Valores Anteriores y Nuevos */}
                  {item.valoresAnteriores && item.valoresNuevos && (
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
                      <div>
                        <span className="text-[9px] uppercase font-sans text-rose-500 font-bold block">Antes</span>
                        <p className="text-slate-600">
                          {item.valoresAnteriores.fecha} {item.valoresAnteriores.hora} ({item.valoresAnteriores.tipo})
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-sans text-emerald-600 font-bold block">Después</span>
                        <p className="text-slate-900 font-bold">
                          {item.valoresNuevos.fecha} {item.valoresNuevos.hora} ({item.valoresNuevos.tipo})
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sustento Justificado */}
                  <div className="text-xs pt-1 border-t border-slate-100 flex items-start gap-1.5 text-slate-700">
                    <span className="material-symbols-outlined text-[15px] text-purple-600 shrink-0 mt-0.5">
                      format_quote
                    </span>
                    <p className="italic text-[11px] font-medium text-slate-600">
                      &ldquo;{item.motivoSustento}&rdquo;
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-slate-400 space-y-1">
              <span className="material-symbols-outlined text-[32px] text-slate-300">verified_user</span>
              <p className="text-xs font-medium">Marcación limpia sin modificaciones posteriores.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs"
          >
            Cerrar Bitácora
          </button>
        </div>
      </div>
    </div>
  );
};
