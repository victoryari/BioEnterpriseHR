import React from 'react';
import { Empleado } from '../../types';

interface DeactivationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inactiveEmployees: Empleado[];
  onReactivateEmployee: (id: string) => void;
}

export const DeactivationHistoryModal: React.FC<DeactivationHistoryModalProps> = ({
  isOpen,
  onClose,
  inactiveEmployees,
  onReactivateEmployee,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl">
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <span className="material-symbols-outlined text-[24px]">history</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">Historial de Bajas y Ceses</h3>
              <p className="text-xs text-slate-500">
                Colaboradores inactivos y revocación de credenciales biométricas en sedes Perú.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="py-4 max-h-72 overflow-y-auto">
          {inactiveEmployees.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No hay colaboradores dados de baja en el registro.
            </div>
          ) : (
            <div className="space-y-2">
              {inactiveEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 line-through decoration-slate-400">
                      {emp.nombre}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {emp.cargo} • {emp.departamento} ({emp.sede})
                    </p>
                    {emp.numeroDocumento && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        {emp.tipoDocumento || 'DNI'}: {emp.numeroDocumento}
                      </p>
                    )}
                    <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
                      Acceso biométrico revocado en terminales
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onReactivateEmployee(emp.id);
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold rounded-xl transition-all flex items-center gap-1 text-xs border border-blue-100 hover:border-transparent shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">restore</span>
                    Reactivar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
