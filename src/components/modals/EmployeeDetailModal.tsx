import React from 'react';
import { Empleado } from '../../types';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Empleado | null;
  onOpenEditModal: (emp: Empleado) => void;
  onToggleAccess: (
    employeeId: string,
    door: 'entradaPrincipal' | 'centroDatos' | 'almacen'
  ) => void;
  onReEnrollBiometric: (employeeId: string, type: 'huella' | 'rostro') => void;
  onSyncEmployee: (employeeId: string) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen,
  onClose,
  employee,
  onOpenEditModal,
  onToggleAccess,
  onReEnrollBiometric,
  onSyncEmployee,
}) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-6 my-8">
        {/* Header de la Modal */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[24px]">account_box</span>
            <h3 className="text-lg font-bold text-slate-900 font-headline">
              Ficha del Colaborador
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Header Perfil Avatar & Datos Principales */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
          <div className="relative mb-3 group">
            {employee.foto ? (
              <img
                alt={employee.nombre}
                src={employee.foto}
                className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl font-bold text-blue-600">
                {employee.nombre.charAt(0)}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                employee.estado === 'Activo' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            ></span>
          </div>

          <h2 className="text-xl font-bold font-headline text-slate-900">
            {employee.nombre}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {employee.cargo} • PIN: <span className="font-mono text-slate-700 font-bold">{employee.pin}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
              {employee.departamento}
            </span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              {employee.sede}
            </span>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                (employee.empresa || '').includes('Carmelita')
                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                  : (employee.empresa || '').includes('Chemmer')
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-purple-50 text-purple-700 border-purple-100'
              }`}
            >
              {employee.empresa || 'Importaciones Carmelita del Norte S.A.C.'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3 text-left w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Documento</span>
              <span className="font-mono font-bold text-slate-900">{employee.tipoDocumento || 'DNI'}: {employee.numeroDocumento || 'No registrado'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Sueldo Básico</span>
              <span className="font-mono font-bold text-emerald-700">S/ {Number(employee.sueldoBase || 1025).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Correo Electrónico</span>
              <span className="text-slate-800 font-medium truncate block">{employee.correo}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Teléfono</span>
              <span className="text-slate-800 font-medium">{employee.telefono || 'No especificado'}</span>
            </div>
          </div>
        </div>

        {/* Biometric Credentials */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Credenciales y Métodos de Marcado
          </h4>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 text-xs">
            {/* Huella */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    employee.biometriaHuella ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  fingerprint
                </span>
                <div>
                  <p className="font-semibold text-slate-800">Huella Biométrica</p>
                  <p className="text-[10px] text-slate-500">
                    {employee.biometriaHuella
                      ? `${employee.conteoHuellas} huellas enroladas`
                      : 'Sin enrolar'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onReEnrollBiometric(employee.id, 'huella')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                {employee.biometriaHuella ? 'Re-enrolar' : 'Enrolar'}
              </button>
            </div>

            {/* RFID */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    employee.tarjetaRfid ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  badge
                </span>
                <div>
                  <p className="font-semibold text-slate-800">Tarjeta de Proximidad RFID</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {employee.tarjetaRfid
                      ? employee.numeroTarjeta || 'Tarjeta Activa'
                      : 'No asignada'}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  employee.tarjetaRfid
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {employee.tarjetaRfid ? 'Asignada' : 'Inactiva'}
              </span>
            </div>

            {/* PIN */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-600">
                  dialpad
                </span>
                <div>
                  <p className="font-semibold text-slate-800">PIN Marcación en Teclado</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Código: {employee.pin}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                Habilitado
              </span>
            </div>
          </div>
        </div>

        {/* Door Access Control */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Permisos de Acceso a Puertas
          </h4>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-medium">Puerta Principal ({employee.sede})</span>
              <button
                type="button"
                onClick={() => onToggleAccess(employee.id, 'entradaPrincipal')}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  employee.accesoPuertas?.entradaPrincipal ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    employee.accesoPuertas?.entradaPrincipal ? 'translate-x-4' : ''
                  }`}
                ></span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <span className="text-slate-700 font-medium">Data Center / Áreas Seguras</span>
              <button
                type="button"
                onClick={() => onToggleAccess(employee.id, 'centroDatos')}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  employee.accesoPuertas?.centroDatos ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    employee.accesoPuertas?.centroDatos ? 'translate-x-4' : ''
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div>

        {/* Acciones de la Modal */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenEditModal(employee);
            }}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Editar Ficha
          </button>
          <button
            type="button"
            onClick={() => onSyncEmployee(employee.id)}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">sync</span>
            Sincronizar Biometría
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
