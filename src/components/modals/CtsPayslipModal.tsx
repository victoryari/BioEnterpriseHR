import React from 'react';
import { DepositoCts, DepositoCtsDetalle } from '../../types';

interface CtsPayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  cabecera: DepositoCts | null;
  detalle: DepositoCtsDetalle | null;
}

export const CtsPayslipModal: React.FC<CtsPayslipModalProps> = ({
  isOpen,
  onClose,
  cabecera,
  detalle,
}) => {
  if (!isOpen || !cabecera || !detalle) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatoSoles = (val: number | string) => {
    const num = Number(val || 0);
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 print:shadow-none print:border-none print:m-0 print:p-0">
        {/* Header Acciones */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <span className="material-symbols-outlined text-[20px]">account_balance</span>
            <span>Constancia Oficial de Depósito de CTS (D.S. 001-97-TR)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Imprimir / PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* DOCUMENTO OFICIAL IMPRIMIBLE */}
        <div className="p-6 border border-slate-300 rounded-xl bg-white space-y-6 text-slate-900 print:border-none print:p-0 text-xs">
          {/* Encabezado Emisor */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-extrabold font-headline uppercase tracking-tight text-slate-900">
                {cabecera.empresa}
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                RUC: 20601234567 • D.S. N° 001-97-TR (Ley de CTS)
              </p>
              <p className="text-[10px] text-slate-500">Sede Principal Zarate, Lima - Perú</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs rounded-lg uppercase inline-block">
                CTS {cabecera.periodo_semestral}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">ID: {detalle.id}</p>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-sm font-black tracking-wide uppercase text-slate-900">
              LIQUIDACIÓN Y CONSTANCIA DE DEPÓSITO SEMESTRAL DE CTS
            </h3>
            <p className="text-[11px] text-slate-600 font-medium">
              Conforme al Decreto Supremo N° 001-97-TR - Texto Único Ordenado de la Ley de CTS
            </p>
          </div>

          {/* Datos del Trabajador */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px]">
            <div>
              <p className="text-slate-500">Colaborador:</p>
              <p className="font-bold text-slate-900">{detalle.nombre_empleado}</p>
            </div>
            <div>
              <p className="text-slate-500">Documento Identidad:</p>
              <p className="font-bold text-slate-900 font-mono">DNI: {detalle.numero_documento}</p>
            </div>
            <div>
              <p className="text-slate-500">Cargo / Posición:</p>
              <p className="font-semibold text-slate-800">{detalle.cargo}</p>
            </div>
            <div>
              <p className="text-slate-500">Fecha de Ingreso:</p>
              <p className="font-semibold text-slate-800">{detalle.fecha_ingreso}</p>
            </div>
            <div>
              <p className="text-slate-500">Entidad Depositaria:</p>
              <p className="font-bold text-blue-700">{detalle.banco_cts}</p>
            </div>
            <div>
              <p className="text-slate-500">Número de Cuenta CTS:</p>
              <p className="font-mono font-bold text-slate-900">{detalle.numero_cuenta_cts}</p>
            </div>
          </div>

          {/* Desglose de Cálculo CTS */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              I. Base de Cálculo de Remuneración Computable
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Concepto Computable</th>
                    <th className="p-2 text-right">Monto Base</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2 font-medium">Sueldo Básico Mensual</td>
                    <td className="p-2 text-right font-mono font-bold">{formatoSoles(detalle.sueldo_basico)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Asignación Familiar (Ley 25129)</td>
                    <td className="p-2 text-right font-mono font-bold">{formatoSoles(detalle.asignacion_familiar)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">1/6 de la Última Gratificación Legal Computable</td>
                    <td className="p-2 text-right font-mono font-bold">{formatoSoles(detalle.sexto_gratificacion)}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="p-2 text-blue-900 font-bold">TOTAL REMUNERACIÓN COMPUTABLE CTS</td>
                    <td className="p-2 text-right font-mono text-blue-900 text-xs">{formatoSoles(detalle.remuneracion_computable)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cálculo del Depósito Semestral */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              II. Liquidación del Depósito Semestral
            </h4>
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600">Tiempo de Servicio Computable:</span>
                <span className="font-bold text-slate-900">{detalle.meses_laborados} meses ({detalle.meses_laborados * 30} días)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600">Fórmula de Cálculo Legale:</span>
                <span className="font-mono text-slate-700">(Remuneración Computable / 12) × {detalle.meses_laborados} meses</span>
              </div>
              <div className="pt-2 border-t border-blue-200 flex justify-between items-center text-sm font-extrabold text-blue-900">
                <span>MONTO TOTAL DEPOSITADO CTS:</span>
                <span className="text-base font-mono text-emerald-700">{formatoSoles(detalle.monto_cts_depositado)}</span>
              </div>
            </div>
          </div>

          {/* Firmas */}
          <div className="pt-10 grid grid-cols-2 gap-12 text-center text-[10px]">
            <div className="space-y-1">
              <div className="border-b border-slate-400 w-3/4 mx-auto pb-8"></div>
              <p className="font-bold text-slate-900">{cabecera.empresa}</p>
              <p className="text-slate-500">Empleador / R.R.H.H.</p>
            </div>
            <div className="space-y-1">
              <div className="border-b border-slate-400 w-3/4 mx-auto pb-8"></div>
              <p className="font-bold text-slate-900">{detalle.nombre_empleado}</p>
              <p className="text-slate-500">Firma de Recepción del Colaborador</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
