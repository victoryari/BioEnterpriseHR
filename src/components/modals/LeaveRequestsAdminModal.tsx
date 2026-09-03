import React, { useState } from 'react';
import { SolicitudPermiso } from '../../types';

interface LeaveRequestsAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: SolicitudPermiso[];
  onUpdateStatus: (id: string, newStatus: 'Aprobado' | 'Rechazado') => void;
  onDeleteRequest: (id: string) => void;
}

export const LeaveRequestsAdminModal: React.FC<LeaveRequestsAdminModalProps> = ({
  isOpen,
  onClose,
  requests,
  onUpdateStatus,
  onDeleteRequest,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = requests.filter((r) => {
    const matchesStatus = filterStatus === 'all' || r.estado === filterStatus;
    const matchesSearch =
      r.nombreEmpleado.toLowerCase().includes(search.toLowerCase()) ||
      r.motivo.toLowerCase().includes(search.toLowerCase()) ||
      r.tipo.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.estado === 'Pendiente').length;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">approval</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-headline">
                  Bandeja de Aprobación de Permisos y Vacaciones
                </h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                    {pendingCount} pendientes
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Atiende solicitudes de descanso médico, vacaciones y permisos laborales.
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por colaborador o motivo..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(['all', 'Pendiente', 'Aprobado', 'Rechazado'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'Todas' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Request List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No se encontraron solicitudes registradas con los filtros aplicados.
            </div>
          ) : (
            filtered.map((req) => {
              const statusStyles = {
                Aprobado: {
                  badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                  icon: 'check_circle',
                },
                Pendiente: {
                  badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
                  icon: 'pending',
                },
                Rechazado: {
                  badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
                  icon: 'cancel',
                },
              }[req.estado];

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{req.nombreEmpleado}</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100">
                          {req.tipo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Período: {req.fechaInicio} al {req.fechaFin} • Solicitado el {req.fechaSolicitud}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles.badge}`}
                      >
                        <span className="material-symbols-outlined text-[13px]">{statusStyles.icon}</span>
                        {req.estado}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                    {req.motivo}
                  </p>

                  {req.nombreDocumento && (
                    <div className="flex items-center gap-1.5 text-[11px] text-blue-600">
                      <span className="material-symbols-outlined text-[15px]">description</span>
                      <span className="underline cursor-pointer">Sustento: {req.nombreDocumento}</span>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400 font-mono">ID: {req.id}</span>

                    <div className="flex items-center gap-1.5">
                      {req.estado === 'Pendiente' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(req.id, 'Aprobado')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-colors"
                          >
                            <span className="material-symbols-outlined text-[15px]">check</span>
                            Aprobar
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(req.id, 'Rechazado')}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-colors"
                          >
                            <span className="material-symbols-outlined text-[15px]">close</span>
                            Rechazar
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => onDeleteRequest(req.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Eliminar solicitud"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>{filtered.length} solicitudes mostradas</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
