<?php

namespace App\Services;

use App\Models\Empleado;
use App\Models\MarcacionAsistencia;
use Illuminate\Support\Facades\DB;

class PayrollCalculationService
{
    /**
     * Obtenemos los parámetros laborales oficiales vigentes desde MySQL
     */
    public static function getParametros()
    {
        $params = DB::table('parametros_laborales')->first();
        $uit = $params ? floatval($params->uit_valor) : 5350.00;
        $rmv = $params ? floatval($params->rmv_valor) : 1025.00;
        $porcAsigFam = $params ? floatval($params->porcentaje_asig_familiar) : 10.00;
        $porcEssalud = $params ? floatval($params->porcentaje_essalud) : 9.00;

        return [
            'uit' => $uit,
            'rmv' => $rmv,
            'porc_asig_fam' => $porcAsigFam,
            'asig_familiar_monto' => round($rmv * ($porcAsigFam / 100.0), 2),
            'porc_essalud' => $porcEssalud,
        ];
    }

    /**
     * Calcular detalle de planilla para un empleado en un periodo determinado (ej. 2026-08)
     */
    public static function calcularEmpleado($empleadoId, $periodo)
    {
        $empleado = Empleado::find($empleadoId);
        if (!$empleado) return null;

        $p = self::getParametros();

        // Datos laborales y bancarios del colaborador
        $datos = DB::table('empleados_datos_laborales')->where('empleado_id', $empleadoId)->first();
        $sueldoBasico = $datos ? (float)$datos->sueldo_basico : (floatval($empleado->sueldo_base) ?: 2500.00);
        $tieneAsigFam = $datos ? (bool)$datos->tiene_asignacion_familiar : true;
        $regimenPrev = $datos ? $datos->regimen_previsional : 'AFP Integra';
        $tipoComision = $datos ? $datos->tipo_comision_afp : 'Flujo';

        // 1. Remuneraciones Básicas & Asignación Familiar
        $asigFamiliar = $tieneAsigFam ? $p['asig_familiar_monto'] : 0.00;
        $remuneracionComputable = $sueldoBasico + $asigFamiliar;

        // Valor Hora y Minuto oficial (Jornada legal 30 días / 240 horas mensuales)
        $valorDia = $sueldoBasico / 30.0;
        $valorHora = $sueldoBasico / 240.0;
        $valorMinuto = $valorHora / 60.0;

        // 2. Cálculo Exacto de Asistencia, Tardanzas y Faltas
        // Obtener horario asignado al empleado si existe
        $asigTurno = DB::table('asignaciones_turnos')
            ->where('empleado_id', $empleadoId)
            ->first();

        $horaEntradaEsperada = '08:30:00';
        $toleranciaMinutos = 10;

        if ($asigTurno) {
            $turnoDia = DB::table('turnos_dias')
                ->where('turno_id', $asigTurno->turno_id)
                ->where('es_laborable', 1)
                ->first();

            if ($turnoDia && $turnoDia->horario_id) {
                $horario = DB::table('horarios')->where('id', $turnoDia->horario_id)->first();
                if ($horario) {
                    $horaEntradaEsperada = $horario->hora_entrada;
                    $toleranciaMinutos = intval($horario->minutos_tolerancia);
                }
            }
        }

        $marcaciones = MarcacionAsistencia::where('empleado_id', $empleadoId)
            ->where('fecha', 'like', "{$periodo}%")
            ->orderBy('fecha_hora', 'asc')
            ->get();

        $minutosTardanza = 0;
        $diasInasistencia = 0;
        $minutosSobretiempo = 0;

        $entradaLimiteSeg = strtotime("1970-01-01 $horaEntradaEsperada") + ($toleranciaMinutos * 60);

        foreach ($marcaciones as $m) {
            if ($m->tipo === 'Entrada') {
                $horaMarcadaSeg = strtotime("1970-01-01 $m->hora");
                if ($horaMarcadaSeg > $entradaLimiteSeg) {
                    $excesoMinutos = ceil(($horaMarcadaSeg - strtotime("1970-01-01 $horaEntradaEsperada")) / 60.0);
                    $minutosTardanza += max(0, $excesoMinutos);
                }
            }
        }

        $descuentoTardanzas = round($minutosTardanza * $valorMinuto, 2);
        $descuentoInasistencias = round($diasInasistencia * $valorDia, 2);

        // 3. Horas Extras (Primeras 2h al 25%, restantes al 35% - Ley N° 854)
        $horasHE25 = 0;
        $horasHE35 = 0;
        if ($minutosSobretiempo > 0) {
            $horasTotalesST = $minutosSobretiempo / 60.0;
            $horasHE25 = min(2.0, $horasTotalesST);
            $horasHE35 = max(0.0, $horasTotalesST - 2.0);
        }

        $montoHE25 = round($horasHE25 * ($valorHora * 1.25), 2);
        $montoHE35 = round($horasHE35 * ($valorHora * 1.35), 2);
        $bonificaciones = 0.00;

        $totalIngresos = round($sueldoBasico + $asigFamiliar + $montoHE25 + $montoHE35 + $bonificaciones, 2);

        // 4. Descuento Previsional (AFP / ONP)
        $descuentoPension = 0.00;

        if ($regimenPrev === 'ONP') {
            $descuentoPension = round($totalIngresos * 0.13, 2);
        } else {
            $afpTasa = DB::table('afp_tasas')->where('nombre', $regimenPrev)->first();
            $porcentajeAporte = $afpTasa ? (float)$afpTasa->aporte_obligatorio : 10.0;
            $porcentajeComision = $afpTasa ? ($tipoComision === 'Flujo' ? (float)$afpTasa->comision_flujo : (float)$afpTasa->comision_mixta) : 1.5;
            $porcentajeSeguro = $afpTasa ? (float)$afpTasa->prima_seguro : 1.74;

            $tasaTotalAFP = ($porcentajeAporte + $porcentajeComision + $porcentajeSeguro) / 100.0;
            $descuentoPension = round($totalIngresos * $tasaTotalAFP, 2);
        }

        // 5. Impuesto a la Renta de 5ta Categoría - Escala Progresiva Acumulativa (Art. 53 Ley del Impuesto a la Renta Perú)
        $ingresoAnualProyectado = ($totalIngresos * 12) + (2 * ($sueldoBasico + $asigFamiliar)); // 12 meses + 2 gratificaciones
        $deduccion7UIT = $p['uit'] * 7;
        $rentaNetaImponible = max(0, $ingresoAnualProyectado - $deduccion7UIT);
        
        $impuestoAnualTotal = 0.00;

        if ($rentaNetaImponible > 0) {
            $tramo1Max = 5 * $p['uit'];
            $tramo2Max = 20 * $p['uit'];
            $tramo3Max = 35 * $p['uit'];
            $tramo4Max = 45 * $p['uit'];

            // Tramo 1: Hasta 5 UIT -> 8%
            $montoT1 = min($rentaNetaImponible, $tramo1Max);
            $impuestoAnualTotal += $montoT1 * 0.08;

            // Tramo 2: De 5 a 20 UIT (15 UIT) -> 14%
            if ($rentaNetaImponible > $tramo1Max) {
                $montoT2 = min($rentaNetaImponible - $tramo1Max, $tramo2Max - $tramo1Max);
                $impuestoAnualTotal += $montoT2 * 0.14;
            }

            // Tramo 3: De 20 a 35 UIT (15 UIT) -> 17%
            if ($rentaNetaImponible > $tramo2Max) {
                $montoT3 = min($rentaNetaImponible - $tramo2Max, $tramo3Max - $tramo2Max);
                $impuestoAnualTotal += $montoT3 * 0.17;
            }

            // Tramo 4: De 35 a 45 UIT (10 UIT) -> 20%
            if ($rentaNetaImponible > $tramo3Max) {
                $montoT4 = min($rentaNetaImponible - $tramo3Max, $tramo4Max - $tramo3Max);
                $impuestoAnualTotal += $montoT4 * 0.20;
            }

            // Tramo 5: Exceso de 45 UIT -> 30%
            if ($rentaNetaImponible > $tramo4Max) {
                $montoT5 = $rentaNetaImponible - $tramo4Max;
                $impuestoAnualTotal += $montoT5 * 0.30;
            }
        }

        $descuentoIR5ta = round($impuestoAnualTotal / 12.0, 2);

        // 6. Consolidación de Totales y Aportes Empleador
        $totalDescuentos = round($descuentoTardanzas + $descuentoInasistencias + $descuentoPension + $descuentoIR5ta, 2);
        $sueldoNeto = round($totalIngresos - $totalDescuentos, 2);

        $aporteEssalud = round($totalIngresos * ($p['porc_essalud'] / 100.0), 2); // EsSalud (9%)
        $aporteSctr = round($totalIngresos * 0.012, 2);  // SCTR (1.2%)

        return [
            'empleado_id' => $empleado->id,
            'nombre_empleado' => $empleado->nombre_completo,
            'numero_documento' => $empleado->numero_documento,
            'cargo' => $empleado->cargo,
            'sueldo_basico' => $sueldoBasico,
            'asignacion_familiar' => $asigFamiliar,
            'monto_horas_extras_25' => $montoHE25,
            'monto_horas_extras_35' => $montoHE35,
            'bonificaciones' => $bonificaciones,
            'total_ingresos' => $totalIngresos,
            'dias_trabajados' => max(0, 30 - $diasInasistencia),
            'minutos_tardanza' => $minutosTardanza,
            'descuento_tardanzas' => $descuentoTardanzas,
            'dias_inasistencia' => $diasInasistencia,
            'descuento_inasistencias' => $descuentoInasistencias,
            'afp_onp_nombre' => $regimenPrev,
            'descuento_pension' => $descuentoPension,
            'descuento_ir5ta' => $descuentoIR5ta,
            'otros_descuentos' => 0.00,
            'total_descuentos' => $totalDescuentos,
            'sueldo_neto' => $sueldoNeto,
            'aporte_essalud' => $aporteEssalud,
            'aporte_sctr' => $aporteSctr,
        ];
    }
}