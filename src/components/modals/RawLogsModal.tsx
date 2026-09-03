import React, { useState } from 'react';
import { MarcacionAsistencia } from '../../types';

interface RawLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: MarcacionAsistencia[];
}

export const RawLogsModal: React.FC<RawLogsModalProps> = ({ isOpen, onClose, logs }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesQuery =
      log.nombreEmpleado.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.pin.includes(filterQuery) ||
      log.nombreDispositivo.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesDevice = deviceFilter === 'all' || log.dispositivoId === deviceFilter;
    return matchesQuery && matchesDevice;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">history</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-headline">
                  Registro Completo de Marcaciones Biométricas
                </h3>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Hora Perú (UTC-5)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Telemetría de lectores biométricos y eventos de paso en tiempo real.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 py-3 border-b border-slate-100">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Buscar por colaborador, PIN o terminal..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
          >
            <option value="all">Todos los Terminales</option>
            {Array.from(
              new Map(logs.map((l) => [l.dispositivoId, l.nombreDispositivo])).entries()
            ).map(([devId, devName]) => (
              <option key={devId} value={devId}>
                {devName}
              </option>
            ))}
          </select>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-y-auto py-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider sticky top-0 border-b border-slate-100">
              <tr>
                <th className="p-2.5">Hora (PE)</th>
                <th className="p-2.5">Colaborador</th>
                <th className="p-2.5">Método de Marcado</th>
                <th className="p-2.5">Credencial / Código</th>
                <th className="p-2.5">Terminal</th>
                <th className="p-2.5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    log.esError ? 'bg-rose-50/40' : ''
                  }`}
                >
                  <td className="p-2.5 font-mono text-[11px] text-slate-900">{log.hora}</td>
                  <td className="p-2.5 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          log.esError
                            ? 'text-rose-600'
                            : log.estado === 'Sincronización'
                            ? 'text-slate-500'
                            : 'text-blue-600'
                        }`}
                      >
                        {log.esError
                          ? 'warning'
                          : log.estado === 'Sincronización'
                          ? 'sync'
                          : 'login'}
                      </span>
                      <span>{log.nombreEmpleado}</span>
                    </div>
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        log.metodoVerificacion === 'Manual RRHH'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : log.metodoVerificacion === 'Tarjeta RFID'
                          ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                          : log.metodoVerificacion === 'PIN'
                          ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                          : log.metodoVerificacion === 'Huella'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {log.metodoVerificacion === 'Manual RRHH'
                          ? 'edit_calendar'
                          : log.metodoVerificacion === 'Tarjeta RFID'
                          ? 'badge'
                          : log.metodoVerificacion === 'PIN'
                          ? 'dialpad'
                          : log.metodoVerificacion === 'Huella'
                          ? 'fingerprint'
                          : 'sync'}
                      </span>
                      {log.metodoVerificacion || 'Huella'}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-600">
                    {log.metodoVerificacion === 'Tarjeta RFID' && log.numeroTarjeta ? (
                      <span className="text-blue-600 font-semibold">T: {log.numeroTarjeta}</span>
                    ) : log.motivoRegularizacion ? (
                      <span className="text-purple-700 font-medium text-[10px] truncate max-w-[150px] inline-block" title={log.motivoRegularizacion}>
                        {log.motivoRegularizacion}
                      </span>
                    ) : (
                      <span>PIN: {log.pin}</span>
                    )}
                  </td>
                  <td className="p-2.5 text-slate-500 font-mono text-[11px]">{log.nombreDispositivo}</td>
                  <td className="p-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        log.estado === 'Regularizado por RRHH'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : log.esError
                          ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                          : log.estado === 'Sincronización'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}
                    >
                      {log.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>Mostrando {filteredLogs.length} marcaciones registradas</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
