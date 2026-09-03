import React, { useState } from 'react';
import { Empleado } from '../../types';

interface ProcessLiquidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Empleado[];
  onProcess: (empleadoId: string, fechaCese: string, motivoCese: string, incluyeIndemnizacion: boolean) => void;
}

const MOTIVOS_CESE = [
  'Renuncia voluntaria',
  'Mutuo disenso / Acuerdo de partes',
  'Vencimiento de contrato modal',
  'Jubilación',
  'Despido arbitrario / Injustificado',
  'Despido por falta grave',
];

export const ProcessLiquidationModal: React.FC<ProcessLiquidationModalProps> = ({
  isOpen,
  onClose,
  employees,
  onProcess,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [fechaCese, setFechaCese] = useState<string>(new Date().toISOString().split('T')[0]);
  const [motivoCese, setMotivoCese] = useState<string>('Renuncia voluntaria');
  const [incluyeIndemnizacion, setIncluyeIndemnizacion] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    onProcess(selectedEmpId, fechaCese, motivoCese, incluyeIndemnizacion);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">person_remove</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">
                Procesar Liquidación de Cese (LBS)
              </h3>
              <p className="text-xs text-slate-500">
                Calcula Boleta Trunca, CTS, Vacaciones y Gratificación Trunca D.L. 728.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Seleccionar Colaborador *</label>
            <select
              required
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold outline-none focus:border-rose-600 focus:bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} ({emp.empresa || 'Grupo Carmelita'}) — DNI: {emp.numeroDocumento || '---'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Fecha Efectiva de Cese *</label>
              <input
                type="date"
                required
                value={fechaCese}
                onChange={(e) => setFechaCese(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono font-bold outline-none focus:border-rose-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Motivo del Término Laboral *</label>
              <select
                value={motivoCese}
                onChange={(e) => {
                  setMotivoCese(e.target.value);
                  if (e.target.value.includes('Despido arbitrario')) {
                    setIncluyeIndemnizacion(true);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold outline-none"
              >
                {MOTIVOS_CESE.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer">
            <input
              type="checkbox"
              checked={incluyeIndemnizacion}
              onChange={(e) => setIncluyeIndemnizacion(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span className="text-[11px] font-bold text-amber-900">
              Incluir Indemnización por Despido Arbitrario (1.5 sueldos por año trabajado)
            </span>
          </label>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
            <p className="font-bold text-slate-800 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-blue-600">info</span>
              Resumen del Proceso Automatizado:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[10px]">
              <li>Cambiará automáticamente el estado del colaborador a <strong>Cesado</strong>.</li>
              <li>Generará la <strong>Boleta Trunca del Mes</strong> con marcaciones biométricas reales.</li>
              <li>Emitirá la <strong>Hoja de LBS</strong> y la <strong>Carta para Liberar Fondos CTS</strong> del banco.</li>
            </ul>
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
              Calcular & Generar Liquidación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
