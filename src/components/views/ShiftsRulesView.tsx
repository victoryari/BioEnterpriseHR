import React, { useState } from 'react';
import {
  HorarioTrabajo,
  Turno,
  AsignacionTurno,
  ReglasAsistencia,
  Empleado,
} from '../../types';
import {
  evaluarCompensacionNocturna,
  calcularHorasExtrasNocturnas,
  formatoSoles,
} from '../../utils/calculoLaboralPeru';

interface ShiftsRulesViewProps {
  timetables: HorarioTrabajo[];
  shifts: Turno[];
  shiftAssignments: AsignacionTurno[];
  attendanceRules: ReglasAsistencia;
  employees: Empleado[];
  onOpenAddTimetable: () => void;
  onOpenEditTimetable: (t: HorarioTrabajo) => void;
  onDeleteTimetable: (id: string) => void;
  onOpenAddShift: () => void;
  onOpenEditShift: (s: Turno) => void;
  onDeleteShift: (id: string) => void;
  onOpenAssignShift: () => void;
  onDeleteAssignment: (id: string) => void;
  onSaveRules: (rules: ReglasAsistencia) => void;
}

export const ShiftsRulesView: React.FC<ShiftsRulesViewProps> = ({
  timetables,
  shifts,
  shiftAssignments,
  attendanceRules,
  employees,
  onOpenAddTimetable,
  onOpenEditTimetable,
  onDeleteTimetable,
  onOpenAddShift,
  onOpenEditShift,
  onDeleteShift,
  onOpenAssignShift,
  onDeleteAssignment,
  onSaveRules,
}) => {
  const [activeTab, setActiveTab] = useState<'timetables' | 'shifts' | 'rules'>('shifts');

  // Form local state for attendance rules
  const [rulesForm, setRulesForm] = useState<ReglasAsistencia>(attendanceRules);

  // Estados del Simulador de Remuneración Nocturna y Horas Extras
  const [simSueldo, setSimSueldo] = useState<number>(1130.0);
  const [simHorasExtras, setSimHorasExtras] = useState<number>(3);

  const calculoNocturnoSim = evaluarCompensacionNocturna(
    simSueldo,
    rulesForm.remuneracionMinimaVital || 1130,
    rulesForm.sobretasaNocturna || 35
  );

  const calculoHorasExtrasSim = calcularHorasExtrasNocturnas(
    simSueldo,
    simHorasExtras,
    rulesForm.remuneracionMinimaVital || 1130,
    rulesForm.sobretasaNocturna || 35,
    rulesForm.sobretasaHePrimerasDos || 25,
    rulesForm.sobretasaHeRestantes || 35
  );

  const handleRulesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRules(rulesForm);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[28px] text-blue-600">schedule</span>
            Turnos, Horarios y Reglas Laborales (Perú)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Planificación de jornadas, asignación de turnos y normativas legales de asistencia.
          </p>
        </div>

        {/* Action button based on active tab */}
        <div className="flex items-center gap-2">
          {activeTab === 'timetables' && (
            <button
              onClick={onOpenAddTimetable}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nuevo Horario
            </button>
          )}

          {activeTab === 'shifts' && (
            <>
              <button
                onClick={onOpenAddShift}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-blue-600">add</span>
                Nuevo Turno
              </button>
              <button
                onClick={onOpenAssignShift}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                Asignar a Personal
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'shifts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          Turnos y Programación ({shifts.length})
        </button>

        <button
          onClick={() => setActiveTab('timetables')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'timetables'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">access_time</span>
          Horarios de Trabajo ({timetables.length})
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'rules'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">gavel</span>
          Políticas Laborales Perú
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TURNOS Y ASIGNACIÓN                                                */}
      {/* ========================================================================= */}
      {activeTab === 'shifts' && (
        <div className="space-y-6">
          {/* List of Shifts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {shift.tipo}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 font-headline mt-1.5">
                        {shift.nombre}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditShift(shift)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar turno"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteShift(shift.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar turno"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{shift.descripcion}</p>

                  {/* Weekly Days Grid */}
                  <div className="pt-3 border-t border-slate-100 mt-3 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Jornada Semanal:
                    </span>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {shift.dias.map((d) => (
                        <div
                          key={d.diaSemana}
                          className={`p-1.5 rounded-lg text-[10px] font-bold ${
                            d.esLaborable
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                          title={`${d.nombreDia}: ${
                            d.esLaborable
                              ? timetables.find((h) => h.id === d.horarioId)?.nombre || 'Laborable'
                              : 'Descanso'
                          }`}
                        >
                          {d.nombreDia.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                  <span>
                    Asignado a:{' '}
                    <strong className="text-slate-800">
                      {shiftAssignments.filter((a) => a.turnoId === shift.id).length} colaboradores
                    </strong>
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Activo
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Employee Shift Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-headline">
                  Colaboradores con Turnos Programados
                </h3>
                <p className="text-xs text-slate-500">
                  Supervisa qué turno tiene asignado cada miembro de la organización.
                </p>
              </div>
              <button
                onClick={onOpenAssignShift}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1 hover:bg-blue-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Asignar Turno
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Colaborador / DNI</th>
                    <th className="p-3">Sede & Cargo</th>
                    <th className="p-3">Turno Asignado</th>
                    <th className="p-3">Vigencia</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shiftAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No hay asignaciones registradas. Haz clic en "Asignar a Personal" para comenzar.
                      </td>
                    </tr>
                  ) : (
                    shiftAssignments.map((asig) => {
                      const emp = employees.find((e) => e.id === asig.empleadoId);
                      const shift = shifts.find((s) => s.id === asig.turnoId);
                      return (
                        <tr key={asig.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-800 text-xs">
                              {emp?.nombre || asig.empleadoId}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {emp?.tipoDocumento || 'DNI'}: {emp?.numeroDocumento || '----'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-slate-800 font-semibold">{emp?.cargo || '----'}</div>
                            <div className="text-[11px] text-slate-500">{emp?.sede || '----'}</div>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              {shift?.nombre || asig.turnoId}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">
                            Desde {asig.fechaInicio}
                            {asig.fechaFin ? ` hasta ${asig.fechaFin}` : ' (Indefinido)'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onDeleteAssignment(asig.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Desvincular turno"
                            >
                              <span className="material-symbols-outlined text-[17px]">close</span>
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

      {/* ========================================================================= */}
      {/* TAB 2: HORARIOS DE TRABAJO (TIMETABLES)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'timetables' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timetables.map((h) => (
            <div
              key={h.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      style={{ backgroundColor: h.colorTag || '#3B82F6' }}
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                    />
                    <h3 className="text-base font-bold text-slate-900 font-headline leading-tight">
                      {h.nombre}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditTimetable(h)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar horario"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteTimetable(h.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar horario"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Times Row */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Entrada</span>
                    <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">{h.horaEntrada}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Salida</span>
                    <p className="text-lg font-bold font-mono text-slate-900 mt-0.5 flex items-center justify-center gap-1">
                      {h.horaSalida}
                      {h.horaSalida < h.horaEntrada && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1 py-0.2 rounded-md font-sans">
                          +1d 🌙
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-amber-500">timer</span>
                      Tolerancia de Entrada:
                    </span>
                    <span className="font-bold text-slate-800 font-mono">
                      {h.minutosTolerancia} minutos
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-blue-500">restaurant</span>
                      Refrigerio / Almuerzo:
                    </span>
                    <span className="font-bold text-slate-800 font-mono">
                      {h.minutosRefrigerio > 0 ? `${h.minutosRefrigerio} min` : 'Sin refrigerio'}
                    </span>
                  </div>

                  {h.marcadoRefrigerioObligatorio && (
                    <div className="text-[11px] text-blue-700 bg-blue-50 p-1.5 rounded-lg font-medium">
                      ✓ Marcación obligatoria en reloj para almuerzo
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono text-right">
                ID: {h.id}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REGLAS Y POLÍTICAS LABORALES PERÚ                                 */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <form onSubmit={handleRulesSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Tolerancia y Tardanzas */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="material-symbols-outlined text-[24px] text-amber-600">timer</span>
                <div>
                  <h3 className="font-bold text-slate-900 font-headline text-sm">
                    Tolerancias y Reglas de Puntualidad
                  </h3>
                  <p className="text-[11px] text-slate-500">Límites de tolerancia de ingreso en Perú.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Minutos de Gracia sin Descuento
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={rulesForm.minutosGraciaIngreso}
                    onChange={(e) =>
                      setRulesForm({ ...rulesForm, minutosGraciaIngreso: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Ingresos dentro de este lapso no generan descuento de haberes.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Tolerancia Máxima (Minutos hasta considerar Falta Injustificada)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={120}
                    value={rulesForm.toleranciaMaximaMinutos}
                    onChange={(e) =>
                      setRulesForm({ ...rulesForm, toleranciaMaximaMinutos: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Superado este tiempo, el colaborador no puede ingresar y se registra inasistencia.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Horas Extras Legales (Perú D. Leg. 854) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="material-symbols-outlined text-[24px] text-emerald-600">payments</span>
                <div>
                  <h3 className="font-bold text-slate-900 font-headline text-sm">
                    Sobretasas de Horas Extras (D. Leg. 854 Perú)
                  </h3>
                  <p className="text-[11px] text-slate-500">Porcentajes legales para cálculo en Soles (S/.).</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Primeras 2 Horas Extras (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={rulesForm.sobretasaHePrimerasDos}
                      onChange={(e) =>
                        setRulesForm({ ...rulesForm, sobretasaHePrimerasDos: Number(e.target.value) })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-600 focus:bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">25% legal estándar</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    3ra Hora Extra en adelante (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={rulesForm.sobretasaHeRestantes}
                      onChange={(e) =>
                        setRulesForm({ ...rulesForm, sobretasaHeRestantes: Number(e.target.value) })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-600 focus:bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">35% legal estándar</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Umbral Mínimo de Exceso para Generar HE (Minutos)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={rulesForm.minutosMinimosParaHoraExtra ?? 30}
                      onChange={(e) =>
                        setRulesForm({ ...rulesForm, minutosMinimosParaHoraExtra: Number(e.target.value) })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-600 focus:bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">MIN</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold">
                    Evita considerar salidas con 5-15 min de exceso involuntario.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Sobretasa Domingos y Feriados Laborados (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={rulesForm.sobretasaFeriadoDomingo}
                      onChange={(e) =>
                        setRulesForm({ ...rulesForm, sobretasaFeriadoDomingo: Number(e.target.value) })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-600 focus:bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    100% adicional sobre el valor del día regular si no hay descanso compensatorio.
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Régimen Vacacional (D. Leg. 728 / 1405) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="material-symbols-outlined text-[24px] text-blue-600">beach_access</span>
                <div>
                  <h3 className="font-bold text-slate-900 font-headline text-sm">
                    Régimen Vacacional (D. Leg. 728 / D. Leg. 1405)
                  </h3>
                  <p className="text-[11px] text-slate-500">Parámetros de goce y fraccionamiento.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Días de Vacaciones Anuales</label>
                  <input
                    type="number"
                    value={rulesForm.diasVacacionesAnuales}
                    onChange={(e) =>
                      setRulesForm({ ...rulesForm, diasVacacionesAnuales: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400">30 días calendario por ley</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Bloque Continuo Mínimo (Días)
                  </label>
                  <input
                    type="number"
                    value={rulesForm.minimoDiasBloqueVacaciones}
                    onChange={(e) =>
                      setRulesForm({
                        ...rulesForm,
                        minimoDiasBloqueVacaciones: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400">7 o 15 días continuos</span>
                </div>
              </div>
            </div>

            {/* 4. Jornada Nocturna (Ley Laboral Perú 2026) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="material-symbols-outlined text-[24px] text-purple-600">bedtime</span>
                <div>
                  <h3 className="font-bold text-slate-900 font-headline text-sm">
                    Jornada y Compensación Nocturna (Ley Laboral Perú)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Reglas del D. Leg. 728 / D.S. 003-97-TR con RMV 2026 (S/ 1,130.00).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Inicio Jornada Nocturna</label>
                  <input
                    type="time"
                    value={rulesForm.inicioJornadaNocturna}
                    onChange={(e) =>
                      setRulesForm({ ...rulesForm, inicioJornadaNocturna: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400">22:00 horas según ley</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Fin Jornada Nocturna</label>
                  <input
                    type="time"
                    value={rulesForm.finJornadaNocturna}
                    onChange={(e) =>
                      setRulesForm({ ...rulesForm, finJornadaNocturna: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400">06:00 horas según ley</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">RMV Base 2026 (S/.)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={rulesForm.remuneracionMinimaVital || 1130.00}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const piso = Number((val * (1 + (rulesForm.sobretasaNocturna || 35) / 100)).toFixed(2));
                        setRulesForm({
                          ...rulesForm,
                          remuneracionMinimaVital: val,
                          pisoMinimoNocturno: piso,
                        });
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-600 focus:bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">PEN</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Remuneración Mínima Vital</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Sobretasa Nocturna (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={rulesForm.sobretasaNocturna}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const piso = Number(((rulesForm.remuneracionMinimaVital || 1130) * (1 + val / 100)).toFixed(2));
                        setRulesForm({
                          ...rulesForm,
                          sobretasaNocturna: val,
                          pisoMinimoNocturno: piso,
                        });
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-600 focus:bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                  <span className="text-[10px] text-slate-400">35% legal sobre RMV</span>
                </div>
              </div>

              {/* Piso Legal Nocturno Highlight */}
              <div className="p-3.5 bg-purple-50/80 rounded-xl border border-purple-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-purple-700">balance</span>
                    Piso de Remuneración Mínima Nocturna (2026):
                  </span>
                  <span className="text-base font-bold font-mono text-purple-700">
                    {formatoSoles(rulesForm.pisoMinimoNocturno || 1525.50)}
                  </span>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  Cálculo oficial: RMV ({formatoSoles(rulesForm.remuneracionMinimaVital || 1130)}) + 35% ({formatoSoles((rulesForm.remuneracionMinimaVital || 1130) * 0.35)}) = <strong>{formatoSoles(rulesForm.pisoMinimoNocturno || 1525.50)}</strong>.
                </p>

                {/* 2 Reglas Clave */}
                <div className="pt-2 border-t border-purple-200/60 space-y-1.5 text-[11px] text-slate-700">
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓ Regla 1:</span>
                    <span>
                      Si el sueldo del trabajador es <strong>&le; {formatoSoles(rulesForm.pisoMinimoNocturno || 1525.50)}</strong>, el empleador está obligado a pagar la sobretasa del 35% para alcanzar el piso legal.
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">✓ Regla 2:</span>
                    <span>
                      Si el sueldo ya es <strong>&gt; {formatoSoles(rulesForm.pisoMinimoNocturno || 1525.50)}</strong>, no hay obligación legal de pagar adicional por el solo hecho de laborar de noche.
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">📈 Horas Extras:</span>
                    <span>
                      Se pagan con base en la hora ordinaria nocturna (+25% primeras 2 horas y +35% desde la 3ra hora).
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simulador Interactivo de Remuneración y Horas Extras Nocturnas */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-400 text-[24px]">calculate</span>
                <div>
                  <h4 className="font-bold text-sm font-headline tracking-tight">
                    Simulador en Tiempo Real de Jornada Nocturna (Perú 2026)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Comprueba cómo aplican el piso de S/ 1,525.50 y los recargos del 25% y 35%.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSimSueldo(1130.0)}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-[10px] font-mono transition-colors"
                >
                  Sueldo Mínimo S/ 1,130
                </button>
                <button
                  type="button"
                  onClick={() => setSimSueldo(1400.0)}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-[10px] font-mono transition-colors"
                >
                  S/ 1,400
                </button>
                <button
                  type="button"
                  onClick={() => setSimSueldo(3200.0)}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-[10px] font-mono transition-colors"
                >
                  S/ 3,200
                </button>
                <button
                  type="button"
                  onClick={() => setSimSueldo(4500.0)}
                  className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-[10px] font-mono transition-colors"
                >
                  S/ 4,500
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Input Sueldo */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Sueldo Base Mensual</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-bold">S/</span>
                  <input
                    type="number"
                    step="50"
                    value={simSueldo}
                    onChange={(e) => setSimSueldo(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-1.5 text-xs font-mono font-bold text-white outline-none focus:border-amber-400"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Piso nocturno: S/ 1,525.50</span>
              </div>

              {/* Input Horas Extras */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Horas Extras en Turno Nocturno</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={simHorasExtras}
                  onChange={(e) => setSimHorasExtras(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-1.5 text-xs font-mono font-bold text-white outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-400">Primeras 2h (+25%), resto (+35%)</span>
              </div>

              {/* Resultado Reintegro Base */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Reintegro Piso Nocturno</span>
                <div className="text-base font-bold font-mono text-amber-400">
                  {calculoNocturnoSim.aplicaReintegroPiso
                    ? `+ ${formatoSoles(calculoNocturnoSim.montoReintegro)}`
                    : 'S/ 0.00 (No aplica)'}
                </div>
                <span className="text-[10px] text-slate-400">
                  {calculoNocturnoSim.aplicaReintegroPiso
                    ? `Alcanza piso de ${formatoSoles(calculoNocturnoSim.pisoMinimoNocturno)}`
                    : `Supera piso de ${formatoSoles(calculoNocturnoSim.pisoMinimoNocturno)}`}
                </span>
              </div>

              {/* Pago Total Horas Extras */}
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pago Horas Extras Nocturnas</span>
                <div className="text-base font-bold font-mono text-emerald-400">
                  + {formatoSoles(calculoHorasExtrasSim.totalPagoHorasExtras)}
                </div>
                <span className="text-[10px] text-slate-400">
                  Hora base nocturna: S/ {calculoHorasExtrasSim.valorHoraBaseNocturna.toFixed(2)}/h
                </span>
              </div>
            </div>

            {/* Total Consolidado */}
            <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="material-symbols-outlined text-[18px] text-amber-400">info</span>
                <span>
                  {calculoNocturnoSim.aplicaReintegroPiso ? (
                    <>
                      Obligación legal: Sueldo de <strong>{formatoSoles(simSueldo)}</strong> recibe{' '}
                      <strong>{formatoSoles(calculoNocturnoSim.montoReintegro)}</strong> de sobretasa para alcanzar el piso de <strong>S/ 1,525.50</strong>.
                    </>
                  ) : (
                    <>
                      Exención legal: Sueldo de <strong>{formatoSoles(simSueldo)}</strong> ya supera el piso legal de <strong>S/ 1,525.50</strong>. No genera reintegro obligatorio al básico.
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Remuneración Total Bruta Estimada:</span>
                <span className="text-base font-bold font-mono text-white bg-blue-600 px-2.5 py-1 rounded-lg">
                  {formatoSoles(
                    calculoNocturnoSim.sueldoEfectivoNocturno +
                      calculoHorasExtrasSim.totalPagoHorasExtras
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 text-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Guardar Políticas y Reglas Laborales
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
