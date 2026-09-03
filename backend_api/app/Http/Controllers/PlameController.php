<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlameController extends Controller
{
    // Mapeo de RUCs de las empresas del Grupo Carmelita
    private $rucsEmpresas = [
        'Importaciones Carmelita del Norte S.A.C.' => '20601234567',
        'Grupo Chemmer Perú S.A.C.' => '20559876543',
        'León Plast S.A.C.' => '20487654321',
    ];

    public function generar(Request $request)
    {
        $validated = $request->validate([
            'periodo' => 'required|string|regex:/^\d{4}-\d{2}$/', // YYYY-MM
            'empresa' => 'required|string',
        ]);

        $periodo = $validated['periodo']; // 2026-08
        $empresa = $validated['empresa'];
        $ruc = $this->rucsEmpresas[$empresa] ?? '20601234567';

        // Buscar la planilla procesada del mes en planillas_mensuales por periodo (ej. 2026-08)
        $planilla = DB::table('planillas_mensuales')
            ->where('empresa', $empresa)
            ->where('periodo', $periodo)
            ->first();

        // Obtener los colaboradores de la empresa
        $empleados = Empleado::where('empresa', $empresa)->get();

        if ($empleados->isEmpty()) {
            $empleados = Empleado::all();
        }

        $detallesPlanilla = $planilla 
            ? DB::table('planillas_detalles')->where('planilla_id', $planilla->id)->get()->keyBy('empleado_id') 
            : collect([]);

        $remLines = [];
        $jorLines = [];
        $resumenRem = [];
        $resumenJor = [];

        foreach ($empleados as $emp) {
            $det = $detallesPlanilla->get($emp->id);
            $datosLab = DB::table('empleados_datos_laborales')->where('empleado_id', $emp->id)->first();

            $tipoDoc = $emp->tipo_documento === 'CE' ? '04' : '01';
            $numDoc = $emp->numero_documento ?: '00000000';

            // Montos remunerativos
            $sueldoBase = $det ? floatval($det->sueldo_basico) : ($datosLab ? floatval($datosLab->sueldo_basico) : floatval($emp->sueldo_base ?: 2500.0));
            $asigFam = $det ? floatval($det->asignacion_familiar) : (($datosLab && $datosLab->tiene_asignacion_familiar) ? 102.50 : 0.0);
            $montoHE25 = $det ? floatval($det->monto_horas_extras_25) : 0.0;
            $montoHE35 = $det ? floatval($det->monto_horas_extras_35) : 0.0;
            $horasExtrasMonto = $montoHE25 + $montoHE35;

            $pension = $det ? floatval($det->descuento_pension) : round(($sueldoBase + $asigFam) * 0.13, 2);
            $ir5ta = $det ? floatval($det->descuento_ir5ta) : 0.0;
            $essalud = $det ? floatval($det->aporte_essalud) : round(($sueldoBase + $asigFam) * 0.09, 2);

            // Estructura 01: Remuneraciones (.rem) - Conceptos SUNAT Tabla 22
            // 0121: Remuneración Básica
            if ($sueldoBase > 0) {
                $remLines[] = "{$tipoDoc}|{$numDoc}|0121|" . number_format($sueldoBase, 2, '.', '') . "|" . number_format($sueldoBase, 2, '.', '') . "|";
            }
            // 0201: Asignación Familiar
            if ($asigFam > 0) {
                $remLines[] = "{$tipoDoc}|{$numDoc}|0201|" . number_format($asigFam, 2, '.', '') . "|" . number_format($asigFam, 2, '.', '') . "|";
            }
            // 0105: Horas Extras
            if ($horasExtrasMonto > 0) {
                $remLines[] = "{$tipoDoc}|{$numDoc}|0105|" . number_format($horasExtrasMonto, 2, '.', '') . "|" . number_format($horasExtrasMonto, 2, '.', '') . "|";
            }
            // 0607: Pensiones (AFP/ONP)
            if ($pension > 0) {
                $remLines[] = "{$tipoDoc}|{$numDoc}|0607|" . number_format($pension, 2, '.', '') . "|" . number_format($pension, 2, '.', '') . "|";
            }
            // 0601: IR 5ta Categoría
            if ($ir5ta > 0) {
                $remLines[] = "{$tipoDoc}|{$numDoc}|0601|" . number_format($ir5ta, 2, '.', '') . "|" . number_format($ir5ta, 2, '.', '') . "|";
            }
            // 0804: Aporte EsSalud (9%)
            if ($essalud > 0) {
                $remLines[] = "{$tipoDoc}|{$numDoc}|0804|" . number_format($essalud, 2, '.', '') . "|" . number_format($essalud, 2, '.', '') . "|";
            }

            // Estructura 02: Jornada Laboral (.jor)
            // Horas ordinarias trabajadas en el mes: Días trabajados * 8 hrs
            $diasTrab = $det ? intval($det->dias_trabajados) : 30;
            $horasOrdinarias = $diasTrab * 8;
            $minutosOrdinarios = 0;

            // Estimación de horas en sobretiempo basada en montos de HE 25%/35%
            $valorHora = ($sueldoBase / 240);
            $horasSobretiempo = $valorHora > 0 ? intval(round(($montoHE25 / ($valorHora * 1.25)) + ($montoHE35 / ($valorHora * 1.35)))) : 0;
            $minutosSobretiempo = 0;

            $jorLines[] = "{$tipoDoc}|{$numDoc}|{$horasOrdinarias}|{$minutosOrdinarios}|{$horasSobretiempo}|{$minutosSobretiempo}|";

            $resumenRem[] = [
                'empleado' => $emp->nombre_completo ?: ($emp->nombres . ' ' . $emp->apellidos),
                'documento' => $numDoc,
                'sueldo_basico' => $sueldoBase,
                'asig_familiar' => $asigFam,
                'horas_extras' => $horasExtrasMonto,
                'descuento_pension' => $pension,
                'descuento_ir5ta' => $ir5ta,
                'aporte_essalud' => $essalud,
            ];

            $resumenJor[] = [
                'empleado' => $emp->nombre_completo ?: ($emp->nombres . ' ' . $emp->apellidos),
                'documento' => $numDoc,
                'horas_ordinarias' => $horasOrdinarias,
                'minutos_ordinarios' => $minutosOrdinarios,
                'horas_sobretiempo' => $horasSobretiempo,
                'minutos_sobretiempo' => $minutosSobretiempo,
            ];
        }

        $nombreArchivoRem = "0601" . str_replace('-', '', $periodo) . "{$ruc}.rem";
        $nombreArchivoJor = "0601" . str_replace('-', '', $periodo) . "{$ruc}.jor";

        $contenidoRem = implode("\r\n", $remLines);
        $contenidoJor = implode("\r\n", $jorLines);

        return response()->json([
            'success' => true,
            'message' => "Estructuras PLAME SUNAT para '{$empresa}' correspondientes al período {$periodo} generadas exitosamente.",
            'periodo' => $periodo,
            'empresa' => $empresa,
            'ruc' => $ruc,
            'nombre_archivo_rem' => $nombreArchivoRem,
            'contenido_rem' => $contenidoRem,
            'nombre_archivo_jor' => $nombreArchivoJor,
            'contenido_jor' => $contenidoJor,
            'resumen_rem' => $resumenRem,
            'resumen_jor' => $resumenJor,
        ]);
    }
}