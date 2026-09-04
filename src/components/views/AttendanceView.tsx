import React, { useState, useMemo } from 'react';
import {
  MarcacionAsistencia,
  Empleado,
  DiaFestivo,
  Sede,
  HorarioTrabajo,
  Turno,
  AsignacionTurno,
  ReglasAsistencia,
  EMPRESAS_GRUPO_CARMELITA,
  SolicitudHoraExtra,
} from '../../types';
import { ApproveOvertimeModal } from '../modals/ApproveOvertimeModal';
import { EditPunchModal } from '../modals/EditPunchModal';
import { AuditTrailModal } from '../modals/AuditTrailModal';

interface AttendanceViewProps {
  punchLogs: MarcacionAsistencia[];
  employees: Empleado[];
  sedes?: Sede[];
  holidays?: DiaFestivo[];
  timetables?: HorarioTrabajo[];
  shifts?: Turno[];
  shiftAssignments?: AsignacionTurno[];
  attendanceRules?: ReglasAsistencia;
  onOpenHolidayModal: () => void;
  onOpenManageHolidaysModal: () => void;
  onOpenExportModal: () => void;
  onOpenRawLogsModal: () => void;
  onOpenManualPunchModal?: () => void;
  onUpdatePunchLog?: (punch: MarcacionAsistencia) => void;
  onDeletePunchLog?: (punchId: string) => void;
}

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Setiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const AÑOS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  punchLogs,
  employees,
  sedes = [],
  holidays = [],
  timetables = [],
  shifts = [],
  shiftAssignments = [],
  attendanceRules,
  onOpenHolidayModal,
  onOpenManageHolidaysModal,
  onOpenExportModal,
  onOpenRawLogsModal,
  onOpenManualPunchModal,
  onUpdatePunchLog,
  onDeletePunchLog,
}) => {
  // Pestaña activa: 'calendar' | 'events' | 'anomalies' | 'overtime'
  const [subView, setSubView] = useState<'calendar' | 'events' | 'anomalies' | 'overtime'>('calendar');
  const [overtimeList, setOvertimeList] = useState<SolicitudHoraExtra[]>([]);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [selectedOvertimeItem, setSelectedOvertimeItem] = useState<SolicitudHoraExtra | null>(null);
  const [overtimeFilter, setOvertimeFilter] = useState<string>('all');
  const [overtimeSearch, setOvertimeSearch] = useState<string>('');
  const [overtimeMonth, setOvertimeMonth] = useState<number | 'all'>(() => new Date().getMonth());
  const [overtimeYear, setOvertimeYear] = useState<number>(() => new Date().getFullYear());

  // Estados de Edición, Eliminación y Bitácora de Marcaciones
  const [editingPunch, setEditingPunch] = useState<MarcacionAsistencia | null>(null);
  const [isEditPunchModalOpen, setIsEditPunchModalOpen] = useState(false);
  const [deletingPunchLog, setDeletingPunchLog] = useState<MarcacionAsistencia | null>(null);
  const [auditTrailPunch, setAuditTrailPunch] = useState<MarcacionAsistencia | null>(null);
  const [isAuditTrailModalOpen, setIsAuditTrailModalOpen] = useState(false);

  // Estado dinámico de año y mes para el calendario (Inicializado dinámicamente según la fecha actual)
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth());

  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    day: number;
    title: string;
    onTime: number;
    late: number;
    absent: number;
    isHoliday?: boolean;
    holidayName?: string;
    dateStr: string;
  } | null>(null);

  // Auxiliares para fechas dinámicas del sistema
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);
  const weekAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }, []);
  const monthPrefixStr = useMemo(() => new Date().toISOString().substring(0, 7), []);

  // Estados de Filtros para el Listado de Marcaciones
  const [quickDateFilter, setQuickDateFilter] = useState<
    'today' | 'yesterday' | 'week' | 'month' | 'custom' | 'all'
  >('today');
  const [dateFrom, setDateFrom] = useState<string>(todayStr);
  const [dateTo, setDateTo] = useState<string>(todayStr);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedSede, setSelectedSede] = useState<string>('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<'all' | 'Entrada' | 'Salida'>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Estados de Filtros para la pestaña de Incidencias & Omisiones de Marcación
  const [anomalyDate, setAnomalyDate] = useState<string>(todayStr);
  const [anomalyCompany, setAnomalyCompany] = useState<string>('all');
  const [anomalyTypeFilter, setAnomalyTypeFilter] = useState<'all' | 'INASISTENCIA' | 'OMISION_SALIDA' | 'OMISION_ENTRADA'>('all');

  // Helper robusto para enriquecer y resolver la información del colaborador
  const getEmpInfo = (empleadoId?: string, nombreEmpleado?: string, pin?: string) => {
    let emp: Empleado | undefined = undefined;

    // 1. Búsqueda por ID único
    if (empleadoId) {
      emp = employees.find((e) => e.id === empleadoId);
    }

    // 2. Búsqueda por PIN o DNI directo
    if (!emp && (pin || empleadoId)) {
      const queryPin = (pin || empleadoId || '').trim();
      if (queryPin) {
        emp = employees.find(
          (e) =>
            (e.pin && e.pin.trim() === queryPin) ||
            (e.numeroDocumento && e.numeroDocumento.trim() === queryPin)
        );
      }
    }

    // 3. Búsqueda por PIN numérico extraído de 'Usuario PIN XXXXX'
    if (!emp && nombreEmpleado) {
      const matchPin = nombreEmpleado.match(/\d+/);
      if (matchPin) {
        const extractedPin = matchPin[0];
        emp = employees.find(
          (e) =>
            (e.pin && e.pin.trim() === extractedPin) ||
            (e.numeroDocumento && e.numeroDocumento.trim() === extractedPin)
        );
      }
    }

    // 4. Búsqueda por coincidencia de nombre exacto o insensible a mayúsculas
    if (!emp && nombreEmpleado && !nombreEmpleado.toLowerCase().startsWith('usuario pin')) {
      emp = employees.find(
        (e) => e.nombre && e.nombre.toLowerCase().trim() === nombreEmpleado.toLowerCase().trim()
      );
    }

    const resolvedNombre = emp?.nombre || nombreEmpleado || (pin ? `Usuario PIN ${pin}` : 'Colaborador');
    const resolvedDoc = emp?.numeroDocumento || emp?.pin || pin || (nombreEmpleado ? nombreEmpleado.match(/\d+/)?.[0] : '') || '---';

    return {
      emp,
      nombre: resolvedNombre,
      empresa: emp?.empresa || 'Importaciones Carmelita del Norte S.A.C.',
      departamento: emp?.departamento || 'Operaciones',
      sede: emp?.sede || 'Sede Principal San Borja',
      foto: emp?.foto || '',
      cargo: emp?.cargo || 'Colaborador',
      doc: resolvedDoc,
    };
  };

  // Navegación rápida entre meses
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  const selectedMonthTitle = `${MESES[currentMonth]} ${currentYear}`;

  // Cálculo de días reales del mes para el calendario
  const daysCount = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeekIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();
  const leadingDays = Array.from({ length: firstDayWeekIndex }, (_, i) => {
    return prevMonthTotalDays - firstDayWeekIndex + 1 + i;
  });

  const nowSystem = new Date();
  const systemYear = nowSystem.getFullYear();
  const systemMonth = nowSystem.getMonth();
  const systemDay = nowSystem.getDate();
  const systemTodayStr = `${systemYear}-${String(systemMonth + 1).padStart(2, '0')}-${String(systemDay).padStart(2, '0')}`;

  // Métricas globales del mes
  const totalEmployeesCount =
    employees.length > 0
      ? employees.filter((e) => e.estado === 'Activo').length
      : 142;
  const inactiveEmployeesCount = employees.filter(
    (e) => e.estado === 'Inactivo'
  ).length;
  // helper de evaluación de horario de marcación (Tardanzas, Salidas adelantadas y Horas Extras con Umbral)
  const getPunchStatusInfo = (log: MarcacionAsistencia) => {
    if (log.esError || log.estado.toLowerCase().includes('error')) {
      return {
        label: log.estado || 'ERROR BIOMÉTRICO',
        colorClass: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: 'error',
      };
    }

    const [hhStr, mmStr] = log.hora.split(':');
    const hh = parseInt(hhStr || '0', 10);
    const mm = parseInt(mmStr || '0', 10);
    const punchTimeMin = hh * 60 + mm;

    // 1. Obtener día de la semana (1 = Lunes, 2 = Martes ... 5 = Viernes ... 7 = Domingo)
    let diaSemanaNum = 1;
    if (log.fecha) {
      const parts = log.fecha.split('-').map(Number);
      if (parts.length === 3) {
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        const jsDay = dateObj.getDay();
        diaSemanaNum = jsDay === 0 ? 7 : jsDay;
      }
    }

    let resolvedTimetable: HorarioTrabajo | null = null;

    // 2. Buscar el horario específico asignado al empleado para ese día concreto de la semana
    if (shiftAssignments && shifts && timetables) {
      const assignment = shiftAssignments.find((sa) => sa.empleadoId === log.empleadoId);
      if (assignment) {
        const shift = shifts.find((s) => s.id === assignment.turnoId);
        if (shift && shift.dias) {
          const diaConfig = shift.dias.find((d) => d.diaSemana === diaSemanaNum);
          if (diaConfig && diaConfig.horarioId) {
            const hFound = timetables.find((h) => h.id === diaConfig.horarioId);
            if (hFound) {
              resolvedTimetable = hFound;
            }
          }
        }
      }
    }

    // 3. Si no se encontró asignación explícita por turno, buscar por ventana horaria
    if (!resolvedTimetable && timetables && timetables.length > 0) {
      resolvedTimetable =
        timetables.find((h) => {
          if (log.tipo === 'Entrada' && h.ventanaEntradaDesde && h.ventanaEntradaHasta) {
            return log.hora >= h.ventanaEntradaDesde && log.hora <= h.ventanaEntradaHasta;
          }
          if (log.tipo === 'Salida' && h.ventanaSalidaDesde && h.ventanaSalidaHasta) {
            return log.hora >= h.ventanaSalidaDesde && log.hora <= h.ventanaSalidaHasta;
          }
          return false;
        }) || null;
    }

    let scheduledEntryMin = 8 * 60 + 30; // 08:30 AM por defecto
    let scheduledExitMin = 17 * 60 + 30;  // 17:30 PM por defecto
    let toleranceMin = 15;

    if (resolvedTimetable) {
      const [eh, em] = resolvedTimetable.horaEntrada.split(':').map(Number);
      scheduledEntryMin = (eh || 0) * 60 + (em || 0);
      const [xh, xm] = resolvedTimetable.horaSalida.split(':').map(Number);
      scheduledExitMin = (xh || 0) * 60 + (xm || 0);
      toleranceMin = resolvedTimetable.minutosTolerancia ?? 15;
    } else if (punchTimeMin < 8 * 60) {
      scheduledEntryMin = 7 * 60;
      toleranceMin = 0;
    }

    const isManual = log.metodoVerificacion === 'Manual RRHH';

    if (log.tipo === 'Entrada') {
      const diff = punchTimeMin - scheduledEntryMin;
      if (diff <= 0) {
        return {
          label: isManual ? 'ENTRADA PUNTUAL (MANUAL)' : 'ENTRADA PUNTUAL',
          colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: 'check_circle',
        };
      } else if (diff <= toleranceMin && toleranceMin > 0) {
        return {
          label: isManual ? `GRACIA (+${diff} MIN) (MANUAL)` : `GRACIA (+${diff} MIN)`,
          colorClass: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: 'timelapse',
        };
      } else if (diff <= 45) {
        return {
          label: isManual ? `TARDANZA (+${diff} MIN) (MANUAL)` : `TARDANZA (+${diff} MIN)`,
          colorClass: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
          icon: 'warning',
        };
      } else {
        return {
          label: isManual ? `TARDANZA CRÍTICA (+${diff} MIN) (MANUAL)` : `TARDANZA CRÍTICA (+${diff} MIN)`,
          colorClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
          icon: 'release_alert',
        };
      }
    }

    if (log.tipo === 'Salida') {
      const diff = scheduledExitMin - punchTimeMin;
      const umbralMinimosHE = attendanceRules?.minutosMinimosParaHoraExtra ?? 30;

      if (diff > 5) {
        const hoursEarly = Math.floor(diff / 60);
        const minsEarly = diff % 60;
        const timeStr = hoursEarly > 0 ? `-${hoursEarly}h ${minsEarly}m` : `-${minsEarly} MIN`;
        return {
          label: `SALIDA ADELANTADA (${timeStr})`,
          colorClass: 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold shadow-2xs',
          icon: 'alarm_off',
        };
      } else if (diff >= -umbralMinimosHE) {
        // Exceso menor que el umbral de horas extras (ej. 8 min < 30 min) -> Salida regular en horario
        return {
          label: isManual ? 'SALIDA EN HORARIO (MANUAL)' : 'SALIDA EN HORARIO',
          colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: 'task_alt',
        };
      } else {
        // Exceso alcanza o supera el umbral configurable de horas extras (ej. 45 min >= 30 min)
        const extraMin = Math.abs(diff);
        const extraHours = (extraMin / 60).toFixed(1);
        return {
          label: `HORAS EXTRAS (+${extraHours}h)`,
          colorClass: 'bg-blue-50 text-blue-700 border-blue-200 font-bold',
          icon: 'add_alarm',
        };
      }
    }

    return {
      label: log.estado || 'ESCANEO EXITOSO',
      colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: 'check_circle',
    };
  };

  const tardanzasCount = punchLogs.filter((p) => {
    if (p.tipo !== 'Entrada') return false;
    const status = getPunchStatusInfo(p);
    return status.label.includes('TARDANZA');
  }).length;

  const salidasTempranasCount = punchLogs.filter((p) => {
    if (p.tipo !== 'Salida') return false;
    const status = getPunchStatusInfo(p);
    return status.label.includes('SALIDA ADELANTADA');
  }).length;

  const puntualCount = Math.max(0, totalEmployeesCount - tardanzasCount);
  const tasaPuntualidad =
    totalEmployeesCount > 0
      ? ((puntualCount / totalEmployeesCount) * 100).toFixed(1)
      : '100.0';

  // Algoritmo de Detección Inteligente de Anomalías e Incidencias (Inasistencias, Omisión de Entrada, Omisión de Salida)
  const allIncidenciasDiarias = useMemo(() => {
    const list: Array<{
      id: string;
      empleadoId: string;
      nombreEmpleado: string;
      empresa: string;
      cargo: string;
      doc: string;
      fecha: string;
      tipoIncidencia: 'INASISTENCIA' | 'OMISION_SALIDA' | 'OMISION_ENTRADA';
      detalle: string;
      horaEntradaRegistrada?: string;
      horaSalidaRegistrada?: string;
    }> = [];

    const targetDate = anomalyDate || todayStr;
    const activeEmps = employees.filter((e) => e.estado === 'Activo');

    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    const isToday = targetDate === todayStr;
    const isFuture = targetDate > todayStr;

    // No generar anomalías para fechas futuras
    if (isFuture) {
      return [];
    }

    for (const emp of activeEmps) {
      const empInfo = getEmpInfo(emp.id, emp.nombre, emp.pin);
      if (anomalyCompany !== 'all' && empInfo.empresa !== anomalyCompany) continue;

      // Obtener horario programado para el colaborador en ese día de la semana
      let scheduledEntry = '08:30';
      let scheduledExit = '17:30';
      let entryWindowUntil = '12:00'; // Límite máximo configurado en el horario para registrar ingreso
      let toleranceMin = 15;

      const dNum = new Date(targetDate + 'T00:00:00').getDay();
      const diaSemanaNum = dNum === 0 ? 7 : dNum;
      const empShiftAss = shiftAssignments.find(
        (sa) => sa.empleadoId === emp.id || sa.empleadoId === empInfo.doc
      );

      if (empShiftAss && shifts.length > 0 && timetables.length > 0) {
        const currentShift = shifts.find((s) => s.id === empShiftAss.turnoId);
        if (currentShift && currentShift.dias) {
          const diaConfig = currentShift.dias.find((d) => d.diaSemana === diaSemanaNum);
          if (diaConfig && diaConfig.horarioId) {
            const tt = timetables.find((t) => t.id === diaConfig.horarioId);
            if (tt) {
              scheduledEntry = tt.horaEntrada;
              scheduledExit = tt.horaSalida;
              toleranceMin = tt.minutosTolerancia ?? 15;
              if (tt.ventanaEntradaHasta) {
                entryWindowUntil = tt.ventanaEntradaHasta;
              }
            }
          }
        }
      }

      const [entryH, entryM] = scheduledEntry.split(':').map(Number);
      const scheduledEntryMin = (entryH || 8) * 60 + (entryM || 30);

      const [exitH, exitM] = scheduledExit.split(':').map(Number);
      const scheduledExitMin = (exitH || 17) * 60 + (exitM || 30);

      const [limitH, limitM] = entryWindowUntil.split(':').map(Number);
      const entryLimitMin = (limitH || 12) * 60 + (limitM || 0);

      const dayPunches = punchLogs.filter((p) => {
        if (p.fecha !== targetDate || p.estado === 'Anulado por RRHH') return false;
        const pInfo = getEmpInfo(p.empleadoId, p.nombreEmpleado, p.pin);
        return (
          pInfo.emp?.id === emp.id ||
          p.empleadoId === emp.id ||
          p.nombreEmpleado.toLowerCase() === emp.nombre.toLowerCase() ||
          (p.pin && (p.pin === emp.pin || p.pin === emp.numeroDocumento))
        );
      });

      const entries = dayPunches.filter((p) => p.tipo === 'Entrada');
      const exits = dayPunches.filter((p) => p.tipo === 'Salida');

      // CASO 1: Sin marcaciones en todo el día
      if (dayPunches.length === 0) {
        if (isToday) {
          // Si es hoy, SOLO se considera Falta/Inasistencia si la hora actual ya superó el límite máximo configurado en su horario para registrar ingreso (ventanaEntradaHasta)
          if (currentTotalMinutes > entryLimitMin) {
            list.push({
              id: `inc-${emp.id}-${targetDate}`,
              empleadoId: emp.id,
              nombreEmpleado: emp.nombre,
              empresa: empInfo.empresa,
              cargo: empInfo.cargo,
              doc: empInfo.doc,
              fecha: targetDate,
              tipoIncidencia: 'INASISTENCIA',
              detalle: `Sin registro de ingreso. Excedió el límite máximo configurado en su horario para marcar entrada (${entryWindowUntil}).`,
            });
          }
          // Si la hora actual aún no supera el límite de ingreso: Aún está dentro de la ventana de llegada/tolerancia, no se marca como inasistencia definitiva.
        } else {
          // Día pasado cerrado: inasistencia confirmada
          list.push({
            id: `inc-${emp.id}-${targetDate}`,
            empleadoId: emp.id,
            nombreEmpleado: emp.nombre,
            empresa: empInfo.empresa,
            cargo: empInfo.cargo,
            doc: empInfo.doc,
            fecha: targetDate,
            tipoIncidencia: 'INASISTENCIA',
            detalle: 'Sin registro de marcaciones en todo el día laborable.',
          });
        }
      }
      // CASO 2: Registró Entrada pero NO registra Salida
      else if (entries.length > 0 && exits.length === 0) {
        if (isToday) {
          // Si es hoy, SOLO se considera Omisión de Salida si la hora actual ya superó la hora de salida del turno (+ margen de 30 min)
          if (currentTotalMinutes > scheduledExitMin + 30) {
            list.push({
              id: `inc-${emp.id}-${targetDate}`,
              empleadoId: emp.id,
              nombreEmpleado: emp.nombre,
              empresa: empInfo.empresa,
              cargo: empInfo.cargo,
              doc: empInfo.doc,
              fecha: targetDate,
              tipoIncidencia: 'OMISION_SALIDA',
              detalle: `Jornada concluida (Salida programada: ${scheduledExit}). Registró ingreso a las ${entries[0].hora}, pero omitió registrar su salida.`,
              horaEntradaRegistrada: entries[0].hora,
            });
          }
          // Si currentTotalMinutes <= scheduledExitMin + 30 -> El colaborador se encuentra laborando activamente dentro de su turno. NO es omisión.
        } else {
          // Día pasado cerrado: efectivamente omitió su salida
          list.push({
            id: `inc-${emp.id}-${targetDate}`,
            empleadoId: emp.id,
            nombreEmpleado: emp.nombre,
            empresa: empInfo.empresa,
            cargo: empInfo.cargo,
            doc: empInfo.doc,
            fecha: targetDate,
            tipoIncidencia: 'OMISION_SALIDA',
            detalle: `Falta marcado de salida. Registró ingreso a las ${entries[0].hora}.`,
            horaEntradaRegistrada: entries[0].hora,
          });
        }
      }
      // CASO 3: Registró Salida pero NO registra Entrada
      else if (entries.length === 0 && exits.length > 0) {
        list.push({
          id: `inc-${emp.id}-${targetDate}`,
          empleadoId: emp.id,
          nombreEmpleado: emp.nombre,
          empresa: empInfo.empresa,
          cargo: empInfo.cargo,
          doc: empInfo.doc,
          fecha: targetDate,
          tipoIncidencia: 'OMISION_ENTRADA',
          detalle: `Falta marcado de ingreso. Registró salida a las ${exits[0].hora}, pero no cuenta con registro de ingreso.`,
          horaSalidaRegistrada: exits[0].hora,
        });
      }
    }

    return list;
  }, [employees, punchLogs, anomalyDate, anomalyCompany, todayStr, shiftAssignments, shifts, timetables]);

  const incidenciasDiarias = useMemo(() => {
    if (anomalyTypeFilter === 'all') return allIncidenciasDiarias;
    return allIncidenciasDiarias.filter((inc) => inc.tipoIncidencia === anomalyTypeFilter);
  }, [allIncidenciasDiarias, anomalyTypeFilter]);

  // Solicitudes y Registros de Horas Extras derivados dinámicamente de punchLogs + Estado de Aprobación
  const resolvedOvertimeList = useMemo(() => {
    const dynamicOvertimePunches: SolicitudHoraExtra[] = [];

    punchLogs.forEach((log) => {
      if (log.tipo !== 'Salida' || log.estado === 'Anulado por RRHH') return;

      const empInfo = getEmpInfo(log.empleadoId, log.nombreEmpleado, log.pin);

      // Obtener horario programado de salida para el colaborador en ese día de la semana
      let scheduledExit = '17:30';
      const dNum = new Date(log.fecha + 'T00:00:00').getDay();
      const diaSemanaNum = dNum === 0 ? 7 : dNum;
      const empShiftAss = shiftAssignments.find(
        (sa) => sa.empleadoId === log.empleadoId || sa.empleadoId === empInfo.doc
      );

      if (empShiftAss && shifts.length > 0 && timetables.length > 0) {
        const currentShift = shifts.find((s) => s.id === empShiftAss.turnoId);
        if (currentShift && currentShift.dias) {
          const diaConfig = currentShift.dias.find((d) => d.diaSemana === diaSemanaNum);
          if (diaConfig && diaConfig.horarioId) {
            const tt = timetables.find((t) => t.id === diaConfig.horarioId);
            if (tt) scheduledExit = tt.horaSalida;
          }
        }
      }

      // Calcular diferencia en minutos entre salida marcada y salida programada
      const [sH, sM] = scheduledExit.split(':').map(Number);
      const [pH, pM] = log.hora.split(':').map(Number);
      const schedMin = sH * 60 + sM;
      const punchMin = pH * 60 + pM;
      const diffMin = punchMin - schedMin;
      const umbralMinimosHE = attendanceRules?.minutosMinimosParaHoraExtra ?? 30;

      // Si el exceso alcanza o supera el umbral de horas extras (ej. 30 min)
      if (diffMin >= umbralMinimosHE) {
        const requestId = `he-${log.fecha}-${empInfo.emp?.id || log.empleadoId || log.pin}`;

        // Verificar si ya existe una resolución registrada manualmente (aprobada/rechazada/compensada)
        const existing = overtimeList.find(
          (o) =>
            o.id === requestId ||
            (o.fecha === log.fecha &&
              (o.empleadoId === log.empleadoId ||
                o.empleadoId === empInfo.emp?.id ||
                o.documentoEmpleado === empInfo.doc ||
                o.nombreEmpleado.toLowerCase() === empInfo.nombre.toLowerCase() ||
                o.nombreEmpleado.toLowerCase() === log.nombreEmpleado.toLowerCase()))
        );

        dynamicOvertimePunches.push({
          id: existing ? existing.id : requestId,
          empleadoId: empInfo.emp?.id || log.empleadoId,
          nombreEmpleado: empInfo.nombre,
          documentoEmpleado: empInfo.doc,
          empresa: empInfo.empresa,
          sede: empInfo.sede,
          fecha: log.fecha,
          horaSalidaProgramada: scheduledExit,
          horaSalidaMarcada: log.hora.substring(0, 5),
          minutosDetectados: diffMin,
          minutosAprobados: existing ? existing.minutosAprobados : diffMin,
          tipoHe: existing ? existing.tipoHe : (diffMin > 120 ? '35%' : '25%'),
          estado: existing ? existing.estado : 'Pendiente',
          motivoRechazo: existing ? existing.motivoRechazo : undefined,
          aprobadoPor: existing ? existing.aprobadoPor : undefined,
          actualizadoEn: existing ? existing.actualizadoEn : undefined,
        });
      }
    });

    return dynamicOvertimePunches.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  }, [punchLogs, overtimeList, shiftAssignments, shifts, timetables, employees, attendanceRules]);

  // Lista filtrada de Horas Extras por Mes, Año, Estado y Búsqueda
  const filteredOvertimeList = useMemo(() => {
    return resolvedOvertimeList.filter((he) => {
      if (overtimeMonth !== 'all') {
        const prefix = `${overtimeYear}-${String(Number(overtimeMonth) + 1).padStart(2, '0')}`;
        if (!he.fecha.startsWith(prefix)) return false;
      } else {
        if (!he.fecha.startsWith(String(overtimeYear))) return false;
      }

      if (overtimeFilter !== 'all' && he.estado !== overtimeFilter) {
        return false;
      }

      if (overtimeSearch.trim()) {
        const q = overtimeSearch.toLowerCase();
        const matches =
          he.nombreEmpleado.toLowerCase().includes(q) ||
          (he.documentoEmpleado || '').includes(q) ||
          he.fecha.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [resolvedOvertimeList, overtimeMonth, overtimeYear, overtimeFilter, overtimeSearch]);

  const daysInMonth = Array.from({ length: daysCount }, (_, i) => {
    const dayNum = i + 1;
    const dateObj = new Date(currentYear, currentMonth, dayNum);
    const dayOfWeek = dateObj.getDay();
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const isWeekend = isSunday || isSaturday;

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const foundHoliday = holidays.find((h) => h.fecha === dateStr);
    const isHoliday = !!foundHoliday;
    const isToday = currentYear === systemYear && currentMonth === systemMonth && dayNum === systemDay;
    const isFuture = dateStr > systemTodayStr;

    // Obtener marcaciones reales registradas en MySQL para este día específico
    const dayAllPunches = punchLogs.filter((p) => p.fecha === dateStr);
    const dayEntries = dayAllPunches.filter((p) => p.tipo === 'Entrada');
    const hasData = dayAllPunches.length > 0;

    let late = 0;
    let onTime = 0;
    let absent = 0;

    if (!isFuture && !isWeekend && !isHoliday) {
      late = dayEntries.filter((p) => getPunchStatusInfo(p).label.includes('TARDANZA')).length;
      onTime = Math.max(0, dayEntries.length - late);
      absent = hasData ? Math.max(0, totalEmployeesCount - dayEntries.length) : 0;
    }

    return {
      day: dayNum,
      dateStr,
      isWeekend,
      isHoliday,
      holidayName: foundHoliday?.nombre || (isHoliday ? 'Día Festivo Nacional' : undefined),
      isToday,
      isFuture,
      hasData,
      onTime,
      late,
      absent,
    };
  });

  const totalCells = leadingDays.length + daysInMonth.length;
  const trailingDaysCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const trailingDays = Array.from({ length: trailingDaysCount }, (_, i) => i + 1);

  // Manejo de Filtros de Fecha Rápidos
  const handleQuickFilter = (
    filter: 'today' | 'yesterday' | 'week' | 'month' | 'all'
  ) => {
    setQuickDateFilter(filter);
    if (filter === 'today') {
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (filter === 'yesterday') {
      setDateFrom(yesterdayStr);
      setDateTo(yesterdayStr);
    } else if (filter === 'week') {
      setDateFrom(weekAgoStr);
      setDateTo(todayStr);
    } else if (filter === 'month') {
      setDateFrom(`${monthPrefixStr}-01`);
      setDateTo(todayStr);
    }
  };

  // Filtrado reactivo de marcaciones
  const filteredEvents = useMemo(() => {
    const rawFiltered = punchLogs.filter((log) => {
      const info = getEmpInfo(log.empleadoId, log.nombreEmpleado, log.pin);

      // Filtro por Fecha
      if (quickDateFilter === 'today' && log.fecha !== todayStr) return false;
      if (quickDateFilter === 'yesterday' && log.fecha !== yesterdayStr) return false;
      if (quickDateFilter === 'week') {
        if (log.fecha < weekAgoStr || log.fecha > todayStr) return false;
      }
      if (quickDateFilter === 'month') {
        if (!log.fecha.startsWith(monthPrefixStr)) return false;
      }
      if (quickDateFilter === 'custom') {
        if (dateFrom && log.fecha < dateFrom) return false;
        if (dateTo && log.fecha > dateTo) return false;
      }

      // Filtro por Empresa
      if (selectedCompany !== 'all' && info.empresa !== selectedCompany) {
        return false;
      }

      // Filtro por Sede
      if (selectedSede !== 'all') {
        const matchesSede =
          info.sede.toLowerCase().includes(selectedSede.toLowerCase()) ||
          log.nombreDispositivo.toLowerCase().includes(selectedSede.toLowerCase());
        if (!matchesSede) return false;
      }

      // Filtro por Colaborador
      if (selectedEmployeeId !== 'all') {
        if (
          log.empleadoId !== selectedEmployeeId &&
          log.nombreEmpleado !== selectedEmployeeId &&
          info.emp?.id !== selectedEmployeeId &&
          info.doc !== selectedEmployeeId &&
          log.pin !== selectedEmployeeId
        ) {
          return false;
        }
      }

      // Filtro por Tipo (Entrada/Salida)
      if (selectedEventType !== 'all' && log.tipo !== selectedEventType) {
        return false;
      }

      // Filtro por Método
      if (
        selectedMethod !== 'all' &&
        log.metodoVerificacion !== selectedMethod
      ) {
        return false;
      }

      // Búsqueda de Texto Libre
      if (filterSearch.trim()) {
        const query = filterSearch.toLowerCase();
        const searchPool = `
          ${info.nombre}
          ${log.nombreEmpleado} 
          ${info.doc} 
          ${info.cargo} 
          ${info.departamento} 
          ${info.empresa} 
          ${info.sede} 
          ${log.nombreDispositivo} 
          ${log.motivoRegularizacion || ''}
        `.toLowerCase();
        if (!searchPool.includes(query)) return false;
      }

      return true;
    });

    // Si la opción es "Todo el Historial", mostrar TODOS los eventos crudos sin agrupar para auditoría
    if (quickDateFilter === 'all') {
      return rawFiltered;
    }

    // Para vistas filtradas (Hoy, Ayer, 7 Días, Mes Actual, Rango Personalizado):
    // Agrupar por Colaborador + Fecha + Tipo para mostrar la PRIMERA Entrada y ÚLTIMA Salida del día
    const groupedMap = new Map<string, MarcacionAsistencia>();

    for (const log of rawFiltered) {
      const info = getEmpInfo(log.empleadoId, log.nombreEmpleado, log.pin);
      const empIdentifier = info.emp?.id || log.empleadoId || log.pin || info.doc || log.nombreEmpleado;
      // Las regularizaciones manuales RRHH se mantienen intactas
      const key = log.metodoVerificacion === 'Manual RRHH'
        ? `manual_${log.id}`
        : `${empIdentifier}_${log.fecha}_${log.tipo}`;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, log);
      } else {
        const existing = groupedMap.get(key)!;
        if (log.tipo === 'Entrada') {
          // Para entrada: conservar la marcación MÁS TEMPRANA (primer ingreso del día)
          if (log.hora < existing.hora) {
            groupedMap.set(key, log);
          }
        } else if (log.tipo === 'Salida') {
          // Para salida: conservar la marcación MÁS TARDÍA (último egreso del día)
          if (log.hora > existing.hora) {
            groupedMap.set(key, log);
          }
        }
      }
    }

    return Array.from(groupedMap.values()).sort((a, b) => {
      const dtA = `${a.fecha} ${a.hora}`;
      const dtB = `${b.fecha} ${b.hora}`;
      return dtB.localeCompare(dtA);
    });
  }, [
    punchLogs,
    quickDateFilter,
    dateFrom,
    dateTo,
    selectedCompany,
    selectedSede,
    selectedEmployeeId,
    selectedEventType,
    selectedMethod,
    filterSearch,
    employees,
  ]);

  // Exportar Listado a CSV para Excel
  const handleExportCSV = () => {
    const headers = [
      'Fecha',
      'Hora (Peru UTC-5)',
      'DNI / Documento',
      'Colaborador',
      'Cargo',
      'Empresa (Grupo Carmelita)',
      'Departamento',
      'Sede Asignada',
      'Terminal Biometrico',
      'Tipo de Evento',
      'Metodo de Marcado',
      'Estado',
      'Motivo / Regularizacion',
    ];

    const rows = filteredEvents.map((log) => {
      const info = getEmpInfo(log.empleadoId, log.nombreEmpleado, log.pin);
      return [
        log.fecha,
        log.hora,
        `"${info.doc}"`,
        `"${info.nombre}"`,
        `"${info.cargo}"`,
        `"${info.empresa}"`,
        `"${info.departamento}"`,
        `"${info.sede}"`,
        `"${log.nombreDispositivo}"`,
        log.tipo,
        log.metodoVerificacion || 'Huella',
        log.estado,
        `"${log.motivoRegularizacion || 'Marcación Biométrica Normal'}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Marcaciones_Grupo_Carmelita_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header Superior */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">
            Control de Asistencia & Eventos de Marcación
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitoreo biométrico para Grupo Carmelita (Carmelita del Norte, Chemmer Perú y León Plast).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {onOpenManualPunchModal && (
            <button
              type="button"
              onClick={onOpenManualPunchModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="Registrar marcación manual para justificar u regularizar asistencias"
            >
              <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
              Regularizar Marcación
            </button>
          )}
          <button
            type="button"
            onClick={onOpenManageHolidaysModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">event_available</span>
            Gestionar Feriados
          </button>
          <button
            onClick={onOpenExportModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar Nómina
          </button>
        </div>
      </div>



      {/* Selector de Pestañas Principales (Calendario vs Listado de Eventos) */}
      <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 w-fit shadow-2xs">
        <button
          type="button"
          onClick={() => setSubView('calendar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subView === 'calendar'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          Calendario Mensual & Feriados
        </button>

        <button
          type="button"
          onClick={() => setSubView('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subView === 'events'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">list_alt</span>
          Eventos y Marcaciones del Personal
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {filteredEvents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubView('anomalies')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subView === 'anomalies'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">rule</span>
          Incidencias & Omisiones de Marcación
          {allIncidenciasDiarias.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {allIncidenciasDiarias.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubView('overtime')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            subView === 'overtime'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">more_time</span>
          Aprobación de Horas Extras
          {resolvedOvertimeList.filter((he) => he.estado === 'Pendiente').length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
              {resolvedOvertimeList.filter((he) => he.estado === 'Pendiente').length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: CALENDARIO MENSUAL                                               */}
      {/* ========================================================================= */}
      {subView === 'calendar' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 animate-in fade-in">
          {/* Calendar Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Selector de Mes */}
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="h-9 px-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer shadow-2xs"
              >
                {MESES.map((mes, idx) => (
                  <option key={mes} value={idx}>
                    {mes}
                  </option>
                ))}
              </select>

              {/* Selector de Año */}
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="h-9 px-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold font-mono text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer shadow-2xs"
              >
                {AÑOS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>

              {/* Botones de Navegación Rápida Anterior / Siguiente */}
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="Mes Anterior"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="Mes Siguiente"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>

              {/* Botón Mes Actual / Hoy */}
              <button
                type="button"
                onClick={handleToday}
                className="h-9 px-3 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors cursor-pointer"
              >
                Hoy
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">Puntual (&gt;90%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-600">Con Tardanzas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-slate-600">Festivo</span>
              </div>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 uppercase py-1">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {leadingDays.map((prevDay) => (
              <div
                key={`prev-${prevDay}`}
                className="h-16 sm:h-20 p-1.5 rounded-xl bg-slate-50/60 opacity-40 border border-slate-100 flex items-start justify-between select-none"
              >
                <span className="text-xs font-medium text-slate-400 font-mono">{prevDay}</span>
              </div>
            ))}

            {daysInMonth.map((d) => {
              const isClickable = !d.isWeekend;
              return (
                <div
                  key={d.day}
                  onClick={() => {
                    if (isClickable || d.isHoliday) {
                      setSelectedDayDetail({
                        day: d.day,
                        title: `${d.day} de ${selectedMonthTitle}`,
                        onTime: d.onTime,
                        late: d.late,
                        absent: d.absent,
                        isHoliday: d.isHoliday,
                        holidayName: d.holidayName,
                        dateStr: d.dateStr,
                      });
                    }
                  }}
                  className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    d.isToday
                      ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                      : d.isHoliday
                      ? 'border-blue-200 bg-blue-50/30'
                      : d.isWeekend
                      ? 'border-slate-100 bg-slate-50/70 text-slate-400'
                      : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-2xs cursor-pointer'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-xs font-bold ${
                        d.isToday
                          ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center -mt-0.5 -ml-0.5'
                          : d.isHoliday
                          ? 'text-blue-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {d.day}
                    </span>
                    {d.isHoliday && (
                      <span className="material-symbols-outlined text-[14px] text-blue-600">
                        celebration
                      </span>
                    )}
                  </div>

                  {!d.isWeekend && !d.isHoliday && !d.isFuture && d.hasData && (
                    <div className="flex items-center gap-1 text-[10px] truncate font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="text-slate-500 truncate hidden sm:inline">
                        {d.onTime} punt.
                      </span>
                      {d.late > 0 && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 ml-1"></span>
                          <span className="text-amber-600 truncate hidden sm:inline">{d.late} t.</span>
                        </>
                      )}
                    </div>
                  )}

                  {!d.isWeekend && !d.isHoliday && !d.isFuture && !d.hasData && (
                    <span className="text-[10px] text-slate-400 font-sans">Sin reg.</span>
                  )}

                  {d.isHoliday && (
                    <span className="text-[9px] font-bold text-blue-700 truncate">Festivo</span>
                  )}
                </div>
              );
            })}

            {trailingDays.map((nextDay) => (
              <div
                key={`next-${nextDay}`}
                className="h-16 sm:h-20 p-1.5 rounded-xl bg-slate-50/60 opacity-40 border border-slate-100 flex items-start justify-between select-none"
              >
                <span className="text-xs font-medium text-slate-400 font-mono">{nextDay}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: LISTADO Y FILTROS DE MARCACIONES (DIARIO / RANGO / EMPRESA)       */}
      {/* ========================================================================= */}
      {subView === 'events' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Panel de Filtros Superiores */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">filter_alt</span>
                  Filtros de Búsqueda Avanzada de Marcaciones
                </h3>
                <p className="text-xs text-slate-500">
                  Consulta eventos por fecha exacta, empresa del grupo, sede o colaborador en tiempo real.
                </p>
              </div>

              {/* Botones de Acción de Reporte */}
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <button
                  onClick={handleExportCSV}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  title="Descargar datos filtrados en formato CSV para Microsoft Excel"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">table_view</span>
                  Exportar CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  title="Imprimir reporte actual"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-600">print</span>
                  Imprimir
                </button>
              </div>
            </div>

            {/* Fila 1: Filtro Rápido de Fechas y Período Específico en la misma fila */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-600 mr-1">Rango Temporal:</span>
                <button
                  type="button"
                  onClick={() => handleQuickFilter('today')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    quickDateFilter === 'today'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Hoy
                </button>

                <button
                  type="button"
                  onClick={() => setQuickDateFilter('custom')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    quickDateFilter === 'custom'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Rango Personalizado
                </button>

                <button
                  type="button"
                  onClick={() => setQuickDateFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    quickDateFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Todo el Historial
                </button>
              </div>

              {quickDateFilter === 'custom' && (
                <div className="flex flex-wrap items-center gap-2.5 px-3 py-1.5 bg-blue-50/70 rounded-xl border border-blue-200/80 text-xs shadow-2xs">
                  <span className="font-bold text-blue-900">Período Específico:</span>
                  <div className="flex items-center gap-1.5">
                    <label className="text-slate-600 font-medium">Desde:</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-600 shadow-2xs"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-slate-600 font-medium">Hasta:</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold outline-none focus:border-blue-600 shadow-2xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Fila 3: Filtros por Empresa, Sede, Colaborador, Tipo y Buscador */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Filtro Empresa */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Empresa (Grupo Carmelita)
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800 focus:border-blue-600 focus:bg-white outline-none cursor-pointer"
                >
                  <option value="all">🏢 Todas las Empresas del Grupo</option>
                  {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                    <option key={emp} value={emp}>
                      {emp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Sede */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sede de Operaciones
                </label>
                <select
                  value={selectedSede}
                  onChange={(e) => setSelectedSede(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800 focus:border-blue-600 focus:bg-white outline-none cursor-pointer"
                >
                  <option value="all">📍 Todas las Sedes</option>
                  {sedes && sedes.length > 0
                    ? sedes.map((s) => (
                        <option key={s.id} value={s.nombre}>
                          {s.nombre} ({s.ciudad})
                        </option>
                      ))
                    : [
                        'Sede Principal San Borja',
                        'Sede Principal Zarate',
                        'Sede Norte Los Olivos',
                        'Sede Sur Arequipa',
                        'Almacén Central Trujillo',
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                </select>
              </div>

              {/* Filtro Colaborador */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Colaborador Específico
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-800 focus:border-blue-600 focus:bg-white outline-none cursor-pointer"
                >
                  <option value="all">👤 Todos los Colaboradores</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} (DNI: {emp.numeroDocumento || emp.pin})
                    </option>
                  ))}
                </select>
              </div>

              {/* Buscador de Texto */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Búsqueda Rápida
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    placeholder="DNI, nombre, terminal..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-blue-600 focus:bg-white outline-none"
                  />
                  {filterSearch && (
                    <button
                      onClick={() => setFilterSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Fila 4: Tipo de Marcación & Método */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Tipo de Evento:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedEventType('all')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      selectedEventType === 'all'
                        ? 'bg-white text-slate-800 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedEventType('Entrada')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      selectedEventType === 'Entrada'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Solo Entradas
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedEventType('Salida')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      selectedEventType === 'Salida'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Solo Salidas
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Método de Marcado:</span>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-blue-600"
                >
                  <option value="all">Todos los Métodos</option>
                  <option value="Huella">Huella Dactilar</option>
                  <option value="Rostro">Reconocimiento Facial</option>
                  <option value="Tarjeta RFID">Tarjeta RFID</option>
                  <option value="PIN">Código PIN</option>
                  <option value="Manual RRHH">Manual RRHH (Regularizaciones)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Barra de Resumen de Resultados */}
          <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span>
                Mostrando <strong className="text-slate-900">{filteredEvents.length}</strong> eventos de marcación
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-700 font-semibold">
                {filteredEvents.filter((e) => e.tipo === 'Entrada').length} Entradas
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-700 font-semibold">
                {filteredEvents.filter((e) => e.tipo === 'Salida').length} Salidas
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-purple-700 font-semibold">
                {filteredEvents.filter((e) => e.metodoVerificacion === 'Manual RRHH').length} Manuales RRHH
              </span>
            </div>

            {(selectedCompany !== 'all' ||
              selectedSede !== 'all' ||
              selectedEmployeeId !== 'all' ||
              selectedEventType !== 'all' ||
              selectedMethod !== 'all' ||
              filterSearch !== '' ||
              quickDateFilter !== 'today') && (
              <button
                type="button"
                onClick={() => {
                  setQuickDateFilter('today');
                  setSelectedCompany('all');
                  setSelectedSede('all');
                  setSelectedEmployeeId('all');
                  setSelectedEventType('all');
                  setSelectedMethod('all');
                  setFilterSearch('');
                }}
                className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                Restablecer Filtros
              </button>
            )}
          </div>

          {/* Tabla de Eventos de Marcación */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                  <tr>
                    <th className="px-2.5 py-2.5">Hora (Perú)</th>
                    <th className="px-2 py-2.5">Fecha</th>
                    <th className="px-2.5 py-2.5">Colaborador / Documento</th>
                    <th className="px-2 py-2.5">Empresa</th>
                    <th className="px-2 py-2.5">Sede & Terminal</th>
                    <th className="px-2 py-2.5 text-center">Tipo</th>
                    <th className="px-2 py-2.5">Método</th>
                    <th className="px-2 py-2.5">Estado / Observación</th>
                    <th className="px-2.5 py-2.5 text-right w-20">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((log) => {
                      const empInfo = getEmpInfo(log.empleadoId, log.nombreEmpleado, log.pin);
                      const isEntry = log.tipo === 'Entrada';
                      const isManual =
                        log.metodoVerificacion === 'Manual RRHH' ||
                        log.metodoVerificacion === 'Sistema' ||
                        (log.nombreDispositivo && (log.nombreDispositivo.includes('Regularizado') || log.nombreDispositivo.includes('Manual'))) ||
                        Boolean(log.motivoRegularizacion);

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-50/80 transition-colors text-[11px]"
                        >
                          {/* Hora */}
                          <td className="px-2.5 py-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isEntry ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              ></span>
                              <span>{log.hora}</span>
                            </div>
                          </td>

                          {/* Fecha */}
                          <td className="px-2 py-2 text-slate-600 whitespace-nowrap font-mono text-[10px]">
                            {log.fecha}
                          </td>

                          {/* Colaborador */}
                          <td className="px-2.5 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {empInfo.foto ? (
                                <img
                                  src={empInfo.foto}
                                  alt={empInfo.nombre}
                                  className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0">
                                  {empInfo.nombre.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-[11px] truncate max-w-[160px]" title={empInfo.nombre}>
                                  {empInfo.nombre}
                                </p>
                                <p className="text-[9px] text-slate-500 truncate max-w-[160px]">
                                  DNI: {empInfo.doc} &bull; {empInfo.cargo}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Empresa */}
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                                empInfo.empresa.includes('Carmelita')
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : empInfo.empresa.includes('Chemmer')
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}
                            >
                              {empInfo.empresa}
                            </span>
                          </td>

                          {/* Sede y Terminal */}
                          <td className="px-2 py-2 whitespace-nowrap text-slate-600">
                            <div className="font-semibold text-slate-800 text-[10px] truncate max-w-[130px]" title={log.nombreDispositivo}>
                              {log.nombreDispositivo}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate max-w-[130px]">{empInfo.sede}</div>
                          </td>

                          {/* Tipo de Marcación */}
                          <td className="px-2 py-2 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                isEntry
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[12px]">
                                {isEntry ? 'login' : 'logout'}
                              </span>
                              {log.tipo}
                            </span>
                          </td>

                          {/* Método de Verificación */}
                          <td className="px-2 py-2 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                                isManual
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : log.metodoVerificacion === 'Tarjeta RFID'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : log.metodoVerificacion === 'PIN'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : log.metodoVerificacion === 'Rostro'
                                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[12px]">
                                {isManual
                                  ? 'edit_calendar'
                                  : log.metodoVerificacion === 'Tarjeta RFID'
                                  ? 'badge'
                                  : log.metodoVerificacion === 'PIN'
                                  ? 'dialpad'
                                  : log.metodoVerificacion === 'Rostro'
                                  ? 'face'
                                  : 'fingerprint'}
                              </span>
                              {isManual ? 'Manual RRHH' : (log.metodoVerificacion || 'Huella')}
                            </span>
                          </td>

                          {/* Estado y Observaciones */}
                          <td className="px-2 py-2">
                            <div className="flex flex-col gap-0.5">
                              {(() => {
                                const status = getPunchStatusInfo(log);
                                return (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border max-w-[160px] truncate ${status.colorClass}`}
                                  >
                                    <span className="material-symbols-outlined text-[12px] shrink-0">
                                      {status.icon}
                                    </span>
                                    <span className="truncate">{status.label}</span>
                                  </span>
                                );
                              })()}
                              {log.motivoRegularizacion && (
                                <span
                                  className="text-[9px] text-slate-500 italic max-w-[150px] truncate pl-1"
                                  title={log.motivoRegularizacion}
                                >
                                  {log.motivoRegularizacion}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Acciones de Edición, Auditoría y Anulación */}
                          <td className="px-2.5 py-2 whitespace-nowrap text-right w-24">
                            <div className="flex items-center justify-end gap-0.5">
                              {/* Botón Ver Bitácora de Auditoría */}
                              <button
                                type="button"
                                onClick={() => {
                                  setAuditTrailPunch(log);
                                  setIsAuditTrailModalOpen(true);
                                }}
                                className="p-1 text-purple-600 hover:bg-purple-50 rounded-md transition-colors cursor-pointer relative"
                                title="Ver bitácora de auditoría e historial de cambios"
                              >
                                <span className="material-symbols-outlined text-[16px]">history_edu</span>
                                {log.historialAuditoria && log.historialAuditoria.length > 0 && (
                                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-600 ring-2 ring-white"></span>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPunch(log);
                                  setIsEditPunchModalOpen(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                title="Editar hora, fecha o tipo de marcación"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingPunchLog(log)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                title="Anular este registro de marcación"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[36px] text-slate-300">
                            event_busy
                          </span>
                          <p className="font-bold text-slate-600">
                            No se encontraron marcaciones para los filtros seleccionados
                          </p>
                          <p className="text-xs text-slate-400 max-w-md">
                            Verifica la fecha elegida, la empresa del Grupo Carmelita o cambia el filtro a "Todo el Historial".
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: CONSOLIDADO DE INCIDENCIAS & OMISIONES DE MARCACIÓN              */}
      {/* ========================================================================= */}
      {subView === 'anomalies' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[22px]">warning_amber</span>
                  Consolidado Diario de Omisiones e Inasistencias
                </h3>
                <p className="text-xs text-slate-500">
                  Detección inteligente de colaboradores con Omisión de Entrada, Omisión de Salida o Falta.
                </p>
              </div>
              {onOpenManualPunchModal && (
                <button
                  type="button"
                  onClick={onOpenManualPunchModal}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all hover:shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                  Regularización Extemporánea (RRHH)
                </button>
              )}
            </div>

            {/* Barra de Filtros de Fecha & Empresa para Detección de Anomalías */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold text-slate-700">Fecha a Evaluar:</span>
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setAnomalyDate(todayStr)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      anomalyDate === todayStr ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnomalyDate(yesterdayStr)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      anomalyDate === yesterdayStr ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Ayer
                  </button>
                  <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">calendar_today</span>
                    <input
                      type="date"
                      value={anomalyDate}
                      max={todayStr}
                      onChange={(e) => setAnomalyDate(e.target.value)}
                      className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Tipo de Incidencia:</span>
                  <select
                    value={anomalyTypeFilter}
                    onChange={(e) => setAnomalyTypeFilter(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-blue-600 shadow-2xs"
                  >
                    <option value="all">Todas las Incidencias ({allIncidenciasDiarias.length})</option>
                    <option value="OMISION_SALIDA">Omisión de Salida</option>
                    <option value="OMISION_ENTRADA">Omisión de Entrada</option>
                    <option value="INASISTENCIA">Inasistencias / Faltas</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Empresa:</span>
                  <select
                    value={anomalyCompany}
                    onChange={(e) => setAnomalyCompany(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer focus:border-blue-600 shadow-2xs"
                  >
                    <option value="all">🏢 Todas las Empresas</option>
                    {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                      <option key={emp} value={emp}>
                        {emp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabla de Incidencias */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Colaborador / Documento</th>
                    <th className="p-3">Empresa (Grupo Carmelita)</th>
                    <th className="p-3">Tipo de Incidencia</th>
                    <th className="p-3">Detalle / Diagnóstico Biométrico</th>
                    <th className="p-3 text-right">Acción RRHH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incidenciasDiarias.length > 0 ? (
                    incidenciasDiarias.map((inc) => {
                      const isFalta = inc.tipoIncidencia === 'INASISTENCIA';
                      const isOmisionSalida = inc.tipoIncidencia === 'OMISION_SALIDA';

                      return (
                        <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">{inc.fecha}</td>
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{inc.nombreEmpleado}</p>
                            <p className="text-[10px] text-slate-500">DNI: {inc.doc} • {inc.cargo}</p>
                          </td>
                          <td className="p-3 font-medium text-slate-700">{inc.empresa}</td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                isFalta
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : isOmisionSalida
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-orange-50 text-orange-800 border-orange-200'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {isFalta ? 'person_off' : isOmisionSalida ? 'logout' : 'login'}
                              </span>
                              {isFalta ? 'INASISTENCIA / FALTA' : isOmisionSalida ? 'OMISIÓN DE SALIDA' : 'OMISIÓN DE ENTRADA'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 text-[11px]">{inc.detalle}</td>
                          <td className="p-3 text-right">
                            {onOpenManualPunchModal && (
                              <button
                                type="button"
                                onClick={onOpenManualPunchModal}
                                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">edit</span>
                                Regularizar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[36px] text-emerald-500">
                            task_alt
                          </span>
                          <p className="font-bold text-slate-700 text-sm">
                            ¡Excelente! No se detectaron omisiones ni inasistencias para {anomalyDate === todayStr ? 'el día de hoy' : `el día ${anomalyDate}`}.
                          </p>
                          <p className="text-xs text-slate-500 max-w-md">
                            {anomalyDate === todayStr
                              ? 'Los colaboradores que registraron su ingreso se encuentran laborando activamente dentro de su jornada laboral.'
                              : 'Todas las marcaciones del personal se completaron correctamente o no presentan inconsistencias pendientes de regularización.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Day Detail Dialog (Al hacer clic en un día del calendario) */}
      {selectedDayDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold font-headline text-slate-900">
                  {selectedDayDetail.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDayDetail.isHoliday
                    ? selectedDayDetail.holidayName
                    : 'Reporte diario consolidado de accesos biométricos.'}
                </p>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {!selectedDayDetail.isHoliday ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60">
                    <p className="font-bold text-lg text-emerald-700">{selectedDayDetail.onTime}</p>
                    <p className="text-[11px] text-emerald-700 font-semibold">Puntuales</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60">
                    <p className="font-bold text-lg text-amber-700">{selectedDayDetail.late}</p>
                    <p className="text-[11px] text-amber-700 font-semibold">Tardanzas</p>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200/60">
                    <p className="font-bold text-lg text-rose-700">{selectedDayDetail.absent}</p>
                    <p className="text-[11px] text-rose-700 font-semibold">Faltas</p>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="font-bold text-slate-800 text-xs mb-2">
                    Primeras marcaciones registradas de este día:
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    {(() => {
                      const dayLogs = (punchLogs || []).filter(
                        (log) => log.fecha === selectedDayDetail.dateStr
                      );
                      if (dayLogs.length === 0) {
                        return (
                          <li className="p-3 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                            Sin eventos biométricos registrados para esta fecha
                          </li>
                        );
                      }
                      return dayLogs.slice(0, 8).map((log) => {
                        const info = getEmpInfo(log.empleadoId, log.nombreEmpleado, log.pin);
                        return (
                          <li
                            key={log.id}
                            className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100"
                          >
                            <span>
                              <strong className="font-mono text-slate-800">{log.hora}</strong> &bull; {info.nombre} ({log.nombreDispositivo})
                            </span>
                            <span
                              className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                                log.esError
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : log.estado.toLowerCase().includes('tardanza')
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                            {log.estado}
                          </span>
                        </li>
                      );
                    });
                  })()}
                  </ul>
                </div>

                {/* Botón para saltar al listado detallado de este día */}
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom(selectedDayDetail.dateStr);
                    setDateTo(selectedDayDetail.dateStr);
                    setQuickDateFilter('custom');
                    setSubView('events');
                    setSelectedDayDetail(null);
                  }}
                  className="w-full mt-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">list_alt</span>
                  Ver eventos detallados de este día
                </button>
              </div>
            ) : (
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-center space-y-2">
                <span className="material-symbols-outlined text-[32px] text-blue-600">
                  celebration
                </span>
                <p className="font-bold text-sm text-blue-800">{selectedDayDetail.holidayName}</p>
                <p className="text-xs text-slate-500">
                  Día no laborable remunerado. Sin penalidades por ausencia.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* VISTA 4: GESTIÓN Y APROBACIÓN DE HORAS EXTRAS (OVERTIME - LEY D.L. 728)    */}
      {/* ========================================================================= */}
      {/* VISTA 4: APROBACIÓN DE HORAS EXTRAS (LEY D.L. 728)                        */}
      {/* ========================================================================= */}
      {subView === 'overtime' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Tarjetas KPI de Horas Extras para el período seleccionado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <span className="material-symbols-outlined text-[22px]">schedule</span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Solicitudes HE</p>
                <p className="text-xl font-extrabold text-slate-900 font-headline">{filteredOvertimeList.length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <span className="material-symbols-outlined text-[22px]">pending</span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pendientes RRHH</p>
                <p className="text-xl font-extrabold text-amber-600 font-headline">
                  {filteredOvertimeList.filter((h) => h.estado === 'Pendiente').length}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Aprobadas Nómina</p>
                <p className="text-xl font-extrabold text-emerald-600 font-headline">
                  {filteredOvertimeList.filter((h) => h.estado === 'Aprobado').length}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <span className="material-symbols-outlined text-[22px]">cancel</span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rechazadas / Canje</p>
                <p className="text-xl font-extrabold text-rose-600 font-headline">
                  {filteredOvertimeList.filter((h) => h.estado === 'Rechazado' || h.estado === 'Compensado').length}
                </p>
              </div>
            </div>
          </div>

          {/* Barra de Filtros con Selector de Mes y Año */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={overtimeSearch}
                  onChange={(e) => setOvertimeSearch(e.target.value)}
                  placeholder="Buscar por colaborador o DNI..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-2xs"
                />
              </div>

              {/* Selector de Mes */}
              <select
                value={overtimeMonth}
                onChange={(e) => setOvertimeMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
              >
                <option value="all">📅 Todos los Meses</option>
                {MESES.map((mes, idx) => (
                  <option key={mes} value={idx}>
                    {mes}
                  </option>
                ))}
              </select>

              {/* Selector de Año */}
              <select
                value={overtimeYear}
                onChange={(e) => setOvertimeYear(Number(e.target.value))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-800 outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
              >
                {AÑOS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={overtimeFilter}
              onChange={(e) => setOvertimeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none font-semibold cursor-pointer shadow-2xs"
            >
              <option value="all">Todos los Estados ({filteredOvertimeList.length})</option>
              <option value="Pendiente">🟡 Pendientes de Aprobación</option>
              <option value="Aprobado">🟢 Aprobadas para Pago</option>
              <option value="Rechazado">🔴 Rechazadas</option>
              <option value="Compensado">🔵 Canje por Descanso</option>
            </select>
          </div>

          {/* Tabla de Horas Extras */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Colaborador / DNI</th>
                    <th className="p-3.5">Fecha & Sede</th>
                    <th className="p-3.5">Programado vs. Marcado</th>
                    <th className="p-3.5">Tiempo Excedente</th>
                    <th className="p-3.5">Sobretasa Legal</th>
                    <th className="p-3.5">Estado / Resolución</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOvertimeList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 block">
                          more_time
                        </span>
                        <p className="text-xs font-semibold text-slate-700">
                          No se registran horas extras para {overtimeMonth === 'all' ? `el año ${overtimeYear}` : `${MESES[overtimeMonth]} ${overtimeYear}`}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Seleccione otro mes o verifique que existan marcaciones de salida que excedan el horario regular.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredOvertimeList.map((he) => {
                      const hrs = Math.floor(he.minutosDetectados / 60);
                      const mins = he.minutosDetectados % 60;
                      const textoTiempo = `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;

                      return (
                        <tr key={he.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900 leading-tight">{he.nombreEmpleado}</p>
                            <p className="text-[11px] text-slate-400 font-mono">DNI: {he.documentoEmpleado || 'Sin registro'}</p>
                          </td>

                          <td className="p-3.5">
                            <p className="font-mono text-slate-800 font-bold">{he.fecha}</p>
                            <p className="text-[11px] text-slate-500">{he.sede || 'Sede Principal'}</p>
                          </td>

                          <td className="p-3.5">
                            <p className="font-mono text-[11px] text-slate-700">
                              Prog: <span className="font-bold">{he.horaSalidaProgramada}</span>
                            </p>
                            <p className="font-mono text-[11px] text-blue-700 font-bold">
                              Marcado: {he.horaSalidaMarcada}
                            </p>
                          </td>

                          <td className="p-3.5 font-mono text-xs font-extrabold text-purple-700 bg-purple-50/40">
                            +{textoTiempo} ({he.minutosDetectados} min)
                          </td>

                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                              Ley D.L. 728 ({he.tipoHe})
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                he.estado === 'Aprobado'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : he.estado === 'Pendiente'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : he.estado === 'Compensado'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  he.estado === 'Aprobado'
                                    ? 'bg-emerald-500'
                                    : he.estado === 'Pendiente'
                                    ? 'bg-amber-500'
                                    : he.estado === 'Compensado'
                                    ? 'bg-blue-500'
                                    : 'bg-rose-500'
                                }`}
                              ></span>
                              {he.estado === 'Aprobado'
                                ? `Aprobado (${he.minutosAprobados} min)`
                                : he.estado === 'Pendiente'
                                ? 'Pendiente Evaluación'
                                : he.estado === 'Compensado'
                                ? 'Canje por Descanso'
                                : 'Rechazado'}
                            </span>
                            {he.motivoRechazo && (
                              <p className="text-[10px] text-rose-600 mt-1 italic font-sans max-w-xs">{he.motivoRechazo}</p>
                            )}
                          </td>

                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOvertimeItem(he);
                                setIsOvertimeModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1 mx-auto"
                            >
                              <span className="material-symbols-outlined text-[16px]">gavel</span>
                              Evaluar / Resolver
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Evaluación y Resolución de Horas Extras */}
      <ApproveOvertimeModal
        isOpen={isOvertimeModalOpen}
        onClose={() => {
          setIsOvertimeModalOpen(false);
          setSelectedOvertimeItem(null);
        }}
        overtimeItem={selectedOvertimeItem}
        onProcessOvertime={(id, action, minutosAprobados, tipoHe, motivoRechazo) => {
          setOvertimeList((prev) => {
            const exists = prev.some((item) => item.id === id);
            if (exists) {
              return prev.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      estado: action,
                      minutosAprobados,
                      tipoHe,
                      motivoRechazo: motivoRechazo || item.motivoRechazo,
                      aprobadoPor: 'RRHH Carmelita',
                      actualizadoEn: new Date().toISOString().split('T')[0],
                    }
                  : item
              );
            } else {
              const dynamicItem = resolvedOvertimeList.find((item) => item.id === id);
              if (dynamicItem) {
                return [
                  {
                    ...dynamicItem,
                    estado: action,
                    minutosAprobados,
                    tipoHe,
                    motivoRechazo: motivoRechazo || dynamicItem.motivoRechazo,
                    aprobadoPor: 'RRHH Carmelita',
                    actualizadoEn: new Date().toISOString().split('T')[0],
                  },
                  ...prev,
                ];
              }
              return prev;
            }
          });
        }}
      />

      {/* Modal de Edición de Marcaciones */}
      <EditPunchModal
        isOpen={isEditPunchModalOpen}
        onClose={() => {
          setIsEditPunchModalOpen(false);
          setEditingPunch(null);
        }}
        punch={editingPunch}
        employees={employees}
        onSavePunch={(updatedPunch) => {
          if (onUpdatePunchLog) {
            onUpdatePunchLog(updatedPunch);
          }
        }}
      />

      {/* Modal de Confirmación de Eliminación de Marcación */}
      {deletingPunchLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-headline">Eliminar Marcación</h3>
                <p className="text-xs text-slate-500">Esta acción removerá el registro permanentemente.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">
                {getEmpInfo(deletingPunchLog.empleadoId, deletingPunchLog.nombreEmpleado, deletingPunchLog.pin).nombre}
              </p>
              <p className="text-slate-600">
                {deletingPunchLog.fecha} &bull; <strong className="font-mono">{deletingPunchLog.hora}</strong> &bull; {deletingPunchLog.tipo}
              </p>
              <p className="text-[11px] text-slate-400">Método: {deletingPunchLog.metodoVerificacion || 'Huella'}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPunchLog(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeletePunchLog) {
                    onDeletePunchLog(deletingPunchLog.id);
                  }
                  setDeletingPunchLog(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Sí, Anular / Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bitácora de Auditoría e Historial de Cambios */}
      <AuditTrailModal
        isOpen={isAuditTrailModalOpen}
        onClose={() => {
          setIsAuditTrailModalOpen(false);
          setAuditTrailPunch(null);
        }}
        punch={auditTrailPunch}
      />
    </div>
  );
};
