import React, { useState, useMemo } from 'react';
import { Dispositivo, MarcacionAsistencia, Empleado, Sede } from '../../types';

interface OverviewViewProps {
  devices: Dispositivo[];
  punchLogs: MarcacionAsistencia[];
  employees?: Empleado[];
  sedes?: Sede[];
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

  // Total de empleados activos e inactivos
  const activeEmployees = useMemo(() => {
    return employees.length > 0 ? employees.filter((e) => e.estado === 'Activo') : [];
  }, [employees]);

  const inactiveEmployeesCount = useMemo(() => {
    return employees.filter((e) => e.estado === 'Inactivo').length;
  }, [employees]);

  const totalEmployees = Math.max(activeEmployees.length, 1);

  // Determinar la fecha de referencia "Hoy en sistema" (la fecha actual o la fecha más reciente con marcaciones)
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

  // Marcaciones de entrada de la fecha de referencia
  const targetDayEntries = useMemo(() => {
    return punchLogs.filter((p) => p.fecha === referenceDate && p.tipo === 'Entrada');
  }, [punchLogs, referenceDate]);

  // Colaboradores únicos que asistieron hoy
  const presentEmployees = useMemo(() => {
    const uniqueIds = new Set(targetDayEntries.map((p) => p.empleadoId));
    return uniqueIds.size;
  }, [targetDayEntries]);

  const attendanceRatePct = ((presentEmployees / totalEmployees) * 100).toFixed(1);

  // Tardanzas del día de referencia
  const tardanzaEntriesToday = useMemo(() => {
    return targetDayEntries.filter(
      (p) => p.esError || p.estado.toLowerCase().includes('tardanza')
    );
  }, [targetDayEntries]);

  const tardanzasEvents = tardanzaEntriesToday.length;
  const tardanzaRatePct = ((tardanzasEvents / totalEmployees) * 100).toFixed(1);

  // Retraso promedio en minutos para las tardanzas de hoy
  const avgDelayMins = useMemo(() => {
    if (tardanzasEvents === 0) return 0;
    let totalMins = 0;
    tardanzaEntriesToday.forEach((p) => {
      const match = p.estado.match(/\+(\d+)\s*MIN/i);
      if (match && match[1]) {
        totalMins += parseInt(match[1], 10);
      } else {
        totalMins += 15;
      }
    });
    return Math.round(totalMins / tardanzasEvents);
  }, [tardanzaEntriesToday, tardanzasEvents]);

  // Comparativa vs Día Anterior
  const diffVsYesterdayInfo = useMemo(() => {
    const prevDateObj = new Date(referenceDate);
    prevDateObj.setDate(prevDateObj.getDate() - 1);
    const prevDateStr = prevDateObj.toLocaleDateString('sv-SE');

    const prevDayEntries = punchLogs.filter((p) => p.fecha === prevDateStr && p.tipo === 'Entrada');
    const prevPresentCount = new Set(prevDayEntries.map((p) => p.empleadoId)).size;
    const prevRate = (prevPresentCount / totalEmployees) * 100;

    const diff = (parseFloat(attendanceRatePct) - prevRate).toFixed(1);
    const numDiff = parseFloat(diff);
    return {
      text: `${numDiff >= 0 ? '+' : ''}${diff}% vs. ayer`,
      isPositive: numDiff >= 0,
    };
  }, [referenceDate, punchLogs, totalEmployees, attendanceRatePct]);

  // Datos Semanales Dinámicos (Lun a Dom)
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

    // Filtrar marcaciones de la semana seleccionada
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

      if (p.estado.toLowerCase().includes('tardanza')) {
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
  }, [referenceDate, selectedWeek, punchLogs, totalEmployees]);

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
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-600">approval</span>
            Bandeja Solicitudes
            {pendingLeaveRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingLeaveRequestsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-400">download</span>
            Exportar Reporte
          </button>
          <button
            type="button"
            onClick={onOpenSyncModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            Sincronizar Red
          </button>
        </div>
      </div>

      {/* KPI Cards Row (100% Reales y Consolidados desde MySQL) */}
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Licencias & Descansos
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {inactiveEmployeesCount} Activas
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">
              {inactiveEmployeesCount}
            </div>
          </div>
          <div className="text-xs text-slate-600 mt-4 flex items-center gap-1.5 pt-3 border-t border-slate-100 font-medium">
            <span className="material-symbols-outlined text-[16px] text-blue-600">event_busy</span>
            <span>Personal en permiso / descanso</span>
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
              {punchLogs.slice(0, 4).map((log) => (
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
                      <p className="text-xs font-bold text-slate-800">{log.nombreEmpleado}</p>
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
              ))}
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
