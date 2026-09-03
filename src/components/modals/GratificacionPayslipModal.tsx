import React from 'react';
import { GratificacionSemestral, GratificacionDetalle } from '../../types';

interface GratificacionPayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  cabecera: GratificacionSemestral | null;
  detalle: GratificacionDetalle | null;
}

export const GratificacionPayslipModal: React.FC<GratificacionPayslipModalProps> = ({
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
          <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
            <span className="material-symbols-outlined text-[20px]">card_giftcard</span>
            <span>Boleta Oficial de Gratificación Legal (Ley 27735 / Ley 29351)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
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
                RUC: 20601234567 • Ley N° 27735 & Ley N° 29351 (Bonificación 9%)
              </p>
              <p className="text-[10px] text-slate-500">Sede Principal Zarate, Lima - Perú</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-800 font-bold text-xs rounded-lg uppercase inline-block">
                GRATIFICACIÓN {cabecera.periodo_semestral}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">ID: {detalle.id}</p>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-sm font-black tracking-wide uppercase text-slate-900">
              BOLETA DE PAGO DE GRATIFICACIÓN SEMESTRAL
            </h3>
            <p className="text-[11px] text-slate-600 font-medium">
              Con Bonificación Extraordinaria del 9% Ley N° 29351 (Inafectación EsSalud)
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
              <p className="text-slate-500">Entidad Financiera Abono:</p>
              <p className="font-bold text-purple-700">{detalle.banco_abono}</p>
            </div>
            <div>
              <p className="text-slate-500">Número de Cuenta Abono:</p>
              <p className="font-mono font-bold text-slate-900">{detalle.numero_cuenta_abono}</p>
            </div>
          </div>

          {/* Desglose de Cálculo Gratificación */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              I. Conceptos Remunerativos e Ingresos Computables
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Concepto</th>
                    <th className="p-2 text-right">Monto</th>
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
                  <tr className="bg-purple-50/40">
                    <td className="p-2 font-bold text-purple-900">Monto Gratificación Legale Bruta ({detalle.meses_laborados} Meses)</td>
                    <td className="p-2 text-right font-mono font-bold text-purple-900">{formatoSoles(detalle.monto_gratificacion)}</td>
                  </tr>
                  <tr className="bg-emerald-50/40">
                    <td className="p-2 font-bold text-emerald-900">Bonificación Extraordinaria del 9% (Ley N° 29351)</td>
                    <td className="p-2 text-right font-mono font-bold text-emerald-900">{formatoSoles(detalle.monto_bonificacion_ley9)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-500 font-medium">Retención Impuesto a la Renta 5ta Categoría</td>
                    <td className="p-2 text-right font-mono text-slate-500">{formatoSoles(detalle.descuento_ir5ta)}</td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-extrabold">
                    <td className="p-2.5 text-xs uppercase font-extrabold">NETO A PAGAR EN CUENTA TRABAJADOR</td>
                    <td className="p-2.5 text-right font-mono text-emerald-400 text-sm font-extrabold">{formatoSoles(detalle.total_neto_pagar)}</td>
                  </tr>
                </tbody>
              </table>
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
              <p className="text-slate-500">Firma de Conformidad del Colaborador</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
