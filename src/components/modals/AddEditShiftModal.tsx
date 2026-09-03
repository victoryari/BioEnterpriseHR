import React, { useState, useEffect } from 'react';
import { Turno, HorarioTrabajo, TurnoDia } from '../../types';

interface AddEditShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Turno | null;
  timetables: HorarioTrabajo[];
  onSave: (shift: Turno) => void;
}

const DEFAULT_DAYS: TurnoDia[] = [
  { diaSemana: 1, nombreDia: 'Lunes', horarioId: null, esLaborable: true },
  { diaSemana: 2, nombreDia: 'Martes', horarioId: null, esLaborable: true },
  { diaSemana: 3, nombreDia: 'Miércoles', horarioId: null, esLaborable: true },
  { diaSemana: 4, nombreDia: 'Jueves', horarioId: null, esLaborable: true },
  { diaSemana: 5, nombreDia: 'Viernes', horarioId: null, esLaborable: true },
  { diaSemana: 6, nombreDia: 'Sábado', horarioId: null, esLaborable: false },
  { diaSemana: 7, nombreDia: 'Domingo', horarioId: null, esLaborable: false },
];

export const AddEditShiftModal: React.FC<AddEditShiftModalProps> = ({
  isOpen,
  onClose,
  shift,
  timetables,
  onSave,
}) => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'Fijo' | 'Rotativo' | 'Flexible'>('Fijo');
  const [descripcion, setDescripcion] = useState('');
  const [dias, setDias] = useState<TurnoDia[]>(DEFAULT_DAYS);
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    const defaultHorarioId = timetables.length > 0 ? timetables[0].id : null;
    if (shift) {
      setNombre(shift.nombre);
      setTipo(shift.tipo);
      setDescripcion(shift.descripcion);
      if (shift.dias && shift.dias.length > 0) {
        const merged = DEFAULT_DAYS.map((defDay) => {
          const found = shift.dias.find((d) => d.diaSemana === defDay.diaSemana);
          return found
            ? { ...found }
            : { ...defDay, horarioId: defDay.esLaborable ? defaultHorarioId : null };
        });
        setDias(merged);
      } else {
        setDias(
          DEFAULT_DAYS.map((d) => ({
            ...d,
            horarioId: d.esLaborable ? defaultHorarioId : null,
          }))
        );
      }
      setActivo(shift.activo);
    } else {
      setNombre('');
      setTipo('Fijo');
      setDescripcion('');
      setDias(
        DEFAULT_DAYS.map((d) => ({
          ...d,
          horarioId: d.esLaborable ? defaultHorarioId : null,
        }))
      );
      setActivo(true);
    }
  }, [shift, timetables, isOpen]);

  if (!isOpen) return null;

  const handleToggleDayLaborable = (diaSemana: number) => {
    setDias((prev) =>
      prev.map((d) => {
        if (d.diaSemana === diaSemana) {
          const nextLab = !d.esLaborable;
          return {
            ...d,
            esLaborable: nextLab,
            horarioId: nextLab ? d.horarioId || (timetables[0]?.id ?? null) : null,
          };
        }
        return d;
      })
    );
  };

  const handleSelectDayHorario = (diaSemana: number, horarioId: string) => {
    setDias((prev) =>
      prev.map((d) => (d.diaSemana === diaSemana ? { ...d, horarioId } : d))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const data: Turno = {
      id: shift ? shift.id : `tur-${Date.now()}`,
      nombre: nombre.trim(),
      tipo,
      descripcion: descripcion.trim(),
      dias,
      activo,
    };

    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">calendar_month</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">
                {shift ? 'Editar Turno Laboral' : 'Nuevo Turno Laboral'}
              </h3>
              <p className="text-xs text-slate-500">
                Programa qué horarios aplican a cada día de la semana.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-3 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Nombre del Turno *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Turno Administrativo L-V"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Tipo de Turno</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'Fijo' | 'Rotativo' | 'Flexible')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="Fijo">Fijo (Horario regular continuo)</option>
                <option value="Rotativo">Rotativo (Jornadas cambiantes / 24x7)</option>
                <option value="Flexible">Flexible (Bolsa de horas)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Descripción / Observaciones</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles sobre sedes o áreas donde aplica..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          {/* Programación de los 7 días de la semana */}
          <div className="space-y-2 pt-2">
            <label className="block font-bold text-slate-800">
              Programación Semanal (Asignar horario a cada día)
            </label>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {dias.map((d) => (
                <div
                  key={d.diaSemana}
                  className={`p-2.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                    d.esLaborable ? 'bg-white' : 'bg-slate-50/70 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5 w-32">
                    <input
                      type="checkbox"
                      checked={d.esLaborable}
                      onChange={() => handleToggleDayLaborable(d.diaSemana)}
                      className="rounded text-blue-600"
                    />
                    <span className={`font-semibold ${d.esLaborable ? 'text-slate-800' : 'text-slate-400'}`}>
                      {d.nombreDia}
                    </span>
                  </div>

                  <div className="flex-1">
                    {d.esLaborable ? (
                      <select
                        value={d.horarioId || ''}
                        onChange={(e) => handleSelectDayHorario(d.diaSemana, e.target.value)}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-600 font-medium text-slate-800"
                      >
                        {timetables.map((h) => {
                          const cruzaMedianoche = h.horaSalida < h.horaEntrada;
                          return (
                            <option key={h.id} value={h.id}>
                              {h.nombre} ({h.horaEntrada} - {h.horaSalida}
                              {cruzaMedianoche ? ' • +1 día 🌙' : ''})
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400 italic">
                        Día de Descanso Semanal
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Aviso Explicativo de Cruce de Medianoche */}
            {dias.some(
              (d) =>
                d.esLaborable &&
                d.horarioId &&
                timetables.some((t) => t.id === d.horarioId && t.horaSalida < t.horaEntrada)
            ) && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200/80 text-purple-900 text-xs flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-purple-700 shrink-0 mt-0.5">
                  bedtime
                </span>
                <div>
                  <p className="font-bold">
                    Jornada con Cruce de Medianoche (+1 Día Detectado)
                  </p>
                  <p className="text-[11px] text-purple-800 leading-relaxed mt-0.5">
                    Como la hora de salida es cronológicamente menor a la de entrada (ej.{' '}
                    <strong>18:30 a 04:00</strong>), el sistema determina automáticamente que la
                    salida ocurre en la madrugada del día siguiente. La marcación de salida se
                    asociará a la jornada que inició la noche anterior.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 text-xs"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              {shift ? 'Guardar Turno' : 'Crear Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
