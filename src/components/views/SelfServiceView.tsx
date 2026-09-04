import React, { useState, useRef, useMemo } from 'react';
import { SolicitudPermiso, Empleado, MarcacionAsistencia } from '../../types';

interface SelfServiceViewProps {
  requests: SolicitudPermiso[];
  punchLogs?: MarcacionAsistencia[];
  onSubmitRequest: (req: SolicitudPermiso) => void;
  currentEmployee?: Empleado | null;
  employees?: Empleado[];
  onSelectEmployee?: (emp: Empleado) => void;
  userRole?: 'admin' | 'employee';
}

const getPunchStatusInfo = (p: MarcacionAsistencia) => {
  const isManual = p.metodoVerificacion === 'Manual RRHH' || p.estado === 'Regularizado por RRHH';
  if (p.estado === 'Anulado por RRHH') {
    return {
      label: 'Anulado por RRHH',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-300',
      isTardanza: false,
    };
  }

  // Parsear hora en minutos
  const [hStr, mStr] = (p.hora || '').split(':');
  const h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  const punchMinutes = h * 60 + m;

  // Horario estándar: Entrada 08:30 con tolerancia hasta 08:45 (525 min)
  if (p.tipo === 'Entrada') {
    if (punchMinutes > 8 * 60 + 45) {
      const delayMin = punchMinutes - (8 * 60 + 30);
      return {
        label: `Tardanza (+${delayMin} min)`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        isTardanza: true,
      };
    }
    return {
      label: isManual ? 'A Tiempo (Manual)' : 'A Tiempo',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isTardanza: false,
    };
  }

  if (p.tipo === 'Salida') {
    if (punchMinutes < 17 * 60 + 30) {
      return {
        label: 'Salida Anticipada',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        isTardanza: false,
      };
    }
    return {
      label: 'Salida Regular',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      isTardanza: false,
    };
  }

  return {
    label: p.estado || 'Escaneo Exitoso',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    isTardanza: false,
  };
};

export const SelfServiceView: React.FC<SelfServiceViewProps> = ({
  requests,
  punchLogs = [],
  onSubmitRequest,
  currentEmployee,
  employees = [],
  onSelectEmployee,
  userRole = 'employee',
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [activeTab, setActiveTab] = useState<'requests' | 'punches'>('requests');
  const [requestType, setRequestType] = useState<SolicitudPermiso['tipo']>('Vacaciones');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [reason, setReason] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // 1. Filtrar marcaciones del colaborador actual desde la base de datos (MySQL)
  // ---------------------------------------------------------------------------
  const employeePunches = useMemo(() => {
    if (!currentEmployee) return [];
    return punchLogs.filter((p) => {
      if (currentEmployee.id && p.empleadoId === currentEmployee.id) return true;
      if (currentEmployee.pin && p.pin === currentEmployee.pin) return true;
      if (currentEmployee.numeroDocumento && p.pin === currentEmployee.numeroDocumento) return true;
      if (
        currentEmployee.nombre &&
        p.nombreEmpleado &&
        (p.nombreEmpleado.toLowerCase().includes(currentEmployee.nombre.toLowerCase()) ||
          currentEmployee.nombre.toLowerCase().includes(p.nombreEmpleado.toLowerCase()))
      ) {
        return true;
      }
      return false;
    });
  }, [punchLogs, currentEmployee]);

  // ---------------------------------------------------------------------------
  // 2. Cálculo Real del Índice de Puntualidad cruzado con Marcaciones de BD
  // ---------------------------------------------------------------------------
  const punctualityStats = useMemo(() => {
    if (employeePunches.length === 0) {
      return {
        rate: 100,
        label: 'Al día',
        badgeColor: 'text-blue-700 bg-blue-50 border-blue-200/60',
        subtitle: 'Sin marcaciones biométricas en el período',
        tardanzasCount: 0,
        totalEntries: 0,
      };
    }

    const entradas = employeePunches.filter((p) => p.tipo === 'Entrada');
    const totalCount = entradas.length > 0 ? entradas.length : employeePunches.length;
    const tardanzas = employeePunches.filter((p) => getPunchStatusInfo(p).isTardanza).length;

    let rate = 100;
    if (totalCount > 0) {
      rate = Math.max(0, Math.min(100, Math.round(((totalCount - tardanzas) / totalCount) * 1000) / 10));
    }

    let label = 'Excelente';
    let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200/60';

    if (rate >= 95) {
      label = 'Excelente';
      badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200/60';
    } else if (rate >= 80) {
      label = 'Bueno';
      badgeColor = 'text-blue-700 bg-blue-50 border-blue-200/60';
    } else {
      label = 'Regular';
      badgeColor = 'text-amber-700 bg-amber-50 border-amber-200/60';
    }

    const subtitle =
      tardanzas === 0
        ? `Sin tardanzas acumuladas (${totalCount} ${totalCount === 1 ? 'marcación' : 'asistencias'})`
        : `${tardanzas} tardanza(s) registrada(s) en ${totalCount} asistencias`;

    return {
      rate,
      label,
      badgeColor,
      subtitle,
      tardanzasCount: tardanzas,
      totalEntries: totalCount,
    };
  }, [employeePunches]);

  // ---------------------------------------------------------------------------
  // 3. Filtrar solicitudes que pertenecen exclusivamente al colaborador actual
  // ---------------------------------------------------------------------------
  const myRequests = useMemo(() => {
    if (!currentEmployee) return [];
    return requests.filter((r) => {
      if (!r.nombreEmpleado) return false;
      const rName = r.nombreEmpleado.toLowerCase();
      const empName = (currentEmployee.nombre || '').toLowerCase();
      return rName.includes(empName) || empName.includes(rName);
    });
  }, [requests, currentEmployee]);

  // ---------------------------------------------------------------------------
  // 4. Cálculo Real de Vacaciones según Ley Laboral Peruana D.L. 713 y BD
  // ---------------------------------------------------------------------------
  const vacationStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    if (!currentEmployee?.fechaIngreso) {
      return {
        diasDisponibles: 0,
        periodo: `Período ${currentYear}`,
        proximoCorte: 'Pendiente de fecha de ingreso',
      };
    }

    // Parsear fecha de ingreso (soporta YYYY-MM-DD y DD/MM/YYYY)
    let ingresoDate: Date | null = null;
    const raw = currentEmployee.fechaIngreso.trim();
    if (raw.includes('/')) {
      const parts = raw.split('/');
      if (parts.length === 3) {
        ingresoDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    } else if (raw.includes('-')) {
      ingresoDate = new Date(raw);
    }

    if (!ingresoDate || isNaN(ingresoDate.getTime())) {
      return {
        diasDisponibles: 0,
        periodo: `Período ${currentYear}`,
        proximoCorte: 'Fecha no válida',
      };
    }

    const now = new Date();
    const diffTime = now.getTime() - ingresoDate.getTime();
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    // D.L. 713: 30 días calendario por año (aprox 2.5 días por mes trabajado)
    const accruedDays = Math.floor((diffDays / 360) * 30);

    // Descontar vacaciones gozadas y aprobadas en BD
    const approvedVacDays = myRequests
      .filter((r) => r.tipo === 'Vacaciones' && r.estado === 'Aprobado')
      .reduce((total, r) => {
        const start = new Date(r.fechaInicio);
        const end = new Date(r.fechaFin);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const days = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
          return total + days;
        }
        return total;
      }, 0);

    const saldoReal = Math.max(0, accruedDays - approvedVacDays);

    // Próximo aniversario de corte
    const day = String(ingresoDate.getDate()).padStart(2, '0');
    const month = String(ingresoDate.getMonth() + 1).padStart(2, '0');
    let nextAnnivYear = now.getFullYear();
    const thisYearAnniv = new Date(nextAnnivYear, ingresoDate.getMonth(), ingresoDate.getDate());
    if (now > thisYearAnniv) {
      nextAnnivYear += 1;
    }
    const proximoCorte = `${day}/${month}/${nextAnnivYear}`;

    return {
      diasDisponibles: saldoReal,
      periodo: `Período ${currentYear}`,
      proximoCorte: `Próximo corte legal: ${proximoCorte}`,
    };
  }, [currentEmployee?.fechaIngreso, myRequests]);

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
      fechaSolicitud: todayStr,
      nombreEmpleado: currentEmployee?.nombre || 'Colaborador Registrado',
    };

    onSubmitRequest(newReq);
    setReason('');
    setAttachedFile(null);
  };

  const sueldoReal = Number(currentEmployee?.sueldoBase) || 0;

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
            <span className="text-slate-600">{currentEmployee.cargo || 'Colaborador'}</span>
            <span className="text-slate-400">•</span>
            <span className="text-blue-600 font-medium">{currentEmployee.sede || 'Sede Principal'}</span>
          </div>
        ) : null}
      </div>

      {/* Top Balances Row (Información 100% Real Validada con Base de Datos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Vacaciones Disponibles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Vacaciones Disponibles
              </span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                {vacationStats.periodo}
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">
              {vacationStats.diasDisponibles}{' '}
              <span className="text-base font-normal text-slate-500">
                {vacationStats.diasDisponibles === 1 ? 'Día útil' : 'Días útiles'}
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">event_available</span>
            <span>{vacationStats.proximoCorte}</span>
          </div>
        </div>

        {/* Card 2: Índice de Puntualidad Biométrico */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Índice de Puntualidad
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${punctualityStats.badgeColor}`}>
                {punctualityStats.label}
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">
              {punctualityStats.rate}%
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>
            <span>{punctualityStats.subtitle}</span>
          </div>
        </div>

        {/* Card 3: Sueldo Base Mensual */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Sueldo Base Mensual
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${sueldoReal > 0 ? 'text-slate-600 bg-slate-100' : 'text-amber-700 bg-amber-50 border border-amber-200'}`}>
                {sueldoReal > 0 ? 'Moneda Oficial (PEN)' : 'Sin Asignar'}
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">
              {sueldoReal > 0
                ? `S/ ${sueldoReal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : 'S/ 0.00'}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-slate-400">payments</span>
            <span>
              {sueldoReal > 0
                ? `${currentEmployee?.regimenPrevisional || 'Fondo de Pensión'} • ${currentEmployee?.bancoSueldo ? `Banco ${currentEmployee.bancoSueldo}` : 'Pago por abono bancario'}`
                : 'Pendiente de asignación salarial en RRHH'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Request Form + History / Punches */}
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
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Enviar Solicitud a RRHH
            </button>
          </form>
        </div>

        {/* Right Column: Dynamic Tabs for Recent Requests & Biometric Punch Logs */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('requests')}
                  className={`pb-2 text-xs font-bold transition-colors cursor-pointer border-b-2 -mb-[9px] ${
                    activeTab === 'requests'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Mis Solicitudes ({myRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('punches')}
                  className={`pb-2 text-xs font-bold transition-colors cursor-pointer border-b-2 -mb-[9px] ${
                    activeTab === 'punches'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Marcaciones en Vivo ({employeePunches.length})
                </button>
              </div>
            </div>

            {/* Tab 1: Mis Solicitudes */}
            {activeTab === 'requests' && (
              <div className="space-y-3">
                {myRequests.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    <span className="material-symbols-outlined text-3xl mb-1 text-slate-300">description</span>
                    <p className="font-semibold text-slate-600">No tienes solicitudes registradas</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Usa el formulario lateral para solicitar permisos o vacaciones.</p>
                  </div>
                ) : (
                  myRequests.map((req) => {
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
                    }[req.estado] || {
                      badge: 'bg-slate-50 text-slate-700 border-slate-200',
                      icon: 'info',
                    };

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
                  })
                )}
              </div>
            )}

            {/* Tab 2: Mis Marcaciones Biométricas */}
            {activeTab === 'punches' && (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {employeePunches.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    <span className="material-symbols-outlined text-3xl mb-1 text-slate-300">fingerprint</span>
                    <p className="font-semibold text-slate-600">Sin marcaciones registradas</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Tus registros biométricos aparecerán aquí automáticamente.</p>
                  </div>
                ) : (
                  employeePunches.slice(0, 10).map((log) => {
                    const statusInfo = getPunchStatusInfo(log);
                    return (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-100/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            log.tipo === 'Entrada' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            <span className="material-symbols-outlined text-[18px]">
                              {log.tipo === 'Entrada' ? 'login' : 'logout'}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{log.tipo}</span>
                              <span className="text-[10px] text-slate-500 font-mono">({log.fecha})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {log.nombreDispositivo || 'Terminal Biométrico'} • {log.metodoVerificacion || 'Huella'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900 text-xs">{log.hora}</div>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.badgeClass}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
