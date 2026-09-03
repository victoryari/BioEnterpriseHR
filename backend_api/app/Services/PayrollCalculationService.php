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
        return [
            'uit' => $params ? floatval($params->uit_valor) : 5350.00,
            'rmv' => $params ? floatval($params->rmv_valor) : 1025.00,
            'porc_asig_fam' => $params ? floatval($params->porcentaje_asig_familiar) : 10.00,
            'asig_familiar_monto' => $params ? round(floatval($params->rmv_valor) * (floatval($params->porcentaje_asig_familiar) / 100.0), 2) : 102.50,
            'porc_essalud' => $params ? floatval($params->porcentaje_essalud) : 9.00,
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

        // Datos laborales
        $datos = DB::table('empleados_datos_laborales')->where('empleado_id', $empleadoId)->first();
        $sueldoBasico = $datos ? (float)$datos->sueldo_basico : 2500.00;
        $tieneAsigFam = $datos ? (bool)$datos->tiene_asignacion_familiar : true;
        $regimenPrev = $datos ? $datos->regimen_previsional : 'AFP Integra';
        $tipoComision = $datos ? $datos->tipo_comision_afp : 'Flujo';

        // 1. Remuneraciones
        $asigFamiliar = $tieneAsigFam ? $p['asig_familiar_monto'] : 0.00;
        $remuneracionComputable = $sueldoBasico + $asigFamiliar;

        // 2. Cálculo de Asistencia (Marcaciones, tardanzas del periodo)
        $marcaciones = MarcacionAsistencia::where('empleado_id', $empleadoId)
            ->where('fecha', 'like', "{$periodo}%")
            ->get();

        $minutosTardanza = 0;
        $diasInasistencia = 0;

        foreach ($marcaciones as $m) {
            if ($m->es_error || str_contains(strtolower($m->estado), 'tardanza')) {
                $minutosTardanza += 15; // Promedio estimado por evento de tardanza
            }
        }

        // Valor Hora y Minuto
        $valorDia = $sueldoBasico / 30.0;
        $valorHora = $valorDia / 8.0;
        $valorMinuto = $valorHora / 60.0;

        $descuentoTardanzas = round($minutosTardanza * $valorMinuto, 2);
        $descuentoInasistencias = round($diasInasistencia * $valorDia, 2);

        // Horas extras
        $montoHE25 = 0.00;
        $montoHE35 = 0.00;
        $bonificaciones = 0.00;

        $totalIngresos = round($sueldoBasico + $asigFamiliar + $montoHE25 + $montoHE35 + $bonificaciones, 2);

        // 3. Descuento Previsional (AFP / ONP)
        $afpTasa = DB::table('afp_tasas')->where('nombre', $regimenPrev)->first();
        $descuentoPension = 0.00;

        if ($regimenPrev === 'ONP') {
            $descuentoPension = round($totalIngresos * 0.13, 2);
        } else {
            $porcentajeAporte = $afpTasa ? (float)$afpTasa->aporte_obligatorio : 10.0;
            $porcentajeComision = $afpTasa ? ($tipoComision === 'Flujo' ? (float)$afpTasa->comision_flujo : (float)$afpTasa->comision_mixta) : 1.5;
            $porcentajeSeguro = $afpTasa ? (float)$afpTasa->prima_seguro : 1.74;

            $tasaTotalAFP = ($porcentajeAporte + $porcentajeComision + $porcentajeSeguro) / 100.0;
            $descuentoPension = round($totalIngresos * $tasaTotalAFP, 2);
        }

        // 4. Impuesto a la Renta de 5ta Categoría (Proyección anual simplificada)
        $ingresoAnualProyectado = ($totalIngresos * 14); // 12 sueldos + 2 gratificaciones
        $deduccion7UIT = $p['uit'] * 7;
        $rentaNetaProyectada = max(0, $ingresoAnualProyectado - $deduccion7UIT);
        
        $impuestoAnual = 0.00;
        if ($rentaNetaProyectada > 0) {
            // Primer tramo: hasta 5 UIT (8%)
            $tramo1 = min($rentaNetaProyectada, $p['uit'] * 5);
            $impuestoAnual += $tramo1 * 0.08;
        }
        $descuentoIR5ta = round($impuestoAnual / 12.0, 2);

        // Total Descuentos
        $totalDescuentos = round($descuentoTardanzas + $descuentoInasistencias + $descuentoPension + $descuentoIR5ta, 2);

        // Sueldo Neto
        $sueldoNeto = round($totalIngresos - $totalDescuentos, 2);

        // 5. Aportes Empleador
        $aporteEssalud = round($totalIngresos * ($p['porc_essalud'] / 100.0), 2); // EsSalud (ej. 9%)
        $aporteSctr = round($totalIngresos * 0.012, 2);  // 1.2% SCTR

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
            'dias_trabajados' => 30 - $diasInasistencia,
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