import React, { useState, useEffect } from 'react';
import { HorarioTrabajo } from '../../types';

interface AddEditTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetable: HorarioTrabajo | null;
  onSave: (timetable: HorarioTrabajo) => void;
}

const PRESET_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

export const AddEditTimetableModal: React.FC<AddEditTimetableModalProps> = ({
  isOpen,
  onClose,
  timetable,
  onSave,
}) => {
  const [nombre, setNombre] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('08:30');
  const [ventanaEntradaDesde, setVentanaEntradaDesde] = useState('06:30');
  const [ventanaEntradaHasta, setVentanaEntradaHasta] = useState('12:00');
  const [horaSalida, setHoraSalida] = useState('18:00');
  const [ventanaSalidaDesde, setVentanaSalidaDesde] = useState('12:01');
  const [ventanaSalidaHasta, setVentanaSalidaHasta] = useState('23:59');
  const [minutosTolerancia, setMinutosTolerancia] = useState(10);
  const [inicioRefrigerio, setInicioRefrigerio] = useState('13:00');
  const [finRefrigerio, setFinRefrigerio] = useState('14:00');
  const [minutosRefrigerio, setMinutosRefrigerio] = useState(60);
  const [marcadoRefrigerioObligatorio, setMarcadoRefrigerioObligatorio] = useState(false);
  const [colorTag, setColorTag] = useState('#3B82F6');

  useEffect(() => {
    if (timetable) {
      setNombre(timetable.nombre);
      setHoraEntrada(timetable.horaEntrada);
      setVentanaEntradaDesde(timetable.ventanaEntradaDesde || '06:30');
      setVentanaEntradaHasta(timetable.ventanaEntradaHasta || '12:00');
      setHoraSalida(timetable.horaSalida);
      setVentanaSalidaDesde(timetable.ventanaSalidaDesde || '12:01');
      setVentanaSalidaHasta(timetable.ventanaSalidaHasta || '23:59');
      setMinutosTolerancia(timetable.minutosTolerancia);
      setInicioRefrigerio(timetable.inicioRefrigerio || '13:00');
      setFinRefrigerio(timetable.finRefrigerio || '14:00');
      setMinutosRefrigerio(timetable.minutosRefrigerio);
      setMarcadoRefrigerioObligatorio(timetable.marcadoRefrigerioObligatorio);
      setColorTag(timetable.colorTag || '#3B82F6');
    } else {
      setNombre('');
      setHoraEntrada('08:30');
      setVentanaEntradaDesde('06:30');
      setVentanaEntradaHasta('12:00');
      setHoraSalida('18:00');
      setVentanaSalidaDesde('12:01');
      setVentanaSalidaHasta('23:59');
      setMinutosTolerancia(10);
      setInicioRefrigerio('13:00');
      setFinRefrigerio('14:00');
      setMinutosRefrigerio(60);
      setMarcadoRefrigerioObligatorio(false);
      setColorTag('#3B82F6');
    }
  }, [timetable, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const data: HorarioTrabajo = {
      id: timetable ? timetable.id : `hor-${Date.now()}`,
      nombre: nombre.trim(),
      horaEntrada,
      ventanaEntradaDesde,
      ventanaEntradaHasta,
      horaSalida,
      ventanaSalidaDesde,
      ventanaSalidaHasta,
      minutosTolerancia: Number(minutosTolerancia) || 0,
      inicioRefrigerio: minutosRefrigerio > 0 ? inicioRefrigerio : undefined,
      finRefrigerio: minutosRefrigerio > 0 ? finRefrigerio : undefined,
      minutosRefrigerio: Number(minutosRefrigerio) || 0,
      marcadoRefrigerioObligatorio,
      colorTag,
    };

    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: `${colorTag}15`, borderColor: `${colorTag}40`, color: colorTag }}
              className="w-10 h-10 rounded-xl border flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[24px]">schedule</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">
                {timetable ? 'Editar Horario de Trabajo' : 'Nuevo Horario de Trabajo'}
              </h3>
              <p className="text-xs text-slate-500">
                Define hora oficial de entrada/salida y ventanas horarias de marcado.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Nombre del Horario *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Jornada Administrativa Lima"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Horario de Entrada y Ventana Permitida */}
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/80 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-600">login</span>
                Ingreso: Hora Oficial & Ventana Horaria de Marcación
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-blue-800 uppercase">Hora Oficial *</label>
                <input
                  type="time"
                  required
                  value={horaEntrada}
                  onChange={(e) => setHoraEntrada(e.target.value)}
                  className="w-full bg-white border border-blue-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Permitir Marcado Desde</label>
                <input
                  type="time"
                  required
                  value={ventanaEntradaDesde}
                  onChange={(e) => setVentanaEntradaDesde(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Permitir Marcado Hasta</label>
                <input
                  type="time"
                  required
                  value={ventanaEntradaHasta}
                  onChange={(e) => setVentanaEntradaHasta(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Horario de Salida y Ventana Permitida */}
          <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-600">logout</span>
                Salida: Hora Oficial & Ventana Horaria de Marcación
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-amber-900 uppercase">Hora Oficial *</label>
                <input
                  type="time"
                  required
                  value={horaSalida}
                  onChange={(e) => setHoraSalida(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Permitir Marcado Desde</label>
                <input
                  type="time"
                  required
                  value={ventanaSalidaDesde}
                  onChange={(e) => setVentanaSalidaDesde(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Permitir Marcado Hasta</label>
                <input
                  type="time"
                  required
                  value={ventanaSalidaHasta}
                  onChange={(e) => setVentanaSalidaHasta(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Tolerancia de Ingreso (Minutos)
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={minutosTolerancia}
                onChange={(e) => setMinutosTolerancia(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono outline-none focus:border-blue-600 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400">Minutos de gracia sin descuento</span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Color Distintivo</label>
              <div className="flex items-center gap-1.5 pt-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColorTag(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      colorTag === c ? 'scale-125 ring-2 ring-slate-800 ring-offset-2' : 'opacity-80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Refrigerio */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-blue-600">restaurant</span>
                Refrigerio / Almuerzo
              </h4>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={minutosRefrigerio}
                  onChange={(e) => setMinutosRefrigerio(Number(e.target.value))}
                  className="w-16 p-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-center outline-none"
                />
                <span className="text-[11px] text-slate-500 font-medium">minutos</span>
              </div>
            </div>

            {minutosRefrigerio > 0 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Inicio Refrigerio</label>
                    <input
                      type="time"
                      value={inicioRefrigerio}
                      onChange={(e) => setInicioRefrigerio(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Fin Refrigerio</label>
                    <input
                      type="time"
                      value={finRefrigerio}
                      onChange={(e) => setFinRefrigerio(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-mono outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={marcadoRefrigerioObligatorio}
                    onChange={(e) => setMarcadoRefrigerioObligatorio(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-[11px] text-slate-700">
                    Fichaje obligatorio en reloj biométrico para salida y retorno de refrigerio
                  </span>
                </label>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
              {timetable ? 'Guardar Cambios' : 'Crear Horario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
