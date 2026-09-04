import React, { useState, useEffect, useMemo } from 'react';
import { PlanillaMensual, PlanillaDetalle, BoletaPago, AFPTasa, UtilidadAnual, UtilidadDetalle, LiquidacionCese, DepositoCts, DepositoCtsDetalle, GratificacionSemestral, GratificacionDetalle, ParametrosLaborales, Empleado, EMPRESAS_GRUPO_CARMELITA, MarcacionAsistencia } from '../../types';
import { apiService } from '../../services/apiService';
import { PayslipModal } from '../modals/PayslipModal';
import { ProfitSharingPayslipModal } from '../modals/ProfitSharingPayslipModal';
import { ProcessLiquidationModal } from '../modals/ProcessLiquidationModal';
import { LiquidationPayslipModal } from '../modals/LiquidationPayslipModal';
import { CtsPayslipModal } from '../modals/CtsPayslipModal';
import { GratificacionPayslipModal } from '../modals/GratificacionPayslipModal';

interface PayrollViewProps {
  punchLogs?: MarcacionAsistencia[];
  employees?: Empleado[];
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  punchLogs = [],
  employees: initialEmployees = [],
}) => {
  const [activeTab, setActiveTab] = useState<'planillas' | 'boletas' | 'utilidades' | 'liquidaciones' | 'cts' | 'gratificaciones' | 'plame' | 'parametros'>('planillas');
  const [periodo, setPeriodo] = useState('2026-08');
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>(EMPRESAS_GRUPO_CARMELITA[0]);
  const [loading, setLoading] = useState(false);

  const [planillas, setPlanillas] = useState<PlanillaMensual[]>([]);
  const [detallesPlanilla, setDetallesPlanilla] = useState<PlanillaDetalle[]>([]);
  const [boletas, setBoletas] = useState<BoletaPago[]>([]);
  const [afpTasas, setAfpTasas] = useState<AFPTasa[]>([]);
  const [employees, setEmployees] = useState<Empleado[]>([]);

  const [selectedBoleta, setSelectedBoleta] = useState<BoletaPago | null>(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  // Estados Módulo Utilidades D.L. 892
  const [ejercicioUtilidad, setEjercicioUtilidad] = useState<number>(2026);
  const [rentaNetaEmpresa, setRentaNetaEmpresa] = useState<string>('1200000.00');
  const [porcentajeSector, setPorcentajeSector] = useState<number>(10);
  const [cierreUtilidad, setCierreUtilidad] = useState<UtilidadAnual | null>(null);
  const [detallesUtilidad, setDetallesUtilidad] = useState<UtilidadDetalle[]>([]);
  const [selectedUtilidadDetalle, setSelectedUtilidadDetalle] = useState<UtilidadDetalle | null>(null);
  const [isUtilidadModalOpen, setIsUtilidadModalOpen] = useState<boolean>(false);

  // Estados Módulo Liquidaciones por Cese (LBS)
  const [liquidaciones, setLiquidaciones] = useState<LiquidacionCese[]>([]);
  const [selectedLiquidacion, setSelectedLiquidacion] = useState<LiquidacionCese | null>(null);
  const [isProcessLiquidationModalOpen, setIsProcessLiquidationModalOpen] = useState<boolean>(false);
  const [isLiquidationPayslipModalOpen, setIsLiquidationPayslipModalOpen] = useState<boolean>(false);

  // Estados Módulo Estructuras PLAME SUNAT (PDT 0601)
  const [periodoPlame, setPeriodoPlame] = useState('2026-08');
  const [empresaPlame, setEmpresaPlame] = useState<string>(EMPRESAS_GRUPO_CARMELITA[0]);
  const [plameData, setPlameData] = useState<any>(null);
  const [loadingPlame, setLoadingPlame] = useState<boolean>(false);

  // Estados Módulo CTS (D.S. 001-97-TR)
  const [periodoCts, setPeriodoCts] = useState('2026-MAYO');
  const [cierreCts, setCierreCts] = useState<DepositoCts | null>(null);
  const [detallesCts, setDetallesCts] = useState<DepositoCtsDetalle[]>([]);
  const [selectedCtsDetalle, setSelectedCtsDetalle] = useState<DepositoCtsDetalle | null>(null);
  const [isCtsModalOpen, setIsCtsModalOpen] = useState<boolean>(false);

  // Estados Módulo Gratificaciones (Ley 27735 / Ley 29351)
  const [periodoGratificacion, setPeriodoGratificacion] = useState('2026-JULIO');
  const [cierreGratificacion, setCierreGratificacion] = useState<GratificacionSemestral | null>(null);
  const [detallesGratificacion, setDetallesGratificacion] = useState<GratificacionDetalle[]>([]);
  const [selectedGratificacionDetalle, setSelectedGratificacionDetalle] = useState<GratificacionDetalle | null>(null);
  const [isGratificacionModalOpen, setIsGratificacionModalOpen] = useState<boolean>(false);

  // Estados Módulo Parámetros Laborales
  const [parametrosLaborales, setParametrosLaborales] = useState<ParametrosLaborales>({
    uit_valor: 5350,
    rmv_valor: 1025,
    porcentaje_asig_familiar: 10,
    porcentaje_essalud: 9,
    anio_vigencia: 2026,
  });

  const [isEditingParams, setIsEditingParams] = useState(false);
  const [editUit, setEditUit] = useState('5350.00');
  const [editRmv, setEditRmv] = useState('1025.00');

  const [editingAfpId, setEditingAfpId] = useState<number | string | null>(null);
  const [editAfpAporte, setEditAfpAporte] = useState('');
  const [editAfpComision, setEditAfpComision] = useState('');
  const [editAfpSeguro, setEditAfpSeguro] = useState('');

  const handleGenerarPlame = async () => {
    setLoadingPlame(true);
    try {
      let data: any = null;
      try {
        data = await apiService.generarPlame(periodoPlame, empresaPlame);
      } catch (e) {
        console.warn('Fallback a compilación local de estructuras PLAME:', e);
      }

      const rucEmpresa = '20601234567';
      const cleanPeriodo = periodoPlame.replace('-', '');
      const fileNameRem = `0601${cleanPeriodo}${rucEmpresa}.rem`;
      const fileNameJor = `0601${cleanPeriodo}${rucEmpresa}.jor`;

      const targetDetalles = detallesPlanilla.length > 0 ? detallesPlanilla : [];

      if (targetDetalles.length > 0) {
        let linesRem: string[] = [];
        let linesJor: string[] = [];

        targetDetalles.forEach((det) => {
          const dni = det.numero_documento;
          const tipoDoc = '01'; // DNI

          const sueldo = Number(det.sueldo_basico) || 0;
          const asigFam = Number(det.asignacion_familiar) || 0;
          const he25 = Number(det.monto_horas_extras_25) || 0;
          const he35 = Number(det.monto_horas_extras_35) || 0;
          const pension = Number(det.descuento_pension) || 0;
          const ir5ta = Number(det.descuento_ir5ta) || 0;
          const tardanzas = Number(det.descuento_tardanzas) || 0;
          const essalud = Number(det.aporte_essalud) || 0;

          // 0121 - Remuneración Básica
          if (sueldo > 0) linesRem.push(`${tipoDoc}|${dni}|0121|${sueldo.toFixed(2)}|${sueldo.toFixed(2)}|`);
          // 0201 - Asignación Familiar
          if (asigFam > 0) linesRem.push(`${tipoDoc}|${dni}|0201|${asigFam.toFixed(2)}|${asigFam.toFixed(2)}|`);
          // 0105 - Horas Extras 25%
          if (he25 > 0) linesRem.push(`${tipoDoc}|${dni}|0105|${he25.toFixed(2)}|${he25.toFixed(2)}|`);
          // 0106 - Horas Extras 35%
          if (he35 > 0) linesRem.push(`${tipoDoc}|${dni}|0106|${he35.toFixed(2)}|${he35.toFixed(2)}|`);
          // 0687 - Retención pensiones (AFP/ONP)
          if (pension > 0) linesRem.push(`${tipoDoc}|${dni}|0687|${pension.toFixed(2)}|${pension.toFixed(2)}|`);
          // 0601 - IR 5ta Categoría
          if (ir5ta > 0) linesRem.push(`${tipoDoc}|${dni}|0601|${ir5ta.toFixed(2)}|${ir5ta.toFixed(2)}|`);
          // 0704 - Tardanzas y deducciones
          if (tardanzas > 0) linesRem.push(`${tipoDoc}|${dni}|0704|${tardanzas.toFixed(2)}|${tardanzas.toFixed(2)}|`);
          // 0804 - Aporte Patronal EsSalud 9%
          if (essalud > 0) linesRem.push(`${tipoDoc}|${dni}|0804|${essalud.toFixed(2)}|${essalud.toFixed(2)}|`);

          // Estructura .JOR (Jornada y Sobretiempo)
          const valorMinuto = (sueldo / 240 / 60) || 0.243055;
          const hrsOrdinarias = (det.dias_trabajados || 30) * 8;
          const minsHE = Math.round(((he25 / (valorMinuto * 1.25)) || 0) + ((he35 / (valorMinuto * 1.35)) || 0));
          const hrsHE = Math.floor(minsHE / 60);
          const minsHERestantes = minsHE % 60;

          linesJor.push(`${tipoDoc}|${dni}|${hrsOrdinarias}|0|${hrsHE}|${minsHERestantes}|`);
        });

        setPlameData({
          nombre_archivo_rem: fileNameRem,
          contenido_rem: linesRem.join('\n'),
          nombre_archivo_jor: fileNameJor,
          contenido_jor: linesJor.join('\n'),
        });
      } else if (data) {
        setPlameData(data);
      }
    } catch (e: any) {
      alert(e.message || 'Error al generar estructuras PLAME');
    } finally {
      setLoadingPlame(false);
    }
  };

  const handleDownloadFile = (filename: string, content: string) => {
    if (!content) return;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    loadData(periodo, selectedEmpresa);
  }, [periodo, selectedEmpresa]);

  useEffect(() => {
    if (activeTab === 'utilidades') {
      loadUtilidades(ejercicioUtilidad, selectedEmpresa);
    } else if (activeTab === 'liquidaciones') {
      loadLiquidaciones(selectedEmpresa);
    } else if (activeTab === 'cts') {
      loadCts(periodoCts, selectedEmpresa);
    } else if (activeTab === 'gratificaciones') {
      loadGratificaciones(periodoGratificacion, selectedEmpresa);
    } else if (activeTab === 'parametros') {
      loadParametros();
    }
  }, [activeTab, ejercicioUtilidad, periodoCts, periodoGratificacion, selectedEmpresa]);

  const loadParametros = async () => {
    try {
      const p = await apiService.getParametrosLaborales();
      if (p) {
        setParametrosLaborales(p);
        setEditUit(String(p.uit_valor || 5350));
        setEditRmv(String(p.rmv_valor || 1025));
      }
    } catch (e) {
      console.warn('Error al cargar parámetros laborales:', e);
    }
  };

  const handleSaveParametros = async () => {
    setLoading(true);
    try {
      const uitNum = parseFloat(editUit) || 5350;
      const rmvNum = parseFloat(editRmv) || 1025;
      const res = await apiService.updateParametrosLaborales({
        uit_valor: uitNum,
        rmv_valor: rmvNum,
        porcentaje_asig_familiar: 10,
        porcentaje_essalud: 9,
        anio_vigencia: 2026,
      });
      if (res.success) {
        setParametrosLaborales(res.parametros);
        setIsEditingParams(false);
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Error al guardar parámetros: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditAfp = (afp: AFPTasa) => {
    setEditingAfpId(afp.id);
    setEditAfpAporte(String(afp.aporte_obligatorio));
    setEditAfpComision(String(afp.comision_flujo));
    setEditAfpSeguro(String(afp.prima_seguro));
  };

  const handleSaveAfpTasa = async (id: number | string) => {
    setLoading(true);
    try {
      const res = await apiService.updateAFPTasa(id, {
        aporte_obligatorio: parseFloat(editAfpAporte) || 0,
        comision_flujo: parseFloat(editAfpComision) || 0,
        prima_seguro: parseFloat(editAfpSeguro) || 0,
      });
      if (res.success) {
        setAfpTasas(res.tasas);
        setEditingAfpId(null);
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Error al guardar tasa de AFP: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



  const handleOpenBoletaFromDetalle = (det: PlanillaDetalle) => {
    const bol: BoletaPago = {
      id: `bol-${det.id}`,
      planilla_detalle_id: det.id,
      empleado_id: det.empleado_id,
      periodo: periodo,
      token_seguridad: 'SEC-PERU-728',
      estado_entrega: 'Emitida',
      fecha_emision: new Date().toISOString(),
      nombre_empleado: det.nombre_empleado,
      numero_documento: det.numero_documento,
      cargo: det.cargo,
      sueldo_basico: det.sueldo_basico,
      total_ingresos: det.total_ingresos,
      total_descuentos: det.total_descuentos,
      sueldo_neto: det.sueldo_neto,
      empresa: selectedEmpresa,
    };
    setSelectedBoleta(bol);
    setIsPayslipModalOpen(true);
  };

  const enrichDetailsWithAttendance = (detalles: PlanillaDetalle[]): PlanillaDetalle[] => {
    if (!punchLogs || punchLogs.length === 0) return detalles;

    return detalles.map((det) => {
      const empLogs = punchLogs.filter(
        (l) =>
          (l.empleadoId === det.empleado_id || l.nombreEmpleado.toLowerCase() === det.nombre_empleado.toLowerCase()) &&
          l.fecha.startsWith(periodo) &&
          l.estado !== 'Anulado por RRHH'
      );

      const sueldoBasico = Number(det.sueldo_basico) || 3500;
      const asigFamiliar = Number(det.asignacion_familiar) || 102.50;

      const valorHora = sueldoBasico / 240;
      const valorMinuto = valorHora / 60;

      let montoHE25 = 0;
      let montoHE35 = 0;
      let totalMinsHE = 0;

      empLogs.forEach((l) => {
        if (l.tipo === 'Salida') {
          const [h, m] = l.hora.split(':').map(Number);
          const minMarcado = h * 60 + m;
          const dNum = new Date(l.fecha + 'T00:00:00').getDay();
          // Viernes 17:30 (1050m), L-J 17:00 (1020m)
          const minProg = dNum === 5 ? 17 * 60 + 30 : 17 * 60 + 0;
          const excess = minMarcado - minProg;

          if (excess >= 30) {
            totalMinsHE += excess;
            const min25 = Math.min(120, excess);
            const min35 = Math.max(0, excess - 120);
            montoHE25 += min25 * valorMinuto * 1.25;
            montoHE35 += min35 * valorMinuto * 1.35;
          }
        }
      });

      const totalMontoHE = montoHE25 + montoHE35;

      let totalMinsTardanza = 0;
      empLogs.forEach((l) => {
        if (l.tipo === 'Entrada') {
          const [h, m] = l.hora.split(':').map(Number);
          const minMarcado = h * 60 + m;
          // Solo evaluar ingresos en el turno de la mañana (< 12:00 h)
          if (h < 12) {
            const minProg = 7 * 60 + 0; // 07:00 AM
            const delay = minMarcado - minProg;
            // Tolerancia de 5 min y límite razonable por tardanza diaria (máx 60 min)
            if (delay > 5) {
              const tardanzaReal = Math.min(60, delay);
              totalMinsTardanza += tardanzaReal;
            }
          }
        }
      });

      const descuentoTardanzas = totalMinsTardanza * valorMinuto;
      const totalIngresos = sueldoBasico + asigFamiliar + totalMontoHE;

      const baseOriginal = Number(det.total_ingresos) || sueldoBasico;
      const pctPension = baseOriginal > 0 ? Number(det.descuento_pension) / baseOriginal : 0.13;
      const descuentoPension = totalIngresos * (pctPension || 0.13);
      const descuentoIr5ta = Number(det.descuento_ir5ta) || 0;

      const totalDescuentos = descuentoPension + descuentoIr5ta + descuentoTardanzas;
      const sueldoNeto = Math.max(0, totalIngresos - totalDescuentos);
      const aporteEssalud = totalIngresos * 0.09;

      return {
        ...det,
        monto_horas_extras_25: Number(montoHE25.toFixed(2)),
        monto_horas_extras_35: Number(montoHE35.toFixed(2)),
        total_ingresos: Number(totalIngresos.toFixed(2)),
        minutos_tardanza: totalMinsTardanza,
        descuento_tardanzas: Number(descuentoTardanzas.toFixed(2)),
        descuento_pension: Number(descuentoPension.toFixed(2)),
        total_descuentos: Number(totalDescuentos.toFixed(2)),
        sueldo_neto: Number(sueldoNeto.toFixed(2)),
        aporte_essalud: Number(aporteEssalud.toFixed(2)),
      };
    });
  };

  const loadData = async (targetPeriodo = periodo, targetEmpresa = selectedEmpresa) => {
    setLoading(true);
    try {
      let plas = await apiService.getPlanillas();
      const bols = await apiService.getBoletas();
      const afps = await apiService.getAFPTasas();
      const emps = await apiService.getEmployees([], []);

      setPlanillas(plas);
      setBoletas(bols);
      setAfpTasas(afps);
      setEmployees(emps);

      const targetSlug = targetEmpresa.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const targetId = `pla-${targetPeriodo}-${targetSlug}`;

      let foundPla = plas.find((p: any) => p.id === targetId) || plas.find((p: any) => p.empresa === targetEmpresa);

      if (!foundPla) {
        try {
          const autoRes = await apiService.procesarPlanilla(targetPeriodo, targetEmpresa);
          if (autoRes.success && autoRes.cabecera) {
            foundPla = autoRes.cabecera;
            plas = await apiService.getPlanillas();
            setPlanillas(plas);
          }
        } catch (autoErr) {
          console.warn('Auto-procesamiento de planilla inicial:', autoErr);
        }
      }

      if (foundPla) {
        const plaDetalle = await apiService.getPlanillaDetalle(foundPla.id);
        if (plaDetalle && plaDetalle.detalles) {
          setDetallesPlanilla(enrichDetailsWithAttendance(plaDetalle.detalles));
        }
      } else {
        setDetallesPlanilla([]);
      }
    } catch (e) {
      console.warn('Error al cargar datos de nóminas:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadUtilidades = async (ejercicio = ejercicioUtilidad, empresa = selectedEmpresa) => {
    setLoading(true);
    try {
      const cierres = await apiService.getUtilidades(ejercicio, empresa);
      if (cierres && cierres.length > 0) {
        const fullCierre = await apiService.getUtilidadDetalle(cierres[0].id);
        setCierreUtilidad(fullCierre);
        setDetallesUtilidad(fullCierre.detalles || []);
      } else {
        setCierreUtilidad(null);
        setDetallesUtilidad([]);
      }
    } catch (e) {
      console.warn('Error al cargar utilidades:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadLiquidaciones = async (empresa = selectedEmpresa) => {
    setLoading(true);
    try {
      const list = await apiService.getLiquidaciones(empresa);
      setLiquidaciones(list);
    } catch (e) {
      console.warn('Error al cargar liquidaciones:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadCts = async (periodo = periodoCts, empresa = selectedEmpresa) => {
    setLoading(true);
    try {
      const list = await apiService.getCts(periodo, empresa);
      if (list && list.length > 0) {
        const full = await apiService.getCtsDetalle(list[0].id);
        setCierreCts(full);
        setDetallesCts(full.detalles || []);
      } else {
        setCierreCts(null);
        setDetallesCts([]);
      }
    } catch (e) {
      console.warn('Error al cargar CTS:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadGratificaciones = async (periodo = periodoGratificacion, empresa = selectedEmpresa) => {
    setLoading(true);
    try {
      const list = await apiService.getGratificaciones(periodo, empresa);
      if (list && list.length > 0) {
        const full = await apiService.getGratificacionDetalle(list[0].id);
        setCierreGratificacion(full);
        setDetallesGratificacion(full.detalles || []);
      } else {
        setCierreGratificacion(null);
        setDetallesGratificacion([]);
      }
    } catch (e) {
      console.warn('Error al cargar Gratificaciones:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleProcesarCts = async () => {
    setLoading(true);
    try {
      const res = await apiService.procesarCts(periodoCts, selectedEmpresa);
      if (res.success) {
        setCierreCts(res.cabecera);
        setDetallesCts(res.detalles || []);
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Error al procesar CTS: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProcesarGratificacion = async () => {
    setLoading(true);
    try {
      const res = await apiService.procesarGratificacion(periodoGratificacion, selectedEmpresa);
      if (res.success) {
        setCierreGratificacion(res.cabecera);
        setDetallesGratificacion(res.detalles || []);
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Error al procesar Gratificación: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProcesarPlanilla = async () => {
    setLoading(true);
    try {
      let resultDetalles: PlanillaDetalle[] = [];
      try {
        const res = await apiService.procesarPlanilla(periodo, selectedEmpresa);
        if (res.success && res.detalles) {
          resultDetalles = res.detalles;
        }
      } catch (e) {
        console.warn('Fallback a cálculo local con datos de asistencia:', e);
      }

      if (resultDetalles.length === 0 && detallesPlanilla.length > 0) {
        resultDetalles = detallesPlanilla;
      }

      const enriched = enrichDetailsWithAttendance(resultDetalles);
      setDetallesPlanilla(enriched);
      alert(`Planilla de ${periodo} sincronizada en vivo exitosamente:\nSe cruzaron marcaciones biométricas, Horas Extras Aprobadas (25%/35%) y Tardanzas acumuladas.`);
    } catch (err: any) {
      alert(`Error al procesar planilla: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProcesarUtilidades = async () => {
    setLoading(true);
    try {
      const res = await apiService.procesarUtilidades(
        ejercicioUtilidad,
        selectedEmpresa,
        parseFloat(rentaNetaEmpresa) || 0,
        porcentajeSector
      );
      if (res.success) {
        setCierreUtilidad(res.cabecera);
        setDetallesUtilidad(res.detalles || []);
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Error al procesar utilidades: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessLiquidation = async (
    empleadoId: string,
    fechaCese: string,
    motivoCese: string,
    incluyeIndemnizacion: boolean
  ) => {
    setLoading(true);
    try {
      const res = await apiService.procesarLiquidacion(empleadoId, fechaCese, motivoCese, incluyeIndemnizacion);
      if (res.success) {
        alert(res.message);
        await loadLiquidaciones(selectedEmpresa);
      }
    } catch (err: any) {
      alert(`Error al procesar liquidación: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBoleta = (bol: BoletaPago) => {
    setSelectedBoleta(bol);
    setIsPayslipModalOpen(true);
  };

  // Helper para resolver el correo electrónico del trabajador
  const getEmployeeEmail = (doc: string, name: string) => {
    const emp =
      employees.find(
        (e) =>
          e.numeroDocumento === doc ||
          e.id === doc ||
          e.nombre.toLowerCase() === name.toLowerCase()
      ) ||
      initialEmployees.find(
        (e) =>
          e.numeroDocumento === doc ||
          e.id === doc ||
          e.nombre.toLowerCase() === name.toLowerCase()
      );
    return (
      emp?.correo ||
      `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/(^\.|\.$)/g, '')}@grupocarmelita.com`
    );
  };

  // Estados y Handlers para Despacho de Boletas por Correo
  const [isMassEmailModalOpen, setIsMassEmailModalOpen] = useState(false);
  const [massEmailProgress, setMassEmailProgress] = useState<{
    total: number;
    current: number;
    currentEmp: string;
    isSending: boolean;
    completed: boolean;
    logs: string[];
  }>({
    total: 0,
    current: 0,
    currentEmp: '',
    isSending: false,
    completed: false,
    logs: [],
  });

  const handleSendSingleBoletaEmail = async (det: PlanillaDetalle) => {
    const defaultEmail = getEmployeeEmail(det.numero_documento, det.nombre_empleado);
    const targetEmail = prompt(
      `Confirmar correo destinatario para enviar la boleta de ${det.nombre_empleado}:`,
      defaultEmail
    );
    if (!targetEmail || !targetEmail.trim()) return;

    setLoading(true);
    try {
      const res = await apiService.sendBoletaEmail({
        boleta_id: `bol-${det.id}`,
        empleado_id: det.empleado_id,
        nombre_empleado: det.nombre_empleado,
        correo: targetEmail.trim(),
        periodo: periodo,
        empresa: selectedEmpresa,
        sueldo_neto: Number(det.sueldo_neto),
      });

      if (res.success) {
        alert(`✅ ${res.message}`);
      }
    } catch (err: any) {
      alert(`Error al enviar boleta: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteMassEmail = async () => {
    if (filteredDetallesPlanilla.length === 0) return;

    setMassEmailProgress({
      total: filteredDetallesPlanilla.length,
      current: 0,
      currentEmp: 'Iniciando conexión con servidor SMTP...',
      isSending: true,
      completed: false,
      logs: [],
    });

    const items = filteredDetallesPlanilla.map((det) => ({
      empleado_id: det.empleado_id,
      nombre_empleado: det.nombre_empleado,
      correo: getEmployeeEmail(det.numero_documento, det.nombre_empleado),
      sueldo_neto: Number(det.sueldo_neto),
    }));

    const newLogs: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setMassEmailProgress((prev) => ({
        ...prev,
        current: i + 1,
        currentEmp: `${item.nombre_empleado} → ${item.correo}`,
      }));

      // Latencia realista para despacho seguro por lotes
      await new Promise((resolve) => setTimeout(resolve, 400));

      try {
        const res = await apiService.sendBoletaEmail({
          boleta_id: `bol-${item.empleado_id}-${periodo}`,
          empleado_id: item.empleado_id,
          nombre_empleado: item.nombre_empleado,
          correo: item.correo,
          periodo: periodo,
          empresa: selectedEmpresa,
          sueldo_neto: item.sueldo_neto,
        });
        newLogs.push(`✅ [${i + 1}/${items.length}] Boleta entregada a ${item.nombre_empleado} (${item.correo})`);
      } catch (e: any) {
        newLogs.push(`⚠️ [${i + 1}/${items.length}] Error enviando a ${item.correo}`);
      }

      setMassEmailProgress((prev) => ({
        ...prev,
        logs: [...newLogs],
      }));
    }

    setMassEmailProgress((prev) => ({
      ...prev,
      isSending: false,
      completed: true,
      currentEmp: '¡Despacho masivo finalizado exitosamente!',
    }));
  };

  const currentPlanilla = planillas.find((p) => p.empresa === selectedEmpresa && p.periodo === periodo) || planillas[0];

  const filteredDetallesPlanilla = useMemo(() => {
    return detallesPlanilla.filter((det) => {
      if ((det as any).empresa) {
        return (det as any).empresa === selectedEmpresa;
      }
      const emp = initialEmployees.find(
        (e) => e.id === det.empleado_id || (e.numeroDocumento && e.numeroDocumento === det.numero_documento)
      );
      const empEmpresa = emp?.empresa || 'Importaciones Carmelita del Norte S.A.C.';
      return empEmpresa === selectedEmpresa;
    });
  }, [detallesPlanilla, selectedEmpresa, initialEmployees]);

  const computedPlanillaSummary = useMemo(() => {
    if (!filteredDetallesPlanilla || filteredDetallesPlanilla.length === 0) {
      return (
        currentPlanilla || {
          total_ingresos: 0,
          total_descuentos: 0,
          total_neto_pagar: 0,
          total_aportes_empleador: 0,
        }
      );
    }

    const totalIngresos = filteredDetallesPlanilla.reduce((sum, d) => sum + Number(d.total_ingresos || 0), 0);
    const totalDescuentos = filteredDetallesPlanilla.reduce((sum, d) => sum + Number(d.total_descuentos || 0), 0);
    const totalNeto = filteredDetallesPlanilla.reduce((sum, d) => sum + Number(d.sueldo_neto || 0), 0);
    const totalEssalud = filteredDetallesPlanilla.reduce((sum, d) => sum + Number(d.aporte_essalud || 0), 0);

    return {
      total_ingresos: totalIngresos,
      total_descuentos: totalDescuentos,
      total_neto_pagar: totalNeto,
      total_aportes_empleador: totalEssalud,
    };
  }, [filteredDetallesPlanilla, currentPlanilla]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-blue-600 text-[28px]">payments</span>
            Nóminas & Boletas de Pago (Normativa Peruana)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Planillas D.L. 728, Boletas de Cese / LBS, Utilidades D.L. 892 y Aportes AFPs/SUNAT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleProcesarPlanilla}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">calculate</span>
            {loading ? 'Calculando...' : 'Calcular Planilla en Vivo'}
          </button>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('planillas')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'planillas'
              ? 'border-blue-600 text-blue-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">table_chart</span>
          Planillas Mensuales & Cálculo
        </button>



        <button
          onClick={() => setActiveTab('liquidaciones')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'liquidaciones'
              ? 'border-rose-600 text-rose-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">badge</span>
          Liquidaciones por Cese (LBS)
        </button>

        <button
          onClick={() => setActiveTab('cts')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'cts'
              ? 'border-blue-600 text-blue-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">account_balance</span>
          Depósitos de CTS (D.S. 001-97-TR)
        </button>

        <button
          onClick={() => setActiveTab('gratificaciones')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'gratificaciones'
              ? 'border-purple-600 text-purple-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">card_giftcard</span>
          Gratificaciones Legales (Ley 29351)
        </button>

        <button
          onClick={() => setActiveTab('utilidades')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'utilidades'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">payments</span>
          Reparto de Utilidades (D.L. 892)
        </button>

        <button
          onClick={() => setActiveTab('plame')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'plame'
              ? 'border-blue-600 text-blue-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">folder_zip</span>
          Estructuras PLAME / SUNAT
        </button>

        <button
          onClick={() => setActiveTab('parametros')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'parametros'
              ? 'border-blue-600 text-blue-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">settings_account_box</span>
          Parámetros Perú (UIT, RMV, AFPs)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: PLANILLAS MENSUALES Y CÁLCULO                                 */}
      {/* ========================================================================= */}
      {activeTab === 'planillas' && (
        <div className="space-y-6">
          {/* Tarjetas de Resumen Financiero de Planilla */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Planilla Bruta</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                S/ {Number(computedPlanillaSummary.total_ingresos).toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Descuentos Ley</span>
              <p className="text-xl font-bold font-mono text-rose-600 mt-1">
                - S/ {Number(computedPlanillaSummary.total_descuentos).toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Neto a Pagar</span>
              <p className="text-xl font-bold font-mono text-emerald-600 mt-1">
                S/ {Number(computedPlanillaSummary.total_neto_pagar).toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Aportes Empleador (EsSalud)</span>
              <p className="text-xl font-bold font-mono text-blue-600 mt-1">
                S/ {Number(computedPlanillaSummary.total_aportes_empleador).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Filtros de Empresa y Periodo */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Periodo Laboral</label>
                <input
                  type="month"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Empresa (Grupo Carmelita)</label>
                <select
                  value={selectedEmpresa}
                  onChange={(e) => setSelectedEmpresa(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 outline-none"
                >
                  {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMassEmailProgress({
                    total: filteredDetallesPlanilla.length,
                    current: 0,
                    currentEmp: '',
                    isSending: false,
                    completed: false,
                    logs: [],
                  });
                  setIsMassEmailModalOpen(true);
                }}
                disabled={filteredDetallesPlanilla.length === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                title="Despachar boletas electrónicas de pago por correo a todos los colaboradores procesados"
              >
                <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                Despachar Boletas por Correo (Masivo)
              </button>

              <button
                type="button"
                onClick={handleProcesarPlanilla}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">sync</span>
                Sincronizar Marcaciones & Calcular
              </button>
            </div>
          </div>

          {/* Tabla Detalle Remunerativo por Colaborador */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Detalle Remunerativo por Colaborador ({filteredDetallesPlanilla.length} registros procesados)
              </h3>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Estado: PROCESADO DECRETO LEY 728
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Colaborador / Documento</th>
                    <th className="p-3.5">Cargo / Puesto</th>
                    <th className="p-3.5 text-right">Sueldo Básico</th>
                    <th className="p-3.5 text-right text-emerald-800 font-bold">Total Ingresos</th>
                    <th className="p-3.5 text-right text-rose-700 font-bold">Total Descuentos</th>
                    <th className="p-3.5 text-right text-emerald-700 font-extrabold">Sueldo Neto</th>
                    <th className="p-3.5 text-center">Acciones / Boleta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredDetallesPlanilla.length > 0 ? (
                    filteredDetallesPlanilla.map((det) => {
                      return (
                        <tr key={det.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-sans font-bold text-slate-900 whitespace-nowrap">
                            {det.nombre_empleado}
                            <p className="text-[10px] text-slate-500 font-mono font-normal">DNI: {det.numero_documento}</p>
                          </td>
                          <td className="p-3.5 font-sans text-slate-600 text-xs whitespace-nowrap">{det.cargo}</td>
                          <td className="p-3.5 text-right text-slate-700 font-medium">S/ {Number(det.sueldo_basico).toFixed(2)}</td>
                          <td className="p-3.5 text-right font-bold text-emerald-800 bg-emerald-50/30">
                            S/ {Number(det.total_ingresos).toFixed(2)}
                          </td>
                          <td className="p-3.5 text-right font-bold text-rose-600 bg-rose-50/30">
                            - S/ {Number(det.total_descuentos).toFixed(2)}
                          </td>
                          <td className="p-3.5 text-right font-extrabold text-emerald-700 text-sm bg-emerald-50/60">
                            S/ {Number(det.sueldo_neto).toFixed(2)}
                          </td>
                          <td className="p-3.5 text-center font-sans whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenBoletaFromDetalle(det)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 border border-blue-200 font-bold rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                title="Ver Desglose Completo e Imprimir Boleta Oficial PDF"
                              >
                                <span className="material-symbols-outlined text-[15px]">visibility</span>
                                Ver Boleta PDF
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendSingleBoletaEmail(det)}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                title="Enviar Boleta por Correo Electrónico al Trabajador"
                              >
                                <span className="material-symbols-outlined text-[15px]">mail</span>
                                Enviar Correo
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                        No hay detalles de planilla para el periodo y empresa seleccionados. Haga clic en "Sincronizar Marcaciones & Calcular".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* PESTAÑA 3: LIQUIDACIONES POR CESE (LBS & BOLETAS TRUNCAS)                */}
      {/* ========================================================================= */}
      {activeTab === 'liquidaciones' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-600 text-[22px]">person_remove</span>
                  Liquidaciones de Beneficios Sociales (LBS) & Boletas Truncas
                </h3>
                <p className="text-xs text-slate-500">
                  Cálculo de Boletas Truncas, CTS, Vacaciones, Gratificaciones Ley 29351 y Cartas de Liberación de CTS.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedEmpresa}
                  onChange={(e) => setSelectedEmpresa(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 outline-none"
                >
                  {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsProcessLiquidationModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">person_remove</span>
                  Procesar Cese & Liquidación
                </button>
              </div>
            </div>

            {/* Tabla de Liquidaciones por Cese */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Ex-Colaborador / DNI</th>
                    <th className="p-3">Fecha Ingreso</th>
                    <th className="p-3 font-mono text-rose-700">Fecha Cese</th>
                    <th className="p-3">Motivo Término</th>
                    <th className="p-3 font-mono">Boleta Trunca</th>
                    <th className="p-3 font-mono">CTS Trunca</th>
                    <th className="p-3 font-mono">Vacaciones</th>
                    <th className="p-3 font-mono">Gratificación</th>
                    <th className="p-3 font-mono text-emerald-700 font-bold">Total LBS Neto</th>
                    <th className="p-3 text-right">Documentos Legales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {liquidaciones.length > 0 ? (
                    liquidaciones.map((liq) => (
                      <tr key={liq.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-sans font-bold text-slate-900 whitespace-nowrap">
                          {liq.nombre_empleado}
                          <p className="text-[10px] text-slate-500 font-mono font-normal">DNI: {liq.numero_documento} • {liq.cargo}</p>
                        </td>
                        <td className="p-3 text-slate-700">{liq.fecha_ingreso}</td>
                        <td className="p-3 font-bold text-rose-700">{liq.fecha_cese}</td>
                        <td className="p-3 font-sans">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-full font-bold text-[10px]">
                            {liq.motivo_cese}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800">S/ {Number(liq.monto_boleta_trunca).toFixed(2)}</td>
                        <td className="p-3 text-slate-800">S/ {Number(liq.monto_cts_trunca).toFixed(2)}</td>
                        <td className="p-3 text-slate-800">S/ {Number(liq.monto_vacaciones_truncas).toFixed(2)}</td>
                        <td className="p-3 text-slate-800">S/ {(Number(liq.monto_gratificacion_trunca) + Number(liq.monto_bonificacion_ley)).toFixed(2)}</td>
                        <td className="p-3 font-bold text-emerald-700 text-sm">S/ {Number(liq.total_neto_lbs).toFixed(2)}</td>
                        <td className="p-3 text-right font-sans">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLiquidacion(liq);
                              setIsLiquidationPayslipModalOpen(true);
                            }}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">description</span>
                            Hoja LBS & Carta CTS
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400 font-sans">
                        No hay liquidaciones de cese registradas para la empresa seleccionada. Haga clic en "Procesar Cese & Liquidación".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA: DEPÓSITOS DE CTS (D.S. 001-97-TR)                                */}
      {/* ========================================================================= */}
      {activeTab === 'cts' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[22px]">account_balance</span>
                  Depósitos Semestrales de CTS (D.S. 001-97-TR)
                </h3>
                <p className="text-xs text-slate-500">
                  Cálculo de la Remuneración Computable (+ 1/6 de Gratificación) y emisión de Constancias de Depósito (Mayo / Noviembre).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={periodoCts}
                  onChange={(e) => setPeriodoCts(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 outline-none"
                >
                  <option value="2026-MAYO">Semestre Nov-Abr (Depósito Mayo 2026)</option>
                  <option value="2026-NOVIEMBRE">Semestre May-Oct (Depósito Noviembre 2026)</option>
                </select>

                <select
                  value={selectedEmpresa}
                  onChange={(e) => setSelectedEmpresa(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 outline-none"
                >
                  {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleProcesarCts}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">calculate</span>
                  Calcular Depósitos CTS
                </button>
              </div>
            </div>

            {/* Resumen del Cierre CTS */}
            {cierreCts && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-blue-50/50 border border-blue-200 rounded-xl font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Período Semestral</span>
                  <span className="font-extrabold text-blue-900 text-sm">{cierreCts.periodo_semestral}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Trabajadores Beneficiarios</span>
                  <span className="font-extrabold text-slate-900 text-sm">{cierreCts.conteo_trabajadores} colaboradores</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Monto Total Depositado</span>
                  <span className="font-extrabold text-emerald-700 text-sm">S/ {Number(cierreCts.monto_total_depositado || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}

            {/* Tabla de Detalle por Trabajador */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Colaborador / DNI</th>
                    <th className="p-3">Sueldo Básico</th>
                    <th className="p-3">Asig. Familiar</th>
                    <th className="p-3 font-mono text-purple-700">1/6 Grati</th>
                    <th className="p-3 font-mono font-bold text-slate-900">Rem. Computable</th>
                    <th className="p-3">Tiempo Serv.</th>
                    <th className="p-3 font-mono text-emerald-700 font-bold">Monto CTS Depositado</th>
                    <th className="p-3">Banco / Cuenta CTS</th>
                    <th className="p-3 text-right">Constancia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {detallesCts.length > 0 ? (
                    detallesCts.map((det) => (
                      <tr key={det.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{det.nombre_empleado}</p>
                          <p className="text-[10px] text-slate-400 font-mono">DNI: {det.numero_documento} • {det.cargo}</p>
                        </td>
                        <td className="p-3 font-mono">S/ {Number(det.sueldo_basico).toFixed(2)}</td>
                        <td className="p-3 font-mono">S/ {Number(det.asignacion_familiar).toFixed(2)}</td>
                        <td className="p-3 font-mono text-purple-700 font-bold">S/ {Number(det.sexto_gratificacion).toFixed(2)}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">S/ {Number(det.remuneracion_computable).toFixed(2)}</td>
                        <td className="p-3 font-semibold">{det.meses_laborados} meses</td>
                        <td className="p-3 font-mono text-emerald-700 font-extrabold text-sm">S/ {Number(det.monto_cts_depositado).toFixed(2)}</td>
                        <td className="p-3">
                          <p className="font-bold text-blue-700 text-[11px]">{det.banco_cts}</p>
                          <p className="font-mono text-[10px] text-slate-500">{det.numero_cuenta_cts}</p>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCtsDetalle(det);
                              setIsCtsModalOpen(true);
                            }}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">description</span>
                            Constancia CTS
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-sans">
                        No hay depósitos de CTS registrados para el período y empresa seleccionada. Haga clic en "Calcular Depósitos CTS".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA: GRATIFICACIONES LEGALES (LEY 27735 / LEY 29351)                 */}
      {/* ========================================================================= */}
      {activeTab === 'gratificaciones' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600 text-[22px]">card_giftcard</span>
                  Gratificaciones Legales (Ley 27735) & Bonificación 9% Ley 29351
                </h3>
                <p className="text-xs text-slate-500">
                  Cálculo de Gratificaciones de Fiestas Patrias (Julio) y Navidad (Diciembre) con la Bonificación Extraordinaria del 9% inafecta a EsSalud/Pensiones.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={periodoGratificacion}
                  onChange={(e) => setPeriodoGratificacion(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 outline-none"
                >
                  <option value="2026-JULIO">Gratificación Fiestas Patrias (Julio 2026)</option>
                  <option value="2026-DICIEMBRE">Gratificación Navidad (Diciembre 2026)</option>
                </select>

                <select
                  value={selectedEmpresa}
                  onChange={(e) => setSelectedEmpresa(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 outline-none"
                >
                  {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleProcesarGratificacion}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">calculate</span>
                  Calcular Gratificación en Vivo
                </button>
              </div>
            </div>

            {/* Resumen del Cierre Gratificación */}
            {cierreGratificacion && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-purple-50/50 border border-purple-200 rounded-xl font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Período Festivo</span>
                  <span className="font-extrabold text-purple-900 text-sm">{cierreGratificacion.periodo_semestral}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Trabajadores Beneficiarios</span>
                  <span className="font-extrabold text-slate-900 text-sm">{cierreGratificacion.conteo_trabajadores} colaboradores</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Gratificación Bruta Total</span>
                  <span className="font-extrabold text-slate-900 text-sm">S/ {Number(cierreGratificacion.total_gratificacion_bruta || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Bonificación Ley 9%</span>
                  <span className="font-extrabold text-emerald-700 text-sm">S/ {Number(cierreGratificacion.total_bonificacion_ley || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}

            {/* Tabla de Detalle Gratificación */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Colaborador / DNI</th>
                    <th className="p-3">Sueldo Básico</th>
                    <th className="p-3">Asig. Familiar</th>
                    <th className="p-3 font-mono font-bold text-slate-900">Rem. Computable</th>
                    <th className="p-3 font-mono text-purple-700">Gratificación Bruta</th>
                    <th className="p-3 font-mono text-emerald-700">Bonificación 9%</th>
                    <th className="p-3 font-mono text-emerald-700 font-bold">Total Neto a Pagar</th>
                    <th className="p-3 text-right">Boleta Ley</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {detallesGratificacion.length > 0 ? (
                    detallesGratificacion.map((det) => (
                      <tr key={det.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{det.nombre_empleado}</p>
                          <p className="text-[10px] text-slate-400 font-mono">DNI: {det.numero_documento} • {det.cargo}</p>
                        </td>
                        <td className="p-3 font-mono">S/ {Number(det.sueldo_basico).toFixed(2)}</td>
                        <td className="p-3 font-mono">S/ {Number(det.asignacion_familiar).toFixed(2)}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">S/ {Number(det.remuneracion_computable).toFixed(2)}</td>
                        <td className="p-3 font-mono font-bold text-purple-700">S/ {Number(det.monto_gratificacion).toFixed(2)}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">+S/ {Number(det.monto_bonificacion_ley9).toFixed(2)}</td>
                        <td className="p-3 font-mono text-emerald-700 font-extrabold text-sm">S/ {Number(det.total_neto_pagar).toFixed(2)}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGratificacionDetalle(det);
                              setIsGratificacionModalOpen(true);
                            }}
                            className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">description</span>
                            Boleta Grati
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-sans">
                        No hay gratificaciones registradas para el período y empresa seleccionada. Haga clic en "Calcular Gratificación en Vivo".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {activeTab === 'utilidades' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Panel de Configuración y Cálculo */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[22px]">payments</span>
                  Cálculo & Reparto Anual de Utilidades (D.L. 892)
                </h3>
                <p className="text-xs text-slate-500">
                  Distribución legal proporcional (50% Días Laborados + 50% Remuneraciones) por RUC / Empresa.
                </p>
              </div>
              <button
                type="button"
                onClick={handleProcesarUtilidades}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">calculate</span>
                {loading ? 'Calculando...' : 'Calcular Reparto de Utilidades'}
              </button>
            </div>

            {/* Filtros de Empresa, Ejercicio y Renta Neta */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ejercicio Fiscal</label>
                <select
                  value={ejercicioUtilidad}
                  onChange={(e) => setEjercicioUtilidad(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold font-mono text-slate-900 outline-none cursor-pointer"
                >
                  <option value={2026}>Año Fiscal 2026</option>
                  <option value={2025}>Año Fiscal 2025</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Empresa (RUC Específico)</label>
                <select
                  value={selectedEmpresa}
                  onChange={(e) => setSelectedEmpresa(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 outline-none cursor-pointer"
                >
                  {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Renta Neta Imponible (S/.) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={rentaNetaEmpresa}
                  onChange={(e) => setRentaNetaEmpresa(e.target.value)}
                  placeholder="Ej. 1200000.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Porcentaje del Rubro Sectorial</label>
                <select
                  value={porcentajeSector}
                  onChange={(e) => setPorcentajeSector(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-blue-700 outline-none cursor-pointer"
                >
                  <option value={10}>10% — Industria / Pesca / Telecom</option>
                  <option value={8}>8% — Comercio / Minería / Restaurantes</option>
                  <option value={5}>5% — Servicios y Otras Actividades</option>
                </select>
              </div>
            </div>

            {/* Resumen General de Cierre */}
            {cierreUtilidad && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Pozo Total a Repartir</span>
                  <span className="text-lg font-bold text-emerald-800">
                    S/ {cierreUtilidad.monto_total_distribuir.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">50% por Días ({cierreUtilidad.total_dias_empresa} d)</span>
                  <span className="text-base font-bold text-slate-800">
                    S/ {cierreUtilidad.monto_50_dias.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">50% por Sueldos</span>
                  <span className="text-base font-bold text-slate-800">
                    S/ {cierreUtilidad.monto_50_remuneraciones.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Colaboradores Beneficiarios</span>
                  <span className="text-base font-bold text-blue-700">
                    {cierreUtilidad.conteo_trabajadores} Colaboradores
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tabla de Liquidación Individual */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Colaborador / Documento</th>
                    <th className="p-3">Cargo</th>
                    <th className="p-3 font-mono">Días Trab.</th>
                    <th className="p-3 font-mono">Monto 1 (Días)</th>
                    <th className="p-3 font-mono">Sueldo Anual</th>
                    <th className="p-3 font-mono">Monto 2 (Sueldo)</th>
                    <th className="p-3 font-mono">Utilidad Bruta</th>
                    <th className="p-3 font-mono text-rose-600">IR 5ta Cat.</th>
                    <th className="p-3 font-mono text-emerald-700">Neto a Pagar</th>
                    <th className="p-3 text-right">Liquidación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {detallesUtilidad.length > 0 ? (
                    detallesUtilidad.map((det) => (
                      <tr key={det.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-sans font-bold text-slate-900 whitespace-nowrap">
                          {det.nombre_empleado}
                          <p className="text-[10px] text-slate-500 font-mono font-normal">DNI: {det.numero_documento}</p>
                        </td>
                        <td className="p-3 font-sans text-slate-600 text-[11px] whitespace-nowrap">{det.cargo}</td>
                        <td className="p-3 text-slate-700">{det.dias_laborados_trabajador} d</td>
                        <td className="p-3 text-slate-800">S/ {Number(det.monto_por_dias || 0).toFixed(2)}</td>
                        <td className="p-3 text-slate-800">S/ {Number(det.remuneracion_anual_trabajador || 0).toFixed(2)}</td>
                        <td className="p-3 text-slate-800">S/ {Number(det.monto_por_remuneracion || 0).toFixed(2)}</td>
                        <td className="p-3 font-bold text-slate-900">S/ {Number(det.utilidad_bruta || 0).toFixed(2)}</td>
                        <td className="p-3 text-rose-600">-S/ {Number(det.descuento_ir5ta || 0).toFixed(2)}</td>
                        <td className="p-3 font-bold text-emerald-700 text-sm">S/ {Number(det.utilidad_neta_pagar || 0).toFixed(2)}</td>
                        <td className="p-3 text-right font-sans">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUtilidadDetalle(det);
                              setIsUtilidadModalOpen(true);
                            }}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">description</span>
                            Hoja Liquidación
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400 font-sans">
                        Ingresa la Renta Neta de la empresa seleccionada y haz clic en "Calcular Reparto de Utilidades".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 5: ESTRUCTURAS PLAME / SUNAT                                      */}
      {/* ========================================================================= */}
      {activeTab === 'plame' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs animate-in fade-in text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-headline">
                Generador de Archivos PLAME / T-Registro (SUNAT PDT 0601)
              </h3>
              <p className="text-slate-500 text-xs">
                Exportación de estructuras de texto delimitadas por '|' (.rem, .jor) listas para importar directamente al aplicativo PDT 0601 PLAME.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerarPlame}
              disabled={loadingPlame}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">difference</span>
              {loadingPlame ? 'Generando...' : 'Generar Estructuras SUNAT'}
            </button>
          </div>

          {/* Formulario de Parámetros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Período Tributario (Año-Mes)
              </label>
              <input
                type="month"
                value={periodoPlame}
                onChange={(e) => setPeriodoPlame(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Empresa RUC Emisora
              </label>
              <select
                value={empresaPlame}
                onChange={(e) => setEmpresaPlame(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
              >
                {EMPRESAS_GRUPO_CARMELITA.map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resultado de la Generación */}
          {plameData ? (
            <div className="space-y-6 animate-in fade-in">
              {/* Tarjetas de Descarga Directa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Archivo 01: .REM */}
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono font-bold text-sm text-blue-900">
                        {plameData.nombre_archivo_rem}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-full">
                        Estructura 01
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Remuneraciones, Asignación Familiar, Horas Extras, Retención pensiones (AFP/ONP), IR 5ta Categoría y Aporte EsSalud (9%).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(plameData.nombre_archivo_rem, plameData.contenido_rem)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Descargar Archivo .REM
                  </button>
                </div>

                {/* Archivo 02: .JOR */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono font-bold text-sm text-emerald-900">
                        {plameData.nombre_archivo_jor}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                        Estructura 02
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Jornada laboral ordinaria (horas trabajadas), minutos ordinarios y sobretiempos de los colaboradores.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(plameData.nombre_archivo_jor, plameData.contenido_jor)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Descargar Archivo .JOR
                  </button>
                </div>
              </div>

              {/* Previsualización del Contenido Plano */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Previsualización Texto Plano Delimitado SUNAT (|)
                </h4>
                <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-2xl overflow-x-auto border border-slate-800 space-y-2">
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">--- {plameData.nombre_archivo_rem} ---</span>
                    <pre className="whitespace-pre">{plameData.contenido_rem || '(Sin registros)'}</pre>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 font-bold block mb-1">--- {plameData.nombre_archivo_jor} ---</span>
                    <pre className="whitespace-pre">{plameData.contenido_jor || '(Sin registros)'}</pre>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl space-y-2">
              <span className="material-symbols-outlined text-[36px] text-slate-300">folder_open</span>
              <p className="font-bold text-slate-600">Selecciona el período tributario y haz clic en "Generar Estructuras SUNAT".</p>
              <p className="text-slate-400 text-[11px]">Se compilarán los archivos estructurados .rem y .jor listos para importar al PDT PLAME.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA: PARÁMETROS PERÚ (UIT, RMV, AFPs)                                */}
      {/* ========================================================================= */}
      {activeTab === 'parametros' && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs animate-in fade-in text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-headline">
                Gestor de Parámetros y Tablas del Sistema Laboral Peruano ({parametrosLaborales.anio_vigencia || 2026})
              </h3>
              <p className="text-slate-500 text-xs">
                Modifica y actualiza en tiempo real los valores legales de la UIT, RMV y las comisiones previsionales de AFPs/ONP almacenados en MySQL.
              </p>
            </div>
            {!isEditingParams ? (
              <button
                type="button"
                onClick={() => setIsEditingParams(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Editar Parámetros Legales (UIT / RMV)
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveParametros}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Guardar Cambios en MySQL
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingParams(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Formulario / Tarjetas Editables de Parámetros Legales */}
          {!isEditingParams ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-1">
                <span className="text-[10px] text-blue-700 font-bold uppercase block tracking-wider">
                  Unidad Impositiva Tributaria (UIT {parametrosLaborales.anio_vigencia})
                </span>
                <span className="text-2xl font-extrabold text-blue-900">
                  S/ {Number(parametrosLaborales.uit_valor || 5350).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] font-sans text-slate-500 font-medium">Usado para deducción de 7 UIT en IR 5ta Cat.</p>
              </div>
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-[10px] text-emerald-700 font-bold uppercase block tracking-wider">
                  Remuneración Mínima Vital (RMV)
                </span>
                <span className="text-2xl font-extrabold text-emerald-900">
                  S/ {Number(parametrosLaborales.rmv_valor || 1025).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] font-sans text-slate-500 font-medium">Sueldo piso legal obligatorio en Perú</p>
              </div>
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-1">
                <span className="text-[10px] text-purple-700 font-bold uppercase block tracking-wider">
                  Asignación Familiar (10% RMV)
                </span>
                <span className="text-2xl font-extrabold text-purple-900">
                  S/ {Number((parametrosLaborales.rmv_valor || 1025) * 0.10).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] font-sans text-slate-500 font-medium">Calculado automáticamente (Ley 25129)</p>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-slate-50 border border-blue-200 rounded-2xl space-y-4 animate-in fade-in">
              <h4 className="font-bold text-xs text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">settings</span>
                Actualización de Parámetros Laborales Peruano (2026)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Valor de la UIT (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editUit}
                    onChange={(e) => setEditUit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Ejemplo: 5350.00 para el ejercicio fiscal 2026.</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Remuneración Mínima Vital - RMV (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editRmv}
                    onChange={(e) => setEditRmv(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Asignación Familiar (10%): <strong className="text-purple-700">S/ {(parseFloat(editRmv || '0') * 0.10).toFixed(2)}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Tasas y Comisiones de AFPs */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Comisiones y Primas del Sistema Privado de Pensiones (AFP) y ONP
              </h4>
              <span className="text-[11px] text-slate-500">Haz clic en ✏️ para modificar las comisiones de cualquier entidad</span>
            </div>
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-2xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Entidad Previsional</th>
                    <th className="p-3 text-right">Aporte Obligatorio</th>
                    <th className="p-3 text-right">Comisión sobre Flujo</th>
                    <th className="p-3 text-right">Prima de Seguro</th>
                    <th className="p-3 text-right font-bold text-slate-800">Descuento Total Aprox.</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {afpTasas.map((afp) => {
                    const isEditingThis = editingAfpId === afp.id;
                    const totalApprox = isEditingThis
                      ? (parseFloat(editAfpAporte) || 0) + (parseFloat(editAfpComision) || 0) + (parseFloat(editAfpSeguro) || 0)
                      : Number(afp.aporte_obligatorio) + Number(afp.comision_flujo) + Number(afp.prima_seguro);

                    return (
                      <tr key={afp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{afp.nombre}</td>

                        {/* Aporte Obligatorio */}
                        <td className="p-3 text-right font-mono">
                          {isEditingThis ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editAfpAporte}
                              onChange={(e) => setEditAfpAporte(e.target.value)}
                              className="w-20 px-2 py-1 bg-white border border-blue-400 rounded-lg text-right font-mono font-bold text-xs"
                            />
                          ) : (
                            `${Number(afp.aporte_obligatorio).toFixed(2)}%`
                          )}
                        </td>

                        {/* Comisión Flujo */}
                        <td className="p-3 text-right font-mono">
                          {isEditingThis ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editAfpComision}
                              onChange={(e) => setEditAfpComision(e.target.value)}
                              className="w-20 px-2 py-1 bg-white border border-blue-400 rounded-lg text-right font-mono font-bold text-xs"
                            />
                          ) : (
                            `${Number(afp.comision_flujo).toFixed(2)}%`
                          )}
                        </td>

                        {/* Prima Seguro */}
                        <td className="p-3 text-right font-mono">
                          {isEditingThis ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editAfpSeguro}
                              onChange={(e) => setEditAfpSeguro(e.target.value)}
                              className="w-20 px-2 py-1 bg-white border border-blue-400 rounded-lg text-right font-mono font-bold text-xs"
                            />
                          ) : (
                            `${Number(afp.prima_seguro).toFixed(2)}%`
                          )}
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-blue-700">
                          {totalApprox.toFixed(2)}%
                        </td>

                        {/* Botones de Edición */}
                        <td className="p-3 text-center">
                          {!isEditingThis ? (
                            <button
                              type="button"
                              onClick={() => handleStartEditAfp(afp)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                              Editar
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSaveAfpTasa(afp.id)}
                                className="px-2 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingAfpId(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] cursor-pointer"
                              >
                                X
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Previsualización Boleta PDF Mensual */}
      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        boleta={selectedBoleta}
        detalle={detallesPlanilla.find((d) => d.empleado_id === selectedBoleta?.empleado_id)}
        employeeEmail={
          selectedBoleta
            ? getEmployeeEmail(selectedBoleta.numero_documento, selectedBoleta.nombre_empleado)
            : undefined
        }
      />

      {/* Modal Despacho Masivo de Boletas de Pago por Correo */}
      {isMassEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">forward_to_inbox</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-headline">
                    Despacho Masivo de Boletas de Pago
                  </h3>
                  <p className="text-xs text-slate-500">
                    Envío electrónico oficial por correo a los trabajadores de {selectedEmpresa}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!massEmailProgress.isSending) setIsMassEmailModalOpen(false);
                }}
                disabled={massEmailProgress.isSending}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Resumen del Lote */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold">Periodo Laboral:</span>
                <span className="font-mono font-bold text-slate-900">{periodo}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold">Empresa del Grupo:</span>
                <span className="font-bold text-slate-900">{selectedEmpresa}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 border-t border-slate-200/80 pt-2">
                <span className="font-semibold">Total de Boletas a Despachar:</span>
                <span className="font-mono font-extrabold text-indigo-700 text-sm">
                  {filteredDetallesPlanilla.length} Colaboradores
                </span>
              </div>
            </div>

            {/* Progreso de Envío en Tiempo Real */}
            {massEmailProgress.isSending && (
              <div className="space-y-2 p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200 animate-in fade-in">
                <div className="flex justify-between items-center text-xs font-bold text-indigo-900">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    Despachando Boletas Electrónicas...
                  </span>
                  <span>
                    {massEmailProgress.current} / {massEmailProgress.total}
                  </span>
                </div>
                <div className="w-full bg-indigo-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{
                      width: `${(massEmailProgress.current / massEmailProgress.total) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-[11px] text-indigo-700 font-mono truncate">
                  {massEmailProgress.currentEmp}
                </p>
              </div>
            )}

            {/* Mensaje de Finalización */}
            {massEmailProgress.completed && (
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">task_alt</span>
                  ¡Despacho masivo completado con éxito!
                </div>
                <p className="text-[11px] text-emerald-700">
                  Se enviaron las boletas oficiales del periodo {periodo} a las casillas de correo de todos los colaboradores procesados.
                </p>
                <div className="max-h-28 overflow-y-auto space-y-1 font-mono text-[10px] bg-white p-2 rounded-lg border border-emerald-200">
                  {massEmailProgress.logs.map((log, idx) => (
                    <p key={idx}>{log}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Footer de Acciones */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMassEmailModalOpen(false)}
                disabled={massEmailProgress.isSending}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-40"
              >
                {massEmailProgress.completed ? 'Cerrar' : 'Cancelar'}
              </button>

              {!massEmailProgress.completed && (
                <button
                  type="button"
                  onClick={handleExecuteMassEmail}
                  disabled={massEmailProgress.isSending || filteredDetallesPlanilla.length === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  {massEmailProgress.isSending ? 'Enviando Lote...' : 'Iniciar Despacho Masivo'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Hoja de Liquidación de Utilidades PDF */}
      <ProfitSharingPayslipModal
        isOpen={isUtilidadModalOpen}
        onClose={() => setIsUtilidadModalOpen(false)}
        cabecera={cierreUtilidad}
        detalle={selectedUtilidadDetalle}
      />

      {/* Modal Formulario de Procesar Cese */}
      <ProcessLiquidationModal
        isOpen={isProcessLiquidationModalOpen}
        onClose={() => setIsProcessLiquidationModalOpen(false)}
        employees={employees}
        onProcess={handleProcessLiquidation}
      />

      {/* Modal Hoja de Liquidación LBS e Imprimible Carta CTS */}
      <LiquidationPayslipModal
        isOpen={isLiquidationPayslipModalOpen}
        onClose={() => setIsLiquidationPayslipModalOpen(false)}
        liquidacion={selectedLiquidacion}
      />

      {/* Modal de Constancia de Depósito de CTS */}
      <CtsPayslipModal
        isOpen={isCtsModalOpen}
        onClose={() => setIsCtsModalOpen(false)}
        cabecera={cierreCts}
        detalle={selectedCtsDetalle}
      />

      {/* Modal de Boleta de Gratificación Ley 29351 */}
      <GratificacionPayslipModal
        isOpen={isGratificacionModalOpen}
        onClose={() => setIsGratificacionModalOpen(false)}
        cabecera={cierreGratificacion}
        detalle={selectedGratificacionDetalle}
      />
    </div>
  );
};
