import React, { useState, useEffect } from 'react';
import { Dispositivo } from '../../types';
import { apiService } from '../../services/apiService';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: Dispositivo[];
  onSyncComplete: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  devices,
  onSyncComplete,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSyncing(false);
      setProgress(0);
      setLogs([]);
      setIsCompleted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartSync = async () => {
    setSyncing(true);
    setProgress(15);
    const now = () => new Date().toLocaleTimeString('es-PE', { hour12: false });
    const devCount = devices.length > 0 ? devices.length : 1;

    setCurrentStep('Conectando vía Socket UDP a los terminales biométricos...');
    setLogs([`[${now()}] Iniciando protocolo de enlace directo con ${devCount} terminal(es)...`]);

    try {
      setProgress(45);
      setCurrentStep('Descargando marcaciones de asistencia y contando usuarios enrolados...');
      const res = await apiService.syncAllDevices();

      setProgress(85);
      setCurrentStep('Procesando marcaciones en MySQL y actualizando tarjetas de hardware...');
      setLogs((prev) => [
        ...prev,
        `[${now()}] Marcaciones procesadas: ${res.total_logs_synced || 0} registros nuevos.`,
        `[${now()}] ${res.message || 'Sincronización de red completada con éxito.'}`,
      ]);

      setProgress(100);
      setCurrentStep('¡Sincronización de red completada con éxito!');
      setSyncing(false);
      setIsCompleted(true);
      onSyncComplete();
    } catch (err: any) {
      setProgress(100);
      setCurrentStep('Finalizado con observaciones');
      setLogs((prev) => [
        ...prev,
        `[${now()}] Notificación: ${err.message || 'Sincronización finalizada'}`,
      ]);
      setSyncing(false);
      setIsCompleted(true);
      onSyncComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">sync</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">
                Sincronización de Plantillas Biométricas
              </h3>
              <p className="text-xs text-slate-500">
                Propagación de credenciales, huellas, rostros y logs de marcación en vivo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="py-5 space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1.5">
              <span>{currentStep || 'Listo para sincronizar'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Connected Devices Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Terminales en la red ({devices.length})
            </h4>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {devices.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        d.estado === 'online'
                          ? 'bg-emerald-500'
                          : d.estado === 'error'
                          ? 'bg-rose-500'
                          : 'bg-slate-400'
                      }`}
                    ></span>
                    <span className="font-semibold text-slate-800 truncate">{d.nombre}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">{d.ip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Telemetry Log */}
          {logs.length > 0 && (
            <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] h-28 overflow-y-auto space-y-1 border border-slate-800">
              {logs.map((log, i) => (
                <div key={i} className="leading-tight text-emerald-400">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            {isCompleted ? 'Cerrar' : 'Cancelar'}
          </button>
          {!isCompleted ? (
            <button
              onClick={handleStartSync}
              disabled={syncing}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                  Sincronizando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                  Iniciar Sincronización
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Listo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
