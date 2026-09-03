import React from 'react';
import { UtilidadAnual, UtilidadDetalle } from '../../types';

interface ProfitSharingPayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  cabecera: UtilidadAnual | null;
  detalle: UtilidadDetalle | null;
}

export const ProfitSharingPayslipModal: React.FC<ProfitSharingPayslipModalProps> = ({
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
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[24px]">payments</span>
            <h3 className="text-base font-bold text-slate-900 font-headline">
              Hoja de Liquidación de Utilidades (D.L. 892)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Imprimir Liquidación
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* CONTENIDO IMPRIMIBLE LIQUIDACIÓN */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-900 space-y-4 print:bg-white print:border-none print:p-0">
          <div className="text-center pb-3 border-b border-slate-300 space-y-1">
            <h2 className="text-lg font-bold font-headline uppercase tracking-tight">
              LIQUIDACIÓN DE PARTICIPACIÓN EN LAS UTILIDADES
            </h2>
            <p className="text-xs font-semibold text-slate-600">
              DECRETO LEGISLATIVO N° 892 — EJERCICIO FISCAL {cabecera.ejercicio_fiscal}
            </p>
          </div>

          {/* DATOS DE LA EMPRESA Y COLABORADOR */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px]">
            <div>
              <p className="font-bold text-slate-500 uppercase text-[9px]">EMPLEADOR / RAZÓN SOCIAL</p>
              <p className="font-bold text-slate-900">{cabecera.empresa}</p>
              <p className="text-slate-500 mt-1">EJERCICIO FISCAL: {cabecera.ejercicio_fiscal}</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase text-[9px]">COLABORADOR / TRABAJADOR</p>
              <p className="font-bold text-slate-900">{detalle.nombre_empleado}</p>
              <p className="text-slate-500">DNI: {detalle.numero_documento} • {detalle.cargo}</p>
            </div>
          </div>

          {/* DATOS GENERALES DE LA EMPRESA */}
          <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
              I. BASES DE CÁLCULO GENERAL DE LA EMPRESA
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-600">Renta Neta Imponible antes de Impuestos:</span>
                <span className="font-mono font-bold">{formatoSoles(cabecera.renta_neta_empresa)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Porcentaje del Sector Económico:</span>
                <span className="font-mono font-bold text-blue-700">{cabecera.porcentaje_sector}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Monto Global a Distribuir (Pozo Total):</span>
                <span className="font-mono font-bold">{formatoSoles(cabecera.monto_total_distribuir)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Días Laborados por Todo el Personal:</span>
                <span className="font-mono font-bold">{cabecera.total_dias_empresa} días</span>
              </div>
              <div className="flex justify-between col-span-2 pt-1 border-t border-slate-100">
                <span className="text-slate-600">Total Remuneraciones Computables de Todo el Personal:</span>
                <span className="font-mono font-bold">{formatoSoles(cabecera.total_remuneraciones_empresa)}</span>
              </div>
            </div>
          </div>

          {/* CÁLCULO INDIVIDUAL DE UTILIDADES */}
          <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
              II. CÁLCULO INDIVIDUAL DEL TRABAJADOR (50% DÍAS + 50% REMUNERACIÓN)
            </h4>

            <div className="space-y-2 text-[11px]">
              {/* Parte 1: Por Días */}
              <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 space-y-1">
                <div className="flex justify-between font-bold text-blue-900">
                  <span>1. PARTICIPACIÓN POR DÍAS LABORADOS (50% = {formatoSoles(cabecera.monto_50_dias)}):</span>
                  <span className="font-mono">{formatoSoles(detalle.monto_por_dias)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>Fórmula: {detalle.dias_laborados_trabajador} días x Factor Días ({cabecera.factor_dias.toFixed(6)})</span>
                </div>
              </div>

              {/* Parte 2: Por Remuneración */}
              <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100 space-y-1">
                <div className="flex justify-between font-bold text-emerald-900">
                  <span>2. PARTICIPACIÓN POR REMUNERACIÓN ANUAL (50% = {formatoSoles(cabecera.monto_50_remuneraciones)}):</span>
                  <span className="font-mono">{formatoSoles(detalle.monto_por_remuneracion)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>Fórmula: {formatoSoles(detalle.remuneracion_anual_trabajador)} x Factor Remuneración ({cabecera.factor_remuneraciones.toFixed(6)})</span>
                </div>
              </div>

              {/* Resumen Bruto y Tope */}
              <div className="pt-2 flex justify-between items-center text-xs font-bold border-t border-slate-200">
                <span>UTILIDAD BRUTA INDIVIDUAL CALCULADA:</span>
                <span className="font-mono text-slate-900">{formatoSoles(detalle.utilidad_bruta)}</span>
              </div>

              {detalle.excedente_tope_18_sueldos > 0 && (
                <div className="flex justify-between items-center text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <span>Tope Legal Aplicado (Máximo 18 Sueldos D.L. 892) - Excedente al FondoEmpleo:</span>
                  <span className="font-mono font-bold">-{formatoSoles(detalle.excedente_tope_18_sueldos)}</span>
                </div>
              )}
            </div>
          </div>

          {/* DESCUENTOS Y NETO A PAGAR */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2 font-mono">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">UTILIDAD COMPUTABLE RESULTANTE:</span>
              <span className="font-bold">{formatoSoles(detalle.utilidad_computable)}</span>
            </div>
            <div className="flex justify-between text-xs text-rose-300">
              <span>(-) Retención Impuesto a la Renta 5ta Categoría:</span>
              <span>-{formatoSoles(detalle.descuento_ir5ta)}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-400">
              <span>(-) Aportes AFP / ONP (Exento por Ley D.L. 892):</span>
              <span>S/ 0.00</span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between text-base font-extrabold text-emerald-400">
              <span>NETO A DEPOSITAR EN CUENTA BANCARIA:</span>
              <span>{formatoSoles(detalle.utilidad_neta_pagar)}</span>
            </div>
          </div>

          {/* FIRMAS DE CONFORMIDAD */}
          <div className="grid grid-cols-2 gap-8 pt-12 text-center text-[10px] font-bold text-slate-600">
            <div className="border-t border-slate-400 pt-2">
              <p>FIRMA Y SELLO DE LA EMPRESA</p>
              <p className="text-[9px] font-normal text-slate-500">{cabecera.empresa}</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p>FIRMA DEL TRABAJADOR</p>
              <p className="text-[9px] font-normal text-slate-500">DNI: {detalle.numero_documento}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
