import React, { useState, useRef } from 'react';
import { SolicitudPermiso, Empleado } from '../../types';

interface SelfServiceViewProps {
  requests: SolicitudPermiso[];
  onSubmitRequest: (req: SolicitudPermiso) => void;
  currentEmployee?: Empleado;
  employees?: Empleado[];
  onSelectEmployee?: (emp: Empleado) => void;
  userRole?: 'admin' | 'employee';
}

export const SelfServiceView: React.FC<SelfServiceViewProps> = ({
  requests,
  onSubmitRequest,
  currentEmployee,
  employees = [],
  onSelectEmployee,
  userRole = 'employee',
}) => {
  const [requestType, setRequestType] = useState<SolicitudPermiso['tipo']>('Vacaciones');
  const [startDate, setStartDate] = useState('2026-11-18');
  const [endDate, setEndDate] = useState('2026-11-22');
  const [reason, setReason] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0].name);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAttachedFile(e.dataTransfer.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const newReq: SolicitudPermiso = {
      id: `req-${Date.now()}`,
      tipo: requestType,
      fechaInicio: startDate,
      fechaFin: endDate,
      motivo: reason,
      nombreDocumento: attachedFile || undefined,
      estado: 'Pendiente',
      fechaSolicitud: new Date().toISOString().split('T')[0],
      nombreEmpleado: currentEmployee?.nombre || 'Colaborador Registrado',
    };

    onSubmitRequest(newReq);
    setReason('');
    setAttachedFile(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">
            Portal de Autoservicio del Colaborador
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consulta tu saldo de vacaciones, historial de asistencias y gestiona tus permisos en Perú.
          </p>
        </div>
        {employees.length > 0 && onSelectEmployee && userRole === 'admin' ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <label className="font-bold text-slate-500 hidden sm:inline">Perfil:</label>
            <select
              value={currentEmployee?.id || ''}
              onChange={(e) => {
                const found = employees.find((emp) => emp.id === e.target.value);
                if (found) onSelectEmployee(found);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-blue-600 focus:bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} — {emp.cargo} ({emp.sede})
                </option>
              ))}
            </select>
          </div>
        ) : currentEmployee ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-800">{currentEmployee.nombre}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{currentEmployee.cargo}</span>
            <span className="text-slate-400">•</span>
            <span className="text-blue-600 font-medium">{currentEmployee.sede}</span>
          </div>
        ) : null}
      </div>

      {/* Top Balances Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Vacaciones Disponibles
              </span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                Período 2026
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">
              18 <span className="text-base font-normal text-slate-500">Días útiles</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">event_available</span>
            <span>Próximo corte legal: 15/03/2027</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Índice de Puntualidad
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                Excelente
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">98.2%</div>
          </div>
          <div className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>
            <span>Sin tardanzas acumuladas en el mes</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Sueldo Base Mensual
              </span>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                Moneda Oficial (PEN)
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">
              S/ {(currentEmployee?.sueldoBase || 3500).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-slate-400">payments</span>
            <span>Pago quincenal / mensual puntual</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Request Form + History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Request Form */}
        <div className="lg:col-span-6 xl:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold font-headline text-slate-900">
              Registrar Nueva Solicitud de Permiso o Vacaciones
            </h2>
            <p className="text-xs text-slate-500">
              Completa el formulario y adjunta tu certificado de EsSalud/notarial de sustento.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Tipo de Solicitud *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Vacaciones', 'Descanso Médico', 'Permiso', 'Compensación'] as const).map(
                  (t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setRequestType(t)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                        requestType === t
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Fecha de Inicio *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Fecha de Fin *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Motivo / Justificación Detallada *
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe el motivo de la ausencia o detalles de tu descanso médico..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:border-blue-600 focus:bg-white outline-none transition-all resize-none"
              ></textarea>
            </div>

            {/* Document Upload Simulation */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Adjuntar Documento Sustentatorio (Opcional)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-blue-600 bg-blue-50/40'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                }`}
              >
                {attachedFile ? (
                  <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                    <span>{attachedFile}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttachedFile(null);
                      }}
                      className="p-1 hover:text-rose-600"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="material-symbols-outlined text-[24px] text-slate-400">
                      upload_file
                    </span>
                    <p className="text-xs text-slate-700 font-semibold">
                      Arrastra tu certificado médico aquí o <span className="text-blue-600 underline">explora</span>
                    </p>
                    <p className="text-[10px] text-slate-400">PDF, JPG o PNG hasta 10 MB</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Enviar Solicitud a RRHH
            </button>
          </form>
        </div>

        {/* Right Column: Recent Requests History */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold font-headline text-slate-900">
                Mis Solicitudes Recientes
              </h2>
              <span className="text-xs text-slate-500">{requests.length} registradas</span>
            </div>

            <div className="space-y-3">
              {requests.map((req) => {
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
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{req.tipo}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {req.fechaInicio} al {req.fechaFin}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles.badge}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {statusStyles.icon}
                        </span>
                        {req.estado}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{req.motivo}</p>

                    {req.nombreDocumento && (
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-600 pt-1">
                        <span className="material-symbols-outlined text-[14px]">attach_file</span>
                        <span className="truncate">{req.nombreDocumento}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>Enviado el {req.fechaSolicitud}</span>
                      <span>ID: {req.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
