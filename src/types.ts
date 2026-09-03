export type ViewMode =
  | 'login'
  | 'overview'
  | 'hardware'
  | 'personnel'
  | 'users-roles'
  | 'master-tables'
  | 'insights'
  | 'attendance'
  | 'shifts-rules'
  | 'payroll'
  | 'self-service';

export type ModoVista = ViewMode;

// -----------------------------------------------------------------------------
// Dispositivo / Reloj Marcador Biométrico
// -----------------------------------------------------------------------------
export interface Dispositivo {
  id: string;
  numeroSerie: string;
  nombre: string;
  ubicacion: string;
  ip: string;
  puerto?: number;
  claveComunicacion?: number;
  protocolo: 'ADMS' | 'Autónomo' | 'Push SDK';
  estado: 'online' | 'offline' | 'error';
  ultimoPulso: string;
  conteoUsuarios: number;
  conteoRegistros: number;
  firmware: string;
}

// -----------------------------------------------------------------------------
// Sedes y Departamentos Organizacionales
// -----------------------------------------------------------------------------
export interface Sede {
  id: string;
  nombre: string;
  ciudad: string;
  direccion?: string;
  activo: boolean;
}

export interface Departamento {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

// -----------------------------------------------------------------------------
// Empresas del Grupo Carmelita (Perú)
// -----------------------------------------------------------------------------
export const EMPRESAS_GRUPO_CARMELITA = [
  'Importaciones Carmelita del Norte S.A.C.',
  'Grupo Chemmer Perú S.A.C.',
  'León Plast S.A.C.',
] as const;

export type EmpresaGrupoCarmelita = typeof EMPRESAS_GRUPO_CARMELITA[number];

// -----------------------------------------------------------------------------
// Empleado / Colaborador (Localizado para Perú: DNI, Teléfono +51, etc.)
// -----------------------------------------------------------------------------
export interface Empleado {
  id: string;
  nombres?: string;
  apellidos?: string;
  nombre: string;
  tipoDocumento?: 'DNI' | 'CE' | 'Pasaporte';
  numeroDocumento?: string; // DNI 8 dígitos
  pin: string; // Marcado por PIN en teclado
  numeroTarjeta?: string; // Marcado por Tarjeta de Proximidad RFID
  tarjetaRfid?: boolean; // Posee tarjeta RFID asignada
  biometriaHuella: boolean; // Posee huella enrolada
  biometriaRostro: boolean; // Posee rostro enrolado
  tipoMarcadoPredilecto?: 'Huella' | 'Tarjeta RFID' | 'PIN' | 'Rostro';
  correo: string;
  cargo: string;
  departamento: string;
  sede: string;
  empresa?: string; // Importaciones Carmelita del Norte SAC | Grupo Chemmer Perú SAC | León Plast SAC
  estado: 'Activo' | 'Inactivo';
  foto: string;
  conteoHuellas: number;
  rostroActualizado: string;
  accesoPuertas: {
    entradaPrincipal: boolean;
    centroDatos: boolean;
    almacen?: boolean;
  };
  telefono?: string; // +51 9XX XXX XXX
  direccion?: string; // Dirección domiciliaria
  fechaNacimiento?: string; // Fecha de nacimiento
  fechaIngreso?: string;
  fechaCese?: string;
  sueldoBase?: number; // Monto en Soles (PEN S/.)
  regimenPrevisional?: string;
  tipoComisionAfp?: 'Flujo' | 'Mixta';
  cuspp?: string;
  tieneAsignacionFamiliar?: boolean;
  bancoSueldo?: string;
  numeroCuentaBanco?: string;
  cci?: string;
  bancoCts?: string;
  numeroCuentaCts?: string;
  monedaCts?: 'PEN' | 'USD';
}

// -----------------------------------------------------------------------------
// Bitácora / Traza de Auditoría de Marcación
// -----------------------------------------------------------------------------
export interface LogAuditoriaMarcacion {
  id: string;
  marcacionId: string;
  fechaHoraCambio: string; // YYYY-MM-DD HH:mm:ss
  usuarioResponsable: string; // Ej. "admin@carmelita.pe (Gestor RRHH)"
  accion: 'CREACION_MANUAL' | 'EDICION' | 'ANULACION';
  valoresAnteriores?: {
    fecha: string;
    hora: string;
    tipo: string;
    metodo: string;
    estado?: string;
  };
  valoresNuevos?: {
    fecha: string;
    hora: string;
    tipo: string;
    metodo: string;
    estado?: string;
  };
  motivoSustento: string;
}

// -----------------------------------------------------------------------------
// Marcación de Asistencia / Fichaje Biométrico
// -----------------------------------------------------------------------------
export interface MarcacionAsistencia {
  id: string;
  hora: string;
  fecha: string;
  empleadoId: string;
  nombreEmpleado: string;
  pin: string;
  numeroTarjeta?: string; // Código de tarjeta RFID leída
  dispositivoId: string;
  nombreDispositivo: string;
  empresa?: string;
  sede?: string;
  tipo: 'Entrada' | 'Salida';
  estado: 'Escaneo exitoso' | 'Tiempo de espera agotado' | 'Sincronización' | 'No reconocido' | 'Regularizado por RRHH' | 'Anulado por RRHH';
  metodoVerificacion?: 'Huella' | 'Tarjeta RFID' | 'PIN' | 'Rostro' | 'Sistema' | 'Manual RRHH';
  esError?: boolean;
  motivoRegularizacion?: string;
  regularizadoPor?: string;
  historialAuditoria?: LogAuditoriaMarcacion[];
}

// -----------------------------------------------------------------------------
// Solicitud de Permiso, Vacaciones o Descanso Médico
// -----------------------------------------------------------------------------
export interface SolicitudPermiso {
  id: string;
  empleadoId?: string;
  tipo: 'Vacaciones' | 'Descanso Médico' | 'Permiso' | 'Compensación';
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  nombreDocumento?: string;
  rutaDocumento?: string;
  estado: 'Aprobado' | 'Pendiente' | 'Rechazado';
  fechaSolicitud: string;
  nombreEmpleado: string;
}

// -----------------------------------------------------------------------------
// Día Festivo / Feriado
// -----------------------------------------------------------------------------
export interface DiaFestivo {
  id?: number;
  nombre: string;
  fecha: string;
  esRecurrente: boolean;
}

// -----------------------------------------------------------------------------
// Día del Calendario de Asistencia
// -----------------------------------------------------------------------------
export interface DiaAsistencia {
  dia: number;
  fecha: string;
  esMesActual: boolean;
  esHoy?: boolean;
  estado?: 'normal' | 'late' | 'absence' | 'holiday' | 'leave';
  tasaAsistencia?: number;
  conteoPuntuales?: number;
  conteoTardanzas?: number;
  conteoFaltas?: number;
  nombreFestivo?: string;
}

// -----------------------------------------------------------------------------
// Notificaciones Toast
// -----------------------------------------------------------------------------
export interface MensajeNotificacion {
  id: string;
  titulo?: string;
  descripcion?: string;
  tipo?: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

// -----------------------------------------------------------------------------
// Horarios de Trabajo (Timetables)
// -----------------------------------------------------------------------------
export interface HorarioTrabajo {
  id: string;
  nombre: string;
  horaEntrada: string; // "08:30"
  ventanaEntradaDesde?: string; // ej. "06:30"
  ventanaEntradaHasta?: string; // ej. "12:00"
  horaSalida: string; // "17:30"
  ventanaSalidaDesde?: string; // ej. "12:01"
  ventanaSalidaHasta?: string; // ej. "23:59"
  minutosTolerancia: number; // Ej: 15 min de gracia
  inicioRefrigerio?: string; // "13:00"
  finRefrigerio?: string; // "14:00"
  minutosRefrigerio: number; // 60 min
  marcadoRefrigerioObligatorio: boolean;
  colorTag?: string; // Color distintivo para la interfaz
}

// -----------------------------------------------------------------------------
// Turnos y Programación Semanal
// -----------------------------------------------------------------------------
export interface TurnoDia {
  diaSemana: number; // 1 = Lunes, 2 = Martes ... 7 = Domingo
  nombreDia: string;
  horarioId: string | null; // null si es día de descanso
  esLaborable: boolean;
}

export interface Turno {
  id: string;
  nombre: string;
  tipo: 'Fijo' | 'Rotativo' | 'Flexible';
  descripcion: string;
  dias: TurnoDia[];
  activo: boolean;
}

// -----------------------------------------------------------------------------
// Asignación de Turnos a Empleados
// -----------------------------------------------------------------------------
export interface AsignacionTurno {
  id: string;
  empleadoId: string;
  turnoId: string;
  fechaInicio: string;
  fechaFin?: string;
}

// -----------------------------------------------------------------------------
// Reglas y Políticas de Asistencia (Leyes Laborales de Perú)
// -----------------------------------------------------------------------------
export interface ReglasAsistencia {
  id?: string;
  minutosGraciaIngreso: number; // Minutos de tolerancia sin descuento (ej. 10)
  toleranciaMaximaMinutos: number; // Límite tras el cual se considera inasistencia injustificada (ej. 45)
  sobretasaHePrimerasDos: number; // Por ley peruana: 25%
  sobretasaHeRestantes: number; // Por ley peruana: 35%
  sobretasaFeriadoDomingo: number; // Por ley peruana: 100%
  diasVacacionesAnuales: number; // Por D.L. 728 / 1405: 30 días
  minimoDiasBloqueVacaciones: number; // Bloque continuo mínimo (7 o 15 días)
  minimoDiasFraccionados: number; // Mínimo para días sueltos (1 día)
  inicioJornadaNocturna: string; // 22:00
  finJornadaNocturna: string; // 06:00
  sobretasaNocturna: number; // 35% sobre RMV
  remuneracionMinimaVital: number; // RMV Perú 2026: S/ 1,130.00
  pisoMinimoNocturno: number; // Piso legal: RMV (1,130) + 35% (395.50) = S/ 1,525.50
  minutosMinimosParaHoraExtra?: number; // Umbral mínimo para computar HE (ej. 30 min)
  requiereAprobacionPreviaHE?: boolean; // Exige autorización previa por jefatura
}

export interface SolicitudHoraExtra {
  id: string;
  empleadoId: string;
  nombreEmpleado: string;
  documentoEmpleado?: string;
  sede?: string;
  empresa?: string;
  fecha: string;
  horaSalidaProgramada: string;
  horaSalidaMarcada: string;
  minutosDetectados: number;
  minutosAprobados: number;
  tipoHe: '25%' | '35%' | '100%' | 'Mixto';
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Compensado';
  motivoRechazo?: string;
  aprobadoPor?: string;
  actualizadoEn?: string;
}

// -----------------------------------------------------------------------------
// Usuarios del Sistema y Roles de Acceso (RBAC)
// -----------------------------------------------------------------------------
export type RolSistema =
  | 'Super Administrador'
  | 'Gestor de RRHH'
  | 'Supervisor de Sede'
  | 'Colaborador';

export interface UsuarioSistema {
  id: string;
  nombre: string;
  correo: string;
  foto?: string;
  rol: RolSistema;
  empresaAsignada: string; // 'Todas' o razón social de Grupo Carmelita
  sedeAsignada: string; // 'Todas' o sede específica
  estado: 'Activo' | 'Inactivo';
  ultimoAcceso?: string;
  creadoEn: string;
}

// -----------------------------------------------------------------------------
// Módulo de Nóminas y Boletas de Pago (Normativa Peruana)
// -----------------------------------------------------------------------------
export interface AFPTasa {
  id: number;
  nombre: string;
  aporte_obligatorio: number;
  comision_flujo: number;
  comision_mixta: number;
  prima_seguro: number;
  activo: boolean;
}

export interface DatosLaboralesEmpleado {
  empleado_id: string;
  sueldo_basico: number;
  tiene_asignacion_familiar: boolean;
  regimen_previsional: string;
  tipo_comision_afp: 'Flujo' | 'Mixta';
  cuspp?: string;
  regimen_laboral: string;
  banco_sueldo: string;
  numero_cuenta_banco?: string;
  cci?: string;
  banco_cts?: string;
  numero_cuenta_cts?: string;
  moneda_cts?: 'PEN' | 'USD';
  fecha_ingreso?: string;
  fecha_cese?: string;
}

export interface PlanillaMensual {
  id: string;
  periodo: string;
  empresa: string;
  estado: 'Borrador' | 'Procesado' | 'Cerrado';
  total_ingresos: number;
  total_descuentos: number;
  total_aportes_empleador: number;
  total_neto_pagar: number;
  conteo_trabajadores: number;
  creado_en?: string;
}

export interface PlanillaDetalle {
  id: string;
  planilla_id: string;
  empleado_id: string;
  nombre_empleado: string;
  numero_documento: string;
  cargo: string;
  sueldo_basico: number;
  asignacion_familiar: number;
  monto_horas_extras_25: number;
  monto_horas_extras_35: number;
  bonificaciones: number;
  total_ingresos: number;
  dias_trabajados: number;
  minutos_tardanza: number;
  descuento_tardanzas: number;
  dias_inasistencia: number;
  descuento_inasistencias: number;
  afp_onp_nombre: string;
  descuento_pension: number;
  descuento_ir5ta: number;
  otros_descuentos: number;
  total_descuentos: number;
  sueldo_neto: number;
  aporte_essalud: number;
  aporte_sctr: number;
}

export interface BoletaPago {
  id: string;
  planilla_detalle_id: string;
  empleado_id: string;
  nombre_empleado: string;
  numero_documento: string;
  cargo: string;
  periodo: string;
  empresa: string;
  sueldo_basico: number;
  total_ingresos: number;
  total_descuentos: number;
  sueldo_neto: number;
  token_seguridad: string;
  estado_entrega: 'Emitida' | 'Enviada' | 'Firmada';
  fecha_emision: string;
}

export interface UtilidadAnual {
  id: string;
  ejercicio_fiscal: number;
  empresa: string;
  renta_neta_empresa: number;
  porcentaje_sector: number;
  monto_total_distribuir: number;
  monto_50_dias: number;
  monto_50_remuneraciones: number;
  total_dias_empresa: number;
  total_remuneraciones_empresa: number;
  factor_dias: number;
  factor_remuneraciones: number;
  conteo_trabajadores: number;
  estado: string;
  creado_en?: string;
  detalles?: UtilidadDetalle[];
}

export interface UtilidadDetalle {
  id: string;
  utilidad_id: string;
  empleado_id: string;
  nombre_empleado: string;
  numero_documento: string;
  cargo: string;
  dias_laborados_trabajador: number;
  monto_por_dias: number;
  remuneracion_anual_trabajador: number;
  monto_por_remuneracion: number;
  utilidad_bruta: number;
  excedente_tope_18_sueldos: number;
  utilidad_computable: number;
  descuento_ir5ta: number;
  utilidad_neta_pagar: number;
  banco_abono?: string;
  numero_cuenta_abono?: string;
}

export interface LiquidacionCese {
  id: string;
  empleado_id: string;
  nombre_empleado: string;
  numero_documento: string;
  empresa: string;
  cargo: string;
  fecha_ingreso: string;
  fecha_cese: string;
  tiempo_servicio_texto: string;
  motivo_cese: string;
  sueldo_base_cese: number;
  dias_laborados_mes_cese: number;
  monto_boleta_trunca: number;
  monto_cts_trunca: number;
  monto_vacaciones_truncas: number;
  monto_gratificacion_trunca: number;
  monto_bonificacion_ley: number;
  monto_indemnizacion: number;
  total_bruto_lbs: number;
  descuento_ir5ta: number;
  total_neto_lbs: number;
  banco_cts?: string;
  numero_cuenta_cts?: string;
  estado: string;
  creado_en?: string;
}

export interface DepositoCts {
  id: string;
  periodo_semestral: string;
  empresa: string;
  conteo_trabajadores: number;
  monto_total_depositado: number;
  estado: string;
  creado_en?: string;
  detalles?: DepositoCtsDetalle[];
}

export interface ParametrosLaborales {
  id?: number;
  uit_valor: number;
  rmv_valor: number;
  porcentaje_asig_familiar: number;
  porcentaje_essalud: number;
  anio_vigencia: number;
}

export interface DepositoCtsDetalle {
  id: string;
  cts_id: string;
  empleado_id: string;
  nombre_empleado: string;
  numero_documento: string;
  cargo: string;
  fecha_ingreso: string;
  sueldo_basico: number;
  asignacion_familiar: number;
  sexto_gratificacion: number;
  remuneracion_computable: number;
  meses_laborados: number;
  dias_laborados: number;
  monto_cts_depositado: number;
  banco_cts: string;
  numero_cuenta_cts: string;
  moneda: string;
}

export interface GratificacionSemestral {
  id: string;
  periodo_semestral: string;
  empresa: string;
  conteo_trabajadores: number;
  total_gratificacion_bruta: number;
  total_bonificacion_ley: number;
  total_neto_pagado: number;
  estado: string;
  creado_en?: string;
  detalles?: GratificacionDetalle[];
}

export interface GratificacionDetalle {
  id: string;
  gratificacion_id: string;
  empleado_id: string;
  nombre_empleado: string;
  numero_documento: string;
  cargo: string;
  fecha_ingreso: string;
  sueldo_basico: number;
  asignacion_familiar: number;
  remuneracion_computable: number;
  meses_laborados: number;
  monto_gratificacion: number;
  monto_bonificacion_ley9: number;
  descuento_ir5ta: number;
  total_neto_pagar: number;
  banco_abono: string;
  numero_cuenta_abono: string;
}

// Alias de retrocompatibilidad
export type Device = Dispositivo;
export type Employee = Empleado;
export type AttendancePunch = MarcacionAsistencia;
export type LeaveRequest = SolicitudPermiso;
export type AttendanceDay = DiaAsistencia;
export type ToastMessage = MensajeNotificacion;

// -----------------------------------------------------------------------------
// Tablas Maestras del Sistema (Bancos, Tipos de Documento, Regímenes, Conceptos PLAME)
// -----------------------------------------------------------------------------
export interface BancoMaestro {
  id: string;
  codigoSbs: string;
  nombre: string;
  ruc?: string;
  tipo: 'Banco Comercial' | 'Caja Municipal' | 'Financiera';
  aplicaSueldo: boolean;
  aplicaCts: boolean;
  moneda: 'PEN' | 'USD' | 'Ambas';
  formatoCci?: string;
  activo: boolean;
}

export interface TipoDocumentoMaestro {
  id: string;
  codigoSunat: string;
  nombre: string;
  abrev: string;
  longitudExacta?: number;
  longitudMinima?: number;
  longitudMaxima?: number;
  esAlfanumerico: boolean;
  activo: boolean;
}

export interface ConceptoRemunerativoMaestro {
  id: string;
  codigoPlame: string;
  nombre: string;
  categoria: 'Ingreso' | 'Descuento' | 'Aporte Empleador';
  afectoEssalud: boolean;
  afectoOnpAfp: boolean;
  afectoIr5ta: boolean;
  activo: boolean;
}
