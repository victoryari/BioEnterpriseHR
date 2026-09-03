import React, { useState } from 'react';
import { LiquidacionCese } from '../../types';

interface LiquidationPayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  liquidacion: LiquidacionCese | null;
}

export const LiquidationPayslipModal: React.FC<LiquidationPayslipModalProps> = ({
  isOpen,
  onClose,
  liquidacion,
}) => {
  const [activeDoc, setActiveDoc] = useState<'lbs' | 'carta_cts'>('lbs');

  if (!isOpen || !liquidacion) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatoSoles = (val: number | string) => {
    const num = Number(val || 0);
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-4 my-8 print:shadow-none print:border-none print:m-0 print:p-0">
        {/* Header Acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600 text-[24px]">description</span>
            <h3 className="text-base font-bold text-slate-900 font-headline">
              Documentos Legales de Cese (D.L. 728)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector de Documento Imprimible */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveDoc('lbs')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeDoc === 'lbs' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hoja de Liquidación (LBS)
              </button>
              <button
                onClick={() => setActiveDoc('carta_cts')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeDoc === 'carta_cts' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Carta Liberación CTS
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Imprimir Documento
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* DOCUMENTO 1: HOJA DE LIQUIDACIÓN DE BENEFICIOS SOCIALES (LBS) */}
        {activeDoc === 'lbs' && (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-900 space-y-4 print:bg-white print:border-none print:p-0">
            <div className="text-center pb-3 border-b border-slate-300 space-y-1">
              <h2 className="text-lg font-bold font-headline uppercase tracking-tight">
                LIQUIDACIÓN DE BENEFICIOS SOCIALES Y BOLETA TRUNCA DE CESE
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                DECRETO LEGISLATIVO N° 728 — LEY DE FOMENTO DEL EMPLEO
              </p>
            </div>

            {/* DATOS GENERALES DEL CESE */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px]">
              <div>
                <p className="font-bold text-slate-500 uppercase text-[9px]">EMPLEADOR / RAZÓN SOCIAL</p>
                <p className="font-bold text-slate-900">{liquidacion.empresa}</p>
                <p className="text-slate-500 mt-1">MOTIVO DE CESE: <strong>{liquidacion.motivo_cese}</strong></p>
              </div>
              <div>
                <p className="font-bold text-slate-500 uppercase text-[9px]">COLABORADOR / EX-TRABAJADOR</p>
                <p className="font-bold text-slate-900">{liquidacion.nombre_empleado}</p>
                <p className="text-slate-500">DNI: {liquidacion.numero_documento} • {liquidacion.cargo}</p>
              </div>
            </div>

            {/* FECHAS Y TIEMPO DE SERVICIO */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Fecha de Ingreso</span>
                <span className="font-mono font-bold text-slate-900">{liquidacion.fecha_ingreso}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Fecha de Cese Efectivo</span>
                <span className="font-mono font-bold text-rose-700">{liquidacion.fecha_cese}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Tiempo de Servicio</span>
                <span className="font-mono font-bold text-blue-700">{liquidacion.tiempo_servicio_texto}</span>
              </div>
            </div>

            {/* DESGLOSE REMUNERATIVO Y TRUNCO */}
            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-100">
                I. DESGLOSE DE CONCEPTOS REMUNERATIVOS TRUNCOS Y BENEFICIOS SOCIALES
              </h4>

              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                  <span>1. Boleta Trunca del Mes de Cese ({liquidacion.dias_laborados_mes_cese} días laborados):</span>
                  <span className="font-bold">{formatoSoles(liquidacion.monto_boleta_trunca)}</span>
                </div>

                <div className="flex justify-between p-2 bg-blue-50/60 rounded-lg text-blue-900">
                  <span>2. Compensación por Tiempo de Servicios (CTS) Trunca:</span>
                  <span className="font-bold">{formatoSoles(liquidacion.monto_cts_trunca)}</span>
                </div>

                <div className="flex justify-between p-2 bg-emerald-50/60 rounded-lg text-emerald-900">
                  <span>3. Vacaciones Truncas y/o Vencidas:</span>
                  <span className="font-bold">{formatoSoles(liquidacion.monto_vacaciones_truncas)}</span>
                </div>

                <div className="flex justify-between p-2 bg-purple-50/60 rounded-lg text-purple-900">
                  <span>4. Gratificación Trunca Semestral:</span>
                  <span className="font-bold">{formatoSoles(liquidacion.monto_gratificacion_trunca)}</span>
                </div>

                <div className="flex justify-between p-2 bg-purple-50/60 rounded-lg text-purple-900 text-[10px]">
                  <span>   (+) Bonificación Extraordinaria Ley 29351 (9% EsSalud):</span>
                  <span className="font-bold">{formatoSoles(liquidacion.monto_bonificacion_ley)}</span>
                </div>

                {liquidacion.monto_indemnizacion > 0 && (
                  <div className="flex justify-between p-2 bg-amber-50 rounded-lg text-amber-900 font-bold">
                    <span>5. Indemnización por Despido Arbitrario / Injustificado:</span>
                    <span>{formatoSoles(liquidacion.monto_indemnizacion)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* RESUMEN DE NETO Y DESCUENTOS */}
            <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">TOTAL BRUTO DE LIQUIDACIÓN (LBS):</span>
                <span className="font-bold">{formatoSoles(liquidacion.total_bruto_lbs)}</span>
              </div>
              <div className="flex justify-between text-xs text-rose-300">
                <span>(-) Retención Impuesto a la Renta 5ta Categoría:</span>
                <span>-{formatoSoles(liquidacion.descuento_ir5ta)}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between text-base font-extrabold text-emerald-400">
                <span>TOTAL NETO A PAGAR AL EX-TRABAJADOR:</span>
                <span>{formatoSoles(liquidacion.total_neto_lbs)}</span>
              </div>
            </div>

            {/* FIRMAS DE CONFORMIDAD */}
            <div className="grid grid-cols-2 gap-8 pt-12 text-center text-[10px] font-bold text-slate-600">
              <div className="border-t border-slate-400 pt-2">
                <p>FIRMA Y SELLO DEL EMPLEADOR</p>
                <p className="text-[9px] font-normal text-slate-500">{liquidacion.empresa}</p>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <p>FIRMA Y DNI DEL EX-TRABAJADOR</p>
                <p className="text-[9px] font-normal text-slate-500">Recibí conforme el importe neto arriba indicado</p>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTO 2: CARTA DE AUTORIZACIÓN PARA LIBERACIÓN DE FONDOS CTS */}
        {activeDoc === 'carta_cts' && (
          <div className="p-8 bg-white text-xs text-slate-900 space-y-6 font-serif leading-relaxed">
            <div className="text-right font-sans text-slate-500 text-[11px]">
              Lima, {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>

            <div className="space-y-1 font-sans">
              <p className="font-bold">Señores:</p>
              <p className="font-bold text-blue-900 text-sm">{liquidacion.banco_cts || 'BANCO DE CRÉDITO DEL PERÚ (BCP)'}</p>
              <p className="text-slate-600">Departamento de Operaciones y Fondos CTS</p>
              <p className="text-slate-600 underline">Presente.-</p>
            </div>

            <div className="text-center font-bold font-sans text-sm tracking-wider uppercase py-2">
              ASUNTO: LIBERACIÓN DE FONDOS DE COMPENSACIÓN POR TIEMPO DE SERVICIOS (CTS)
            </div>

            <p className="text-justify">
              Por medio de la presente, nos dirigimos a ustedes para comunicarles que el(la) Sr.(a) <strong>{liquidacion.nombre_empleado}</strong>, identificado(a) con DNI N° <strong>{liquidacion.numero_documento}</strong>, ha cesado definitivamente en sus labores para nuestra empresa <strong>{liquidacion.empresa}</strong> el día <strong>{liquidacion.fecha_cese}</strong>.
            </p>

            <p className="text-justify">
              En tal sentido, y de conformidad con el <strong>Artículo 45 del Texto Único Ordenado de la Ley de Compensación por Tiempo de Servicios (Decreto Supremo N° 001-97-TR)</strong>, les solicitamos se sirvan proceder a la <strong>LIBERACIÓN Y ENTREGA DE LA TOTALIDAD DE LOS FONDOS</strong> de la cuenta de CTS N° <strong>{liquidacion.numero_cuenta_cts || '---'}</strong> que el ex-trabajador mantiene en su entidad financiera.
            </p>

            <p className="text-justify">
              Se expide la presente constancia a solicitud del interesado para los fines legales que estime convenientes.
            </p>

            <div className="pt-20 text-center text-xs font-sans font-bold">
              <div className="w-64 mx-auto border-t border-slate-800 pt-2">
                <p>{liquidacion.empresa}</p>
                <p className="text-[10px] text-slate-500 font-normal">Área de Gestión Humana / Representante Legal</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
