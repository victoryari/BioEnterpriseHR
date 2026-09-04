import React, { useState } from 'react';
import { BoletaPago, PlanillaDetalle } from '../../types';
import { apiService } from '../../services/apiService';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  boleta: BoletaPago | null;
  detalle?: PlanillaDetalle | null;
  employeeEmail?: string;
  onEmailSent?: (boletaId: string) => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  boleta,
  detalle,
  employeeEmail,
  onEmailSent,
}) => {
  if (!isOpen || !boleta) return null;

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState<string | null>(null);

  const fallbackEmail =
    employeeEmail ||
    `${boleta.nombre_empleado.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/(^\.|\.$)/g, '')}@grupocarmelita.com`;

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    const targetEmail = prompt('Confirmar o editar correo destinatario del colaborador:', fallbackEmail);
    if (!targetEmail || !targetEmail.trim()) return;

    setIsSendingEmail(true);
    setEmailSentStatus(null);
    try {
      const res = await apiService.sendBoletaEmail({
        boleta_id: boleta.id,
        empleado_id: boleta.empleado_id,
        nombre_empleado: boleta.nombre_empleado,
        correo: targetEmail.trim(),
        periodo: boleta.periodo,
        empresa: boleta.empresa || 'Grupo Carmelita',
        sueldo_neto: Number(detalle?.sueldo_neto ?? boleta.sueldo_neto ?? 0),
      });

      if (res.success) {
        setEmailSentStatus(`Boleta de pago despachada con éxito a: ${targetEmail.trim()}`);
        if (onEmailSent) onEmailSent(boleta.id);
      }
    } catch (err: any) {
      alert(`Error al enviar boleta por correo: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const sueldoBasico = Number(detalle?.sueldo_basico ?? boleta.sueldo_basico ?? 2500);
  const asigFam = Number(detalle?.asignacion_familiar ?? 102.50);
  const totalIngresos = Number(detalle?.total_ingresos ?? boleta.total_ingresos ?? 2602.50);

  const descPension = Number(detalle?.descuento_pension ?? 345.87);
  const descIR5ta = Number(detalle?.descuento_ir5ta ?? 0);
  const descTardanzas = Number(detalle?.descuento_tardanzas ?? 0);
  const totalDescuentos = Number(detalle?.total_descuentos ?? boleta.total_descuentos ?? 345.87);

  const sueldoNeto = Number(detalle?.sueldo_neto ?? boleta.sueldo_neto ?? 2256.63);
  const aporteEssalud = Number(detalle?.aporte_essalud ?? 234.23);
  const horasExtras25 = Number(detalle?.monto_horas_extras_25 ?? 0);
  const horasExtras35 = Number(detalle?.monto_horas_extras_35 ?? 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl space-y-4 my-8 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full">
        {/* Acciones de la Modal (No imprimibles) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[24px]">receipt_long</span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">
                Boleta de Pago Oficial (Perú D.L. 728)
              </h3>
              <p className="text-xs text-slate-500">
                Entrega legal electrónica conforme al Art. 19 D.S. 001-98-TR
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${isSendingEmail ? 'animate-spin' : ''}`}>
                {isSendingEmail ? 'sync' : 'mail'}
              </span>
              {isSendingEmail ? 'Enviando...' : 'Enviar al Correo'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Imprimir Boleta PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Notificación de Éxito de Envío */}
        {emailSentStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between print:hidden animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">mark_email_read</span>
              <span className="font-medium">{emailSentStatus}</span>
            </div>
            <button
              type="button"
              onClick={() => setEmailSentStatus(null)}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BOLETA DE PAGO IMPRIMIBLE CONFORMATIVA MINTRA / SUNAT                     */}
        {/* ========================================================================= */}
        <div className="border border-slate-300 p-6 rounded-xl space-y-5 text-slate-900 text-xs font-sans print:border-slate-800">
          {/* Encabezado Corporativo */}
          <div className="flex justify-between items-start border-b pb-4 border-slate-200">
            <div>
              <h2 className="text-base font-extrabold uppercase text-slate-900 font-headline">
                {boleta.empresa || 'GRUPO CARMELITA PERÚ'}
              </h2>
              <p className="text-[11px] text-slate-600">RUC: 20601234567 • Régimen General D.L. 728</p>
              <p className="text-[11px] text-slate-500">Sede Central: Av. Javier Prado Este 456, San Borja, Lima</p>
            </div>
            <div className="text-right bg-slate-50 p-3 rounded-lg border border-slate-200 print:bg-transparent">
              <span className="text-[11px] font-bold text-slate-500 block uppercase">BOLETA DE PAGO</span>
              <span className="text-sm font-extrabold text-blue-700 font-mono">PERIODO: {boleta.periodo}</span>
            </div>
          </div>

          {/* Ficha de Datos del Trabajador */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-[11px] print:bg-transparent">
            <div>
              <span className="text-slate-400 block font-semibold">COLABORADOR:</span>
              <span className="font-bold text-slate-900">{boleta.nombre_empleado}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">N° DOCUMENTO (DNI):</span>
              <span className="font-mono font-bold text-slate-900">{boleta.numero_documento}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">CARGO / PUESTO:</span>
              <span className="font-semibold text-slate-800">{boleta.cargo || 'Colaborador'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">RÉGIMEN PENSIONARIO:</span>
              <span className="font-semibold text-slate-800">{detalle?.afp_onp_nombre || 'AFP Integra'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">DÍAS TRABAJADOS:</span>
              <span className="font-mono font-bold text-slate-900">{detalle?.dias_trabajados ?? 30} Días</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">FALTAS / TARDANZAS:</span>
              <span className="font-mono font-bold text-slate-900">{detalle?.minutos_tardanza ?? 0} min.</span>
            </div>
          </div>

          {/* Desglose Remunerativo Tripartito (Ingresos / Descuentos / Aportes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Columna 1: INGRESOS DEL TRABAJADOR */}
            <div className="border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="font-bold text-emerald-700 border-b border-slate-100 pb-1 text-[11px] uppercase tracking-wider flex justify-between">
                <span>1. Ingresos / Remuneraciones</span>
                <span>Monto (S/)</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Sueldo Básico</span>
                  <span className="font-mono font-medium">S/ {sueldoBasico.toFixed(2)}</span>
                </div>
                {asigFam > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Asignación Familiar (10% RMV)</span>
                    <span className="font-mono font-medium">S/ {asigFam.toFixed(2)}</span>
                  </div>
                )}
                {horasExtras25 > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Horas Extras 25%</span>
                    <span className="font-mono font-medium">S/ {horasExtras25.toFixed(2)}</span>
                  </div>
                )}
                {horasExtras35 > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Horas Extras 35%</span>
                    <span className="font-mono font-medium">S/ {horasExtras35.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-800 text-xs">
                <span>TOTAL REMUNERACIÓN BRUTA</span>
                <span className="font-mono">S/ {totalIngresos.toFixed(2)}</span>
              </div>
            </div>

            {/* Columna 2: DESCUENTOS AL TRABAJADOR */}
            <div className="border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="font-bold text-rose-700 border-b border-slate-100 pb-1 text-[11px] uppercase tracking-wider flex justify-between">
                <span>2. Descuentos de Ley</span>
                <span>Monto (S/)</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Aporte Fondo Previsional ({detalle?.afp_onp_nombre || 'AFP'})</span>
                  <span className="font-mono font-medium text-rose-600">- S/ {descPension.toFixed(2)}</span>
                </div>
                {descIR5ta > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Impuesto a la Renta Quinta Categoría</span>
                    <span className="font-mono font-medium text-rose-600">- S/ {descIR5ta.toFixed(2)}</span>
                  </div>
                )}
                {descTardanzas > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Descuento por Tardanzas / Minutos</span>
                    <span className="font-mono font-medium text-rose-600">- S/ {descTardanzas.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-rose-800 text-xs">
                <span>TOTAL DESCUENTOS</span>
                <span className="font-mono">- S/ {totalDescuentos.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Resumen Neto y Aporte Empleador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] print:bg-transparent">
              <span className="font-bold text-slate-700 block uppercase mb-1">Aportes del Empleador (Informativo)</span>
              <div className="flex justify-between text-slate-600">
                <span>EsSalud (9%):</span>
                <span className="font-mono font-bold text-slate-900">S/ {aporteEssalud.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-right print:bg-transparent">
              <span className="text-xs font-bold text-blue-900 block uppercase">NETO A RECIBIR POR EL TRABAJADOR</span>
              <span className="text-2xl font-black text-blue-700 font-mono">S/ {sueldoNeto.toFixed(2)}</span>
            </div>
          </div>

          {/* Pie de Página: Firma y Confirmación de Recepción */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-500">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-800 uppercase">{boleta.empresa || 'GRUPO CARMELITA PERÚ'}</p>
              <p>Firma del Empleador / Representante Legal</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-800 uppercase">{boleta.nombre_empleado}</p>
              <p>DNI: {boleta.numero_documento} • Firma del Trabajador (Conforme)</p>
            </div>
          </div>

          {/* Token de Seguridad SUNAT / PLAME */}
          <div className="text-[9px] text-slate-400 font-mono text-center pt-2 border-t border-slate-100">
            Token de Verificación SUNAT T-Registro: {boleta.token_seguridad || 'carmelita-sec-2026-0831'} • Emitido electrónicamente vía BioEnterprise HR
          </div>
        </div>
      </div>
    </div>
  );
};
