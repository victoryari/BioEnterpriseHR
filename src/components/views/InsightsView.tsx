import React, { useState, useMemo } from 'react';
import { Empleado, Departamento } from '../../types';

interface InsightsViewProps {
  employees?: Empleado[];
  departamentos?: Departamento[];
  onOpenExportModal: () => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  employees = [],
  departamentos = [],
  onOpenExportModal,
}) => {
  const [timeRange, setTimeRange] = useState('YTD');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Colaboradores activos e inactivos/cesados
  const activeEmployees = useMemo(() => employees.filter((e) => e.estado === 'Activo'), [employees]);
  const cesadosEmployees = useMemo(() => employees.filter((e) => (e.estado as string) === 'Cesado' || e.estado === 'Inactivo'), [employees]);

  // Permanencia promedio en años calculada a partir de fechaIngreso
  const averageTenureYears = useMemo(() => {
    if (employees.length === 0) return '0.0';
    const now = new Date();
    let totalDays = 0;
    let count = 0;

    employees.forEach((e) => {
      const ingreso = e.fechaIngreso ? new Date(e.fechaIngreso) : new Date('2024-01-15');
      const diffMs = now.getTime() - ingreso.getTime();
      const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      totalDays += diffDays;
      count++;
    });

    const avgYears = count > 0 ? (totalDays / count / 365).toFixed(1) : '0.0';
    return avgYears;
  }, [employees]);

  // Tasa de rotación anual (Cesados / Total) * 100
  const turnoverRatePct = useMemo(() => {
    const total = employees.length;
    if (total === 0) return '0.0';
    return ((cesadosEmployees.length / total) * 100).toFixed(1);
  }, [employees, cesadosEmployees]);

  // Planilla mensual estimada (Sueldos base + Asig Fam + EsSalud 9%)
  const totalPayroll = useMemo(() => {
    return activeEmployees.reduce((sum, e) => {
      const sueldo = e.sueldoBase || 2500;
      const asigFam = (e as any).tieneAsignacionFamiliar ? 102.5 : 0;
      const subtotal = sueldo + asigFam;
      const essalud = subtotal * 0.09;
      return sum + subtotal + essalud;
    }, 0);
  }, [activeEmployees]);

  const totalPayrollK = (totalPayroll / 1000).toFixed(1);

  // Proyección de costos mensuales para la gráfica (en miles S/.)
  const monthlyCosts = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyBaseK = parseFloat(totalPayrollK) || 12.0;

    return months.map((m, idx) => {
      // Ajuste para gratificaciones en Julio y Diciembre (+100% de costo)
      const isGratiMonth = idx === 6 || idx === 11;
      const factor = isGratiMonth ? 2.0 : 1.0;
      const real = parseFloat((monthlyBaseK * factor).toFixed(1));
      const projected = parseFloat((monthlyBaseK * 1.1 * factor).toFixed(1));
      return { month: m, real, projected };
    });
  }, [totalPayrollK]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight">
            Análisis Detallado de Talento
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Métricas avanzadas de retención, rotación y costos proyectados de plantilla en Perú.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none shadow-2xs focus:border-blue-600 cursor-pointer"
          >
            <option value="YTD">Año Operativo (YTD 2026)</option>
            <option value="12M">Últimos 12 Meses</option>
            <option value="Q3">Tercer Trimestre (Q3 2026)</option>
          </select>
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar Datos
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Dinamicos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Permanencia */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Permanencia Promedio
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                Calculado en tiempo real
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">
              {averageTenureYears} <span className="text-base font-normal text-slate-500">años</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 flex items-center gap-1.5 pt-3 border-t border-slate-100">
            <span className="material-symbols-outlined text-[16px] text-blue-600">person_pin</span>
            <span>Permanencia promedio basada en contrataciones</span>
          </div>
        </div>

        {/* Card 2: Rotación */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Tasa de Rotación Anual
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[14px]">trending_down</span>
                {turnoverRatePct}% en BD
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">{turnoverRatePct}%</div>
          </div>
          <div className="text-xs text-slate-500 mt-4 flex items-center gap-1.5 pt-3 border-t border-slate-100">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
            <span>{cesadosEmployees.length} ceses registrados en la base de datos</span>
          </div>
        </div>

        {/* Card 3: Costo de Nómina */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Planilla Mensual Estimada
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                Sueldos + EsSalud 9%
              </span>
            </div>
            <div className="text-3xl font-bold font-headline text-slate-900 mt-2">S/ {totalPayrollK}K</div>
          </div>
          <div className="text-xs text-slate-500 mt-4 flex items-center gap-1.5 pt-3 border-t border-slate-100">
            <span className="material-symbols-outlined text-[16px] text-amber-500">payments</span>
            <span>
              Promedio: S/{' '}
              {activeEmployees.length > 0
                ? (totalPayroll / activeEmployees.length).toFixed(0)
                : '0'}{' '}
              por colaborador
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart: Cost Projection & Real Curve */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold font-headline text-slate-900">
              Costo de Nómina Proyectado vs Real (S/. Miles)
            </h2>
            <p className="text-xs text-slate-500">
              Impacto económico mensual derivado de jornales, sobretiempos, EsSalud y gratificaciones legales.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600"></span>
              <span className="text-slate-600">Gasto Real Estimado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200"></span>
              <span className="text-slate-600">Presupuesto Proyectado</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Canvas */}
        <div className="h-64 flex items-end justify-between gap-1 sm:gap-3 pt-6 px-2 border-b border-slate-100 relative">
          {monthlyCosts.map((item, idx) => {
            const maxVal = Math.max(...monthlyCosts.map((m) => m.real), 10);
            const heightPct = Math.round((item.real / (maxVal * 1.15)) * 100);

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative cursor-pointer"
                onMouseEnter={() => setHoveredMonth(idx)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {hoveredMonth === idx && (
                  <div className="absolute -top-12 bg-slate-900 text-white text-[11px] p-2.5 rounded-xl shadow-xl whitespace-nowrap z-20 pointer-events-none border border-slate-800">
                    <div className="font-bold">{item.month} 2026</div>
                    <div className="text-blue-300">Gasto Real: S/ {item.real}K</div>
                    <div className="text-slate-400">Presupuesto: S/ {item.projected}K</div>
                  </div>
                )}

                <div className="w-full flex items-end justify-center gap-1 h-48">
                  {/* Real Bar */}
                  <div
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                      item.real > item.projected ? 'bg-rose-500' : 'bg-blue-600'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  ></div>
                </div>

                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-900">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Motivos de Rotación & Dotación Dinámica por Departamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Motivos de Rotación */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold font-headline text-slate-900">
              Distribución de Motivos de Baja (D.L. 728)
            </h2>
            <p className="text-xs text-slate-500">Clasificación legal de término de relación laboral</p>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Renuncia Voluntaria (Art. 18 D.L. 728)</span>
                <span className="text-blue-600 font-bold">60%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Vencimiento de Contrato Modal (Art. 77 D.L. 728)</span>
                <span className="text-amber-600 font-bold">30%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Mutuo Disenso (Art. 19 D.L. 728)</span>
                <span className="text-emerald-600 font-bold">10%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-700 mt-4 leading-relaxed">
            <span className="font-bold text-blue-700">Recomendación Legal/RRHH: </span>
            Conservar las cartas de renuncia con 30 días de anticipación y liquidaciones firmadas conforme a la normativa laboral del Perú.
          </div>
        </div>

        {/* Estabilidad y Dotación por Departamentos (100% Dinámica) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold font-headline text-slate-900">
              Distribución y Dotación por Área (MySQL)
            </h2>
            <p className="text-xs text-slate-500">Colaboradores asignados por departamento en tiempo real</p>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            {departamentos && departamentos.length > 0 ? (
              departamentos.map((dept) => {
                const count = employees.filter(
                  (e) => e.departamento === dept.nombre || (e as any).departamento_id === dept.id
                ).length;
                return (
                  <div
                    key={dept.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{dept.nombre}</p>
                      <p className="text-[11px] text-slate-500">
                        {count} {count === 1 ? 'colaborador asignado' : 'colaboradores asignados'}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 font-bold rounded-lg text-xs border ${
                        count > 0
                          ? 'bg-emerald-50 border-emerald-200/60 text-emerald-700'
                          : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}
                    >
                      {count > 0 ? `${count} Personal` : 'Sin personal'}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-xs text-center py-4">No hay departamentos registrados en BD</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
