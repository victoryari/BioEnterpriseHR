import {
  Empleado,
  Dispositivo,
  MarcacionAsistencia,
  SolicitudPermiso,
  DiaFestivo,
  HorarioTrabajo,
  Turno,
  AsignacionTurno,
  ReglasAsistencia,
  Sede,
  Departamento,
  UsuarioSistema,
} from '../types';
import {
  FERIADOS_PERU_2026,
  REGLAS_ASISTENCIA_DEFAULT,
} from '../data/mockData';

const KEYS = {
  EMPLOYEES: 'bioenterprise_employees_v2',
  DEVICES: 'bioenterprise_devices_v2',
  PUNCH_LOGS: 'bioenterprise_punch_logs_v2',
  LEAVE_REQUESTS: 'bioenterprise_leave_requests_v2',
  HOLIDAYS: 'bioenterprise_holidays_v2',
  TIMETABLES: 'bioenterprise_timetables_v2',
  SHIFTS: 'bioenterprise_shifts_v2',
  SHIFT_ASSIGNMENTS: 'bioenterprise_shift_assignments_v2',
  ATTENDANCE_RULES: 'bioenterprise_attendance_rules_v2',
  SEDES: 'bioenterprise_sedes_v2',
  DEPARTAMENTOS: 'bioenterprise_departamentos_v2',
  SYSTEM_USERS: 'bioenterprise_system_users_v2',
};

export const storageService = {
  // Empleados
  getEmployees: (): Empleado[] => {
    try {
      const data = localStorage.getItem(KEYS.EMPLOYEES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveEmployees: (employees: Empleado[]): void => {
    try {
      localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
    } catch (e) {
      console.error('Error al guardar empleados en localStorage', e);
    }
  },

  // Dispositivos
  getDevices: (): Dispositivo[] => {
    try {
      const data = localStorage.getItem(KEYS.DEVICES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveDevices: (devices: Dispositivo[]): void => {
    try {
      localStorage.setItem(KEYS.DEVICES, JSON.stringify(devices));
    } catch (e) {
      console.error('Error al guardar dispositivos en localStorage', e);
    }
  },

  // Marcaciones
  getPunchLogs: (): MarcacionAsistencia[] => {
    try {
      const data = localStorage.getItem(KEYS.PUNCH_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  savePunchLogs: (logs: MarcacionAsistencia[]): void => {
    try {
      localStorage.setItem(KEYS.PUNCH_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Error al guardar marcaciones en localStorage', e);
    }
  },

  // Solicitudes de Permiso
  getLeaveRequests: (): SolicitudPermiso[] => {
    try {
      const data = localStorage.getItem(KEYS.LEAVE_REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveLeaveRequests: (requests: SolicitudPermiso[]): void => {
    try {
      localStorage.setItem(KEYS.LEAVE_REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.error('Error al guardar solicitudes en localStorage', e);
    }
  },

  // Días Festivos
  getHolidays: (): DiaFestivo[] => {
    try {
      const data = localStorage.getItem(KEYS.HOLIDAYS);
      return data ? JSON.parse(data) : FERIADOS_PERU_2026;
    } catch {
      return FERIADOS_PERU_2026;
    }
  },
  saveHolidays: (holidays: DiaFestivo[]): void => {
    try {
      localStorage.setItem(KEYS.HOLIDAYS, JSON.stringify(holidays));
    } catch (e) {
      console.error('Error al guardar feriados en localStorage', e);
    }
  },

  // Horarios (Timetables)
  getTimetables: (): HorarioTrabajo[] => {
    try {
      const data = localStorage.getItem(KEYS.TIMETABLES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveTimetables: (timetables: HorarioTrabajo[]): void => {
    try {
      localStorage.setItem(KEYS.TIMETABLES, JSON.stringify(timetables));
    } catch (e) {
      console.error('Error al guardar horarios en localStorage', e);
    }
  },

  // Turnos (Shifts)
  getShifts: (): Turno[] => {
    try {
      const data = localStorage.getItem(KEYS.SHIFTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveShifts: (shifts: Turno[]): void => {
    try {
      localStorage.setItem(KEYS.SHIFTS, JSON.stringify(shifts));
    } catch (e) {
      console.error('Error al guardar turnos en localStorage', e);
    }
  },

  // Asignaciones de Turnos a Empleados
  getShiftAssignments: (): AsignacionTurno[] => {
    try {
      const data = localStorage.getItem(KEYS.SHIFT_ASSIGNMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveShiftAssignments: (assignments: AsignacionTurno[]): void => {
    try {
      localStorage.setItem(KEYS.SHIFT_ASSIGNMENTS, JSON.stringify(assignments));
    } catch (e) {
      console.error('Error al guardar asignaciones de turno en localStorage', e);
    }
  },

  // Reglas y Políticas de Asistencia (Perú)
  getAttendanceRules: (): ReglasAsistencia => {
    try {
      const data = localStorage.getItem(KEYS.ATTENDANCE_RULES);
      return data ? JSON.parse(data) : REGLAS_ASISTENCIA_DEFAULT;
    } catch {
      return REGLAS_ASISTENCIA_DEFAULT;
    }
  },
  saveAttendanceRules: (rules: ReglasAsistencia): void => {
    try {
      localStorage.setItem(KEYS.ATTENDANCE_RULES, JSON.stringify(rules));
    } catch (e) {
      console.error('Error al guardar reglas de asistencia en localStorage', e);
    }
  },

  // Sedes / Sucursales
  getSedes: (): Sede[] => {
    try {
      const data = localStorage.getItem(KEYS.SEDES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveSedes: (sedes: Sede[]): void => {
    try {
      localStorage.setItem(KEYS.SEDES, JSON.stringify(sedes));
    } catch (e) {
      console.error('Error al guardar sedes en localStorage', e);
    }
  },

  // Departamentos / Áreas
  getDepartamentos: (): Departamento[] => {
    try {
      const data = localStorage.getItem(KEYS.DEPARTAMENTOS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveDepartamentos: (departamentos: Departamento[]): void => {
    try {
      localStorage.setItem(KEYS.DEPARTAMENTOS, JSON.stringify(departamentos));
    } catch (e) {
      console.error('Error al guardar departamentos en localStorage', e);
    }
  },

  // Usuarios del Sistema y Roles (RBAC)
  getSystemUsers: (): UsuarioSistema[] => {
    try {
      const data = localStorage.getItem(KEYS.SYSTEM_USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveSystemUsers: (users: UsuarioSistema[]): void => {
    try {
      localStorage.setItem(KEYS.SYSTEM_USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error al guardar usuarios del sistema en localStorage', e);
    }
  },

  getCurrentAdminId: (): string => {
    try {
      return localStorage.getItem('bioenterprise_current_admin_id_v2') || '';
    } catch {
      return '';
    }
  },
  saveCurrentAdminId: (id: string): void => {
    try {
      localStorage.setItem('bioenterprise_current_admin_id_v2', id);
    } catch (e) {
      console.error('Error al guardar currentAdminId en localStorage', e);
    }
  },
};
