import React, { useState, useMemo } from 'react';
import {
  Dispositivo,
  MarcacionAsistencia,
  Empleado,
  Sede,
  HorarioTrabajo,
  Turno,
  AsignacionTurno,
  ReglasAsistencia,
  SolicitudPermiso,
} from '../../types';

interface OverviewViewProps {
  devices: Dispositivo[];
  punchLogs: MarcacionAsistencia[];
  employees?: Empleado[];
  sedes?: Sede[];
  timetables?: HorarioTrabajo[];
  shifts?: Turno[];
  shiftAssignments?: AsignacionTurno[];
  attendanceRules?: ReglasAsistencia | null;
  leaveRequests?: SolicitudPermiso[];
  onOpenSyncModal: () => void;
  onOpenExportModal: () => void;
  onOpenRawLogsModal: () => void;
  onOpenLeaveRequestsModal: () => void;
  pendingLeaveRequestsCount?: number;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  devices,
  punchLogs,
  employees = [],
  sedes = [],
  timetables = [],
  shifts = [],
  shiftAssignments = [],
  attendanceRules,
  leaveRequests = [],
  onOpenSyncModal,
  onOpenExportModal,
  onOpenRawLogsModal,
  onOpenLeaveRequestsModal,
  pendingLeaveRequestsCount = 0,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<'current' | 'previous'>('current');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const onlineDevicesCount = devices.filter((d) => d.estado === 'online').length;
  const offlineDevicesCount = devices.length - onlineDevicesCount;

  // ---------------------------------------------------------------------------
  // CÁLCULOS 100% DINÁMICOS DESDE MYSQL (BASE DE DATOS EN TIEMPO REAL)
  // ---------------------------------------------------------------------------

  // Helper para resolver colaborador de una marcación
  const getEmpForLog = (p: MarcacionAsistencia) => {
    return employees.find(
      (e) =>
        (p.empleadoId && e.id === p.empleadoId) ||
        (p.pin && (e.pin === p.pin || e.numeroDocumento === p.pin)) ||
        (p.nombreEmpleado && (
          (e.pin && p.nombreEmpleado.includes(e.pin)) ||
          (e.numeroDocumento && p.nombreEmpleado.includes(e.numeroDocumento)) ||
          (!p.nombreEmpleado.toLowerCase().startsWith('usuario pin') && e.nombre.toLowerCase() === p.nombreEmpleado.toLowerCase())
        ))
    );
  };

  // Total de colaboradores activos
  const activeEmployees = useMemo(() => {
    return employees.length > 0 ? employees.filter((e) => e.estado === 'Activo') : [];
  }, [employees]);

  const totalEmployees = Math.max(activeEmployees.length, 1);

  // Determinar la fecha de referencia "Hoy en sistema"
  const todayStr = useMemo(() => new Date().toLocaleDateString('sv-SE'), []);

  const referenceDate = useMemo(() => {
    if (punchLogs.some((p) => p.fecha === todayStr)) {
      return todayStr;
    }
    if (punchLogs.length > 0) {
      return punchLogs.reduce((latest, p) => (p.fecha > latest ? p.fecha : latest), punchLogs[0].fecha);
    }
    return todayStr;
  }, [punchLogs, todayStr]);

  // Helper para resolver el horario programado de entrada y tolerancia de un empleado
  const getEmployeeSchedule = (empIdOrDoc: string, dateStr: string) => {
    let scheduledEntry = '08:30';
    let toleranceMin = 15;

    const dNum = new Date(dateStr + 'T00:00:00').getDay();
    const diaSemanaNum = dNum === 0 ? 7 : dNum;

    const assignment = shiftAssignments.find(
      (sa) => sa.empleadoId === empIdOrDoc
    );

    if (assignment && shifts.length > 0 && timetables.length > 0) {
      const shift = shifts.find((s) => s.id === assignment.turnoId);
      if (shift && shift.dias) {
        const diaConfig = shift.dias.find((d) => d.diaSemana === diaSemanaNum);
        if (diaConfig && diaConfig.horarioId) {
          const tt = timetables.find((t) => t.id === diaConfig.horarioId);
          if (tt) {
            scheduledEntry = tt.horaEntrada;
            toleranceMin = tt.minutosTolerancia ?? 15;
          }
        }
      }
    }

    const [eh, em] = scheduledEntry.split(':').map(Number);
    const scheduledEntryMin = (eh || 8) * 60 + (em || 30);
    return { scheduledEntryMin, toleranceMin };
  };

  // Helper para determinar si un punch de Entrada fue Tardanza y cuántos minutos de retraso tuvo
  const evaluateEntryPunch = (punch: MarcacionAsistencia) => {
    const emp = getEmpForLog(punch);
    const empKey = emp?.id || emp?.numeroDocumento || punch.empleadoId || punch.pin || '';
    const { scheduledEntryMin, toleranceMin } = getEmployeeSchedule(empKey, punch.fecha);

    const [pH, pM] = punch.hora.split(':').map(Number);
    const punchTimeMin = (pH || 0) * 60 + (pM || 0);
    const diff = punchTimeMin - scheduledEntryMin;

    const isLate = diff > toleranceMin;
    const delayMins = Math.max(diff, 0);

    return {
      isLate,
      delayMins,
      diff,
      emp,
    };
  };

  // Marcaciones de entrada de la fecha de referencia
  const targetDayEntries = useMemo(() => {
    return punchLogs.filter((p) => p.fecha === referenceDate && p.tipo === 'Entrada');
  }, [punchLogs, referenceDate]);

  // Colaboradores únicos que asistieron hoy
  const presentEmployees = useMemo(() => {
    const uniqueIds = new Set<string>();
    targetDayEntries.forEach((p) => {
      const emp = getEmpForLog(p);
      if (emp) {
        uniqueIds.add(emp.id);
      } else if (p.empleadoId) {
        uniqueIds.add(p.empleadoId);
      } else if (p.pin) {
        uniqueIds.add(p.pin);
      } else {
        uniqueIds.add(p.nombreEmpleado);
      }
    });
    return uniqueIds.size;
  }, [targetDayEntries, employees]);

  const attendanceRatePct = ((presentEmployees / totalEmployees) * 100).toFixed(1);

  // Tardanzas reales del día de referencia calculadas contra el horario laboral
  const tardanzaEntriesToday = useMemo(() => {
    return targetDayEntries.filter((p) => evaluateEntryPunch(p).isLate);
  }, [targetDayEntries, shiftAssignments, shifts, timetables, employees]);

  const tardanzasEvents = tardanzaEntriesToday.length;
  const tardanzaRatePct = presentEmployees > 0
    ? ((tardanzasEvents / presentEmployees) * 100).toFixed(1)
    : '0.0';

  // Retraso promedio en minutos para las tardanzas de hoy
  const avgDelayMins = useMemo(() => {
    if (tardanzasEvents === 0) return 0;
    let totalMins = 0;
    tardanzaEntriesToday.forEach((p) => {
      const evaluation = evaluateEntryPunch(p);
      totalMins += evaluation.delayMins;
    });
    return Math.round(totalMins / tardanzasEvents);
  }, [tardanzaEntriesToday, tardanzasEvents, shiftAssignments, shifts, timetables, employees]);

  // Comparativa vs Día Anterior
  const diffVsYesterdayInfo = useMemo(() => {
    const prevDateObj = new Date(referenceDate);
    prevDateObj.setDate(prevDateObj.getDate() - 1);
    const prevDateStr = prevDateObj.toLocaleDateString('sv-SE');

    const prevDayEntries = punchLogs.filter((p) => p.fecha === prevDateStr && p.tipo === 'Entrada');
    const prevUnique = new Set<string>();
    prevDayEntries.forEach((p) => {
      const emp = getEmpForLog(p);
      if (emp) prevUnique.add(emp.id);
      else if (p.empleadoId) prevUnique.add(p.empleadoId);
      else if (p.pin) prevUnique.add(p.pin);
    });

    const prevRate = (prevUnique.size / totalEmployees) * 100;
    const diff = (parseFloat(attendanceRatePct) - prevRate).toFixed(1);
    const numDiff = parseFloat(diff);
    return {
      text: `${numDiff >= 0 ? '+' : ''}${diff}% vs. ayer`,
      isPositive: numDiff >= 0,
    };
  }, [referenceDate, punchLogs, totalEmployees, attendanceRatePct, employees]);

  // Licencias & Descansos reales de hoy y solicitudes pendientes
  const activeLeavesToday = useMemo(() => {
    return leaveRequests.filter(
      (r) => r.estado === 'Aprobado' && r.fechaInicio <= referenceDate && r.fechaFin >= referenceDate
    );
  }, [leaveRequests, referenceDate]);

  const effectivePendingLeavesCount = useMemo(() => {
    return leaveRequests.filter((r) => r.estado === 'Pendiente').length || pendingLeaveRequestsCount;
  }, [leaveRequests, pendingLeaveRequestsCount]);

  // Datos Semanales Dinámicos (Lun a Dom) evaluados contra horarios reales
  const weekData = useMemo(() => {
    const daysLabel = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const daysMap: Record<string, { onTime: number; late: number }> = {
      Lun: { onTime: 0, late: 0 },
      Mar: { onTime: 0, late: 0 },
      Mié: { onTime: 0, late: 0 },
      Jue: { onTime: 0, late: 0 },
      Vie: { onTime: 0, late: 0 },
      Sáb: { onTime: 0, late: 0 },
      Dom: { onTime: 0, late: 0 },
    };

    const refDateObj = new Date(referenceDate);
    const dayOfWeek = refDateObj.getDay(); // 0 Dom, 1 Lun...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const mondayDate = new Date(refDateObj);
    mondayDate.setDate(mondayDate.getDate() + mondayOffset + (selectedWeek === 'previous' ? -7 : 0));

    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(sundayDate.getDate() + 6);

    const startStr = mondayDate.toLocaleDateString('sv-SE');
    const endStr = sundayDate.toLocaleDateString('sv-SE');

    const weekPunches = punchLogs.filter((p) => p.fecha >= startStr && p.fecha <= endStr && p.tipo === 'Entrada');

    weekPunches.forEach((p) => {
      const pDate = new Date(p.fecha + 'T00:00:00');
      let dayIdx = pDate.getDay() - 1;
      if (dayIdx < 0) dayIdx = 6;
      const dayName = daysLabel[dayIdx];

      const evaluation = evaluateEntryPunch(p);
      if (evaluation.isLate) {
        daysMap[dayName].late += 1;
      } else {
        daysMap[dayName].onTime += 1;
      }
    });

    const maxDay = Math.max(totalEmployees, 1);

    return daysLabel.map((day) => ({
      day,
      onTime: daysMap[day].onTime,
      late: daysMap[day].late,
      max: maxDay,
    }));
  }, [referenceDate, selectedWeek, punchLogs, totalEmployees, shiftAssignments, shifts, timetables, employees]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">
            Centro de Mando General
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitoreo en tiempo real del personal y estado de terminales en Perú (UTC-5).
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenLeaveRequestsModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-colors relative"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-500">assignment</span>
            Bandeja Solicitudes
            {effectivePendingLeavesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-extrabold">
                {effectivePendingLeavesCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-400">download</span>
            Exportar Reporte
          </button>
          <button
            type="button"
            onClick={onOpenSyncModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            Sincronizar Red
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Tasa de Asistencia Global */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Tasa Asistencia Global
              </span>
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  diffVsYesterdayInfo.isPositive
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200/60'
                    : 'text-amber-700 bg-amber-50 border-amber-200/60'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {diffVsYesterdayInfo.isPositive ? 'trending_up' : 'trending_down'}
                </span>
                {diffVsYesterdayInfo.text}
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">{attendanceRatePct}%</div>
          </div>
          <div className="text-xs text-slate-600 mt-4 flex items-center gap-1.5 pt-3 border-t border-slate-100 font-medium">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
            <span>{presentEmployees} / {totalEmployees} Presentes hoy</span>
          </div>
        </div>

        {/* Card 2: Tardanzas Reales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Tardanzas Registradas
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {tardanzasEvents} ev. hoy
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">{tardanzaRatePct}%</div>
          </div>
          <div className="text-xs text-slate-600 mt-4 flex items-center gap-1.5 pt-3 border-t border-slate-100 font-medium">
            <span className="material-symbols-outlined text-[16px] text-amber-600">alarm</span>
            <span>Retraso prom: {avgDelayMins} minutos</span>
          </div>
        </div>

        {/* Card 3: Licencias & Descansos */}
        <div
          onClick={onOpenLeaveRequestsModal}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors cursor-pointer"
        >
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Licencias & Descansos
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                effectivePendingLeavesCount > 0
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-blue-700 bg-blue-50 border-blue-100'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${effectivePendingLeavesCount > 0 ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                {effectivePendingLeavesCount > 0 ? `${effectivePendingLeavesCount} por revisar` : `${activeLeavesToday.length} Activas`}
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">
              {activeLeavesToday.length}
            </div>
          </div>
          <div className="text-xs text-slate-600 mt-4 flex items-center gap-1.5 pt-3 border-t border-slate-100 font-medium">
            <span className="material-symbols-outlined text-[16px] text-blue-600">event_busy</span>
            <span>
              {activeLeavesToday.length > 0
                ? `${activeLeavesToday.length} en descanso hoy`
                : effectivePendingLeavesCount > 0
                ? `${effectivePendingLeavesCount} solicitudes pendientes`
                : 'Sin permisos ni licencias hoy'}
            </span>
          </div>
        </div>

        {/* Card 4: Terminales Biométricos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Terminales Biométricos
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                ZKTeco ADMS
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">
              {onlineDevicesCount} / {devices.length}
            </div>
          </div>
          <div className="text-xs text-slate-600 mt-4 flex items-center justify-between pt-3 border-t border-slate-100 font-medium">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="material-symbols-outlined text-[16px]">wifi</span>
              {onlineDevicesCount} en línea
            </span>
            {offlineDevicesCount > 0 && (
              <span className="flex items-center gap-1 text-rose-600 font-semibold">
                <span className="material-symbols-outlined text-[16px]">wifi_off</span>
                {offlineDevicesCount} off
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Chart + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tendencia Semanal Real */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold font-headline text-slate-900">
                Tendencia Semanal de Asistencia y Puntualidad
              </h2>
              <p className="text-xs text-slate-500">
                Registro consolidado en tiempo real ({sedes.length > 0 ? sedes.length : 3} sedes)
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedWeek('current')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedWeek === 'current'
                    ? 'bg-white text-slate-800 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semana Actual
              </button>
              <button
                type="button"
                onClick={() => setSelectedWeek('previous')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedWeek === 'previous'
                    ? 'bg-white text-slate-800 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semana Anterior
              </button>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 h-56 items-end pt-6 pb-2">
            {weekData.map((item, idx) => {
              const heightPct = Math.min(100, Math.round((item.onTime / item.max) * 100));
              const latePct = Math.min(100, Math.round((item.late / item.max) * 100));
              const isHovered = hoveredBar === idx;

              return (
                <div
                  key={item.day}
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                  className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer relative"
                >
                  {isHovered && (
                    <div className="absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg shadow-lg whitespace-nowrap z-20 pointer-events-none">
                      Puntuales: {item.onTime} | Tardanzas: {item.late}
                    </div>
                  )}

                  <div className="w-full max-w-[40px] flex flex-col justify-end bg-slate-100 rounded-lg overflow-hidden h-full">
                    {latePct > 0 && (
                      <div
                        style={{ height: `${latePct}%` }}
                        className="bg-amber-400 w-full transition-all"
                      ></div>
                    )}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="bg-blue-600 w-full transition-all group-hover:bg-blue-700"
                    ></div>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 pt-3">
            <span>Registro consolidado en tiempo real</span>
            <span>
              Promedio de puntualidad hoy:{' '}
              <strong className="text-slate-800 font-semibold">{attendanceRatePct}%</strong>
            </span>
          </div>
        </div>

        {/* Right 1 Col: Live Device Log Feed */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-bold font-headline text-slate-900">
                  Marcaciones en Vivo
                </h2>
                <p className="text-xs text-slate-500">Últimos eventos biométricos en Perú</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                En Vivo
              </span>
            </div>

            <div className="space-y-2.5">
              {punchLogs.slice(0, 4).map((log) => {
                // Resolver colaborador de forma inteligente por ID, PIN, DNI o coincidencia de texto
                const emp = employees.find(
                  (e) =>
                    (log.empleadoId && e.id === log.empleadoId) ||
                    (log.pin && (e.pin === log.pin || e.numeroDocumento === log.pin)) ||
                    (log.nombreEmpleado && (
                      (e.pin && log.nombreEmpleado.includes(e.pin)) ||
                      (e.numeroDocumento && log.nombreEmpleado.includes(e.numeroDocumento)) ||
                      (!log.nombreEmpleado.toLowerCase().startsWith('usuario pin') && e.nombre.toLowerCase() === log.nombreEmpleado.toLowerCase())
                    ))
                );
                const resolvedNombre = emp?.nombre || log.nombreEmpleado;
                const resolvedDoc = emp?.numeroDocumento || emp?.pin || log.pin || '';

                return (
                  <div
                    key={log.id}
                    className="flex items-start justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          log.esError
                            ? 'bg-rose-50 text-rose-600'
                            : log.estado === 'Sincronización'
                            ? 'bg-slate-100 text-slate-600'
                            : log.metodoVerificacion === 'Tarjeta RFID'
                            ? 'bg-blue-50 text-blue-600'
                            : log.metodoVerificacion === 'PIN'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {log.esError
                            ? 'warning'
                            : log.estado === 'Sincronización'
                            ? 'sync'
                            : log.metodoVerificacion === 'Tarjeta RFID'
                            ? 'badge'
                            : log.metodoVerificacion === 'PIN'
                            ? 'dialpad'
                            : log.metodoVerificacion === 'Rostro'
                            ? 'face'
                            : 'fingerprint'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800" title={resolvedNombre}>{resolvedNombre}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {log.hora} • {log.nombreDispositivo} •{' '}
                          <span className="font-semibold text-slate-700">
                            {log.metodoVerificacion || 'Huella'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        log.esError
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : log.estado === 'Sincronización'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {log.estado}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenRawLogsModal}
            className="w-full mt-4 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-blue-600 text-xs font-bold rounded-xl transition-colors text-center border border-slate-200 cursor-pointer"
          >
            Ver todos los registros biométricos
          </button>
        </div>
      </div>
    </div>
  );
};
