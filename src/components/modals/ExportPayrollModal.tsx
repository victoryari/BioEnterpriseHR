import React, { useState } from 'react';
import { Departamento } from '../../types';

interface ExportPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  departamentos?: Departamento[];
  onExport: (format: string, period: string) => void;
}

export const ExportPayrollModal: React.FC<ExportPayrollModalProps> = ({
  isOpen,
  onClose,
  departamentos,
  onExport,
}) => {
  const [period, setPeriod] = useState('Agosto 2026 (Mes Actual)');
  const [format, setFormat] = useState('Excel (.xlsx)');
  const [includeLates, setIncludeLates] = useState(true);
  const [includeOvertime, setIncludeOvertime] = useState(true);
  const [includeNocturnalAdjustment, setIncludeNocturnalAdjustment] = useState(true);
  const [department, setDepartment] = useState('Todos los Departamentos');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExport(format, period);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">download</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">Exportar Reporte de Nómina</h3>
              <p className="text-xs text-slate-500">
                Generar resumen de horas trabajadas, tardanzas y descuentos.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Período de Liquidación (Moneda: Soles S/.)</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
            >
              <option>Agosto 2026 (Mes Actual)</option>
              <option>Julio 2026</option>
              <option>Junio 2026</option>
              <option>Año 2026 Completo (YTD)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Departamento</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
            >
              <option value="Todos los Departamentos">Todos los Departamentos</option>
              {departamentos && departamentos.length > 0 ? (
                departamentos.map((d) => (
                  <option key={d.id} value={d.nombre}>
                    {d.nombre}
                  </option>
                ))
              ) : (
                <>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Operaciones">Operaciones</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Ventas">Ventas</option>
                  <option value="Soporte IT">Soporte IT</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Formato del Archivo</label>
            <div className="grid grid-cols-3 gap-2">
              {['Excel (.xlsx)', 'PDF Corporativo', 'CSV Raw'].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`p-2.5 rounded-xl border text-center font-semibold text-xs transition-all ${
                    format === fmt
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLates}
                onChange={(e) => setIncludeLates(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-slate-800">Calcular minutos acumulados de tardanzas</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeOvertime}
                onChange={(e) => setIncludeOvertime(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-slate-800">Incluir cálculo de horas extras (25% y 35%)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNocturnalAdjustment}
                onChange={(e) => setIncludeNocturnalAdjustment(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-slate-800">
                Aplicar compensación nocturna (Piso legal S/ 1,525.50 y HE nocturnas)
              </span>
            </label>
          </div>

          <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-[16px] text-purple-700">bedtime</span>
              Criterio Legal de Nómina Nocturna (D. Leg. 728 / 2026):
            </div>
            <p className="text-[10px] text-purple-700 leading-relaxed">
              Reintegro de sobretasa obligatorio solo para sueldos &le; S/ 1,525.50 (RMV S/ 1,130 + S/ 395.50). Sueldos superiores están exentos al superar el piso mínimo.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
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
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              Descargar Archivo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
