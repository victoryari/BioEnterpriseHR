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
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 overflow-hidden animate-in fade-in">
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" 
      />
      
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-300 max-h-[92vh] z-10">
        {/* Cabecera Institucional ERP */}
        <div className="bg-[#004A99] px-4 py-2.5 flex items-center justify-between text-white shadow-sm shrink-0 border-b border-blue-900">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/10 rounded">
              <span className="material-symbols-outlined text-[18px] text-blue-200">person_remove</span>
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-tight">
                Procesar Liquidación de Beneficios Sociales (LBS)
              </h2>
              <p className="text-[9px] text-blue-200 uppercase font-medium">
                Régimen Laboral de la Actividad Privada D.L. 728
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-red-600 rounded text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/70">
          {/* Tarjeta de Parámetros de Cese */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-700">assignment</span>
              <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">
                Datos del Colaborador & Término Laboral
              </span>
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Seleccionar Colaborador *</label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} ({emp.empresa || 'Grupo Carmelita'}) — DOC: {emp.numeroDocumento || '---'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Fecha Efectiva de Cese *</label>
                  <input
                    type="date"
                    required
                    value={fechaCese}
                    onChange={(e) => setFechaCese(e.target.value)}
                    className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Motivo de Término *</label>
                  <select
                    value={motivoCese}
                    onChange={(e) => {
                      setMotivoCese(e.target.value);
                      if (e.target.value.includes('Despido arbitrario')) {
                        setIncluyeIndemnizacion(true);
                      }
                    }}
                    className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:border-blue-500 outline-none"
                  >
                    {MOTIVOS_CESE.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Indemnización */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-600">shield_with_heart</span>
              <span className="text-[11px] font-bold text-blue-950 uppercase tracking-tight">
                Indemnización Legal (Art. 38 D.L. 728)
              </span>
            </div>

            <label className="flex items-center gap-2.5 p-2 bg-amber-50/70 rounded border border-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={incluyeIndemnizacion}
                onChange={(e) => setIncluyeIndemnizacion(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-amber-950 block">
                  Incluir Indemnización por Despido Arbitrario / Injustificado
                </span>
                <span className="text-[10px] text-amber-700 block">
                  1.5 remuneraciones ordinarias por cada año completo de servicios (hasta tope de 12 sueldos).
                </span>
              </div>
            </label>
          </div>

          {/* Tarjeta Informativa Resumen */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold text-[11px] uppercase">
              <span className="material-symbols-outlined text-[16px] text-blue-700">info</span>
              Resumen del Proceso Automatizado
            </div>
            <ul className="text-[10px] text-slate-600 space-y-1 list-disc list-inside">
              <li>El colaborador cambiará automáticamente al estado <strong>Inactivo / Cesado</strong>.</li>
              <li>Se liquidarán partes proporcionales de <strong>Gratificación Trunca</strong> y <strong>Bonificación 9% Ley 29351</strong>.</li>
              <li>Se liquidará la <strong>CTS Trunca</strong> computable hasta la fecha efectiva de cese.</li>
              <li>Se calcularán las <strong>Vacaciones Truncas y No Gozadas</strong> con retención de Quinta Categoría si corresponde.</li>
            </ul>
          </div>

          {/* Footer del Formulario */}
          <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between shrink-0 -mx-3 -mb-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] text-red-500">close</span>
              Cancelar
            </button>

            <button
              type="submit"
              className="h-8 px-5 bg-[#004A99] hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">calculate</span>
              Calcular & Registrar Liquidación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
