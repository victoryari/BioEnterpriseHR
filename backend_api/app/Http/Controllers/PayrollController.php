<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Services\PayrollCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PayrollController extends Controller
{
    public function getAFPTasas()
    {
        $tasas = DB::table('afp_tasas')->get();
        return response()->json($tasas);
    }

    public function updateAFPTasa(Request $request, $id)
    {
        $validated = $request->validate([
            'aporte_obligatorio' => 'required|numeric',
            'comision_flujo' => 'required|numeric',
            'prima_seguro' => 'required|numeric',
        ]);

        DB::table('afp_tasas')->where('id', $id)->update([
            'aporte_obligatorio' => $validated['aporte_obligatorio'],
            'comision_flujo' => $validated['comision_flujo'],
            'prima_seguro' => $validated['prima_seguro'],
            'actualizado_en' => now(),
        ]);

        $tasas = DB::table('afp_tasas')->get();

        return response()->json([
            'success' => true,
            'message' => 'Comisiones y tasas de AFP actualizadas correctamente.',
            'tasas' => $tasas,
        ]);
    }

    public function getParametros()
    {
        $params = DB::table('parametros_laborales')->first();
        if (!$params) {
            $params = (object)[
                'uit_valor' => 5350.00,
                'rmv_valor' => 1025.00,
                'porcentaje_asig_familiar' => 10.00,
                'porcentaje_essalud' => 9.00,
                'anio_vigencia' => 2026,
            ];
        }
        return response()->json($params);
    }

    public function updateParametros(Request $request)
    {
        $validated = $request->validate([
            'uit_valor' => 'required|numeric|min:1000',
            'rmv_valor' => 'required|numeric|min:500',
            'porcentaje_asig_familiar' => 'nullable|numeric',
            'porcentaje_essalud' => 'nullable|numeric',
            'anio_vigencia' => 'nullable|integer',
        ]);

        DB::table('parametros_laborales')->updateOrInsert(
            ['id' => 1],
            [
                'uit_valor' => $validated['uit_valor'],
                'rmv_valor' => $validated['rmv_valor'],
                'porcentaje_asig_familiar' => $validated['porcentaje_asig_familiar'] ?? 10.00,
                'porcentaje_essalud' => $validated['porcentaje_essalud'] ?? 9.00,
                'anio_vigencia' => $validated['anio_vigencia'] ?? date('Y'),
                'actualizado_en' => now(),
            ]
        );

        $params = DB::table('parametros_laborales')->where('id', 1)->first();

        return response()->json([
            'success' => true,
            'message' => 'Parámetros laborales (UIT / RMV) actualizados correctamente en MySQL.',
            'parametros' => $params,
        ]);
    }

    public function getPlanillas()
    {
        $planillas = DB::table('planillas_mensuales')
            ->orderBy('creado_en', 'desc')
            ->get();

        return response()->json($planillas);
    }

    public function getPlanillaDetalle($id)
    {
        $cabecera = DB::table('planillas_mensuales')->where('id', $id)->first();
        if (!$cabecera) {
            return response()->json(['message' => 'Planilla no encontrada'], 404);
        }

        $detalles = DB::table('planillas_detalles')->where('planilla_id', $id)->get();

        return response()->json([
            'cabecera' => $cabecera,
            'detalles' => $detalles,
        ]);
    }

    public function procesarPlanilla(Request $request)
    {
        $periodo = $request->input('periodo', date('Y-m')); // ej. 2026-08
        $empresa = $request->input('empresa', 'Importaciones Carmelita del Norte S.A.C.');

        $idPlanilla = 'pla-' . $periodo . '-' . Str::slug($empresa);

        // Obtener solo empleados ACTIVOS pertenecientes a la empresa especificada
        $empleados = Empleado::where('estado', 'Activo')
            ->where(function ($q) use ($empresa) {
                $q->where('empresa', $empresa)
                  ->orWhereNull('empresa');
            })
            ->get();

        $totIngres = 0;
        $totDescuen = 0;
        $totAport = 0;
        $totNet = 0;
        $detallesProcesados = [];

        DB::table('planillas_detalles')->where('planilla_id', $idPlanilla)->delete();

        foreach ($empleados as $emp) {
            $calc = PayrollCalculationService::calcularEmpleado($emp->id, $periodo);
            if (!$calc) continue;

            $idDetalle = 'det-' . md5($idPlanilla . '_' . $emp->id);

            DB::table('planillas_detalles')->insert(array_merge($calc, [
                'id' => $idDetalle,
                'planilla_id' => $idPlanilla,
            ]));

            // Crear boleta de pago si no existe
            $existsBoleta = DB::table('boletas_pago')->where('planilla_detalle_id', $idDetalle)->exists();
            if (!$existsBoleta) {
                DB::table('boletas_pago')->insert([
                    'id' => 'bol-' . md5($idDetalle),
                    'planilla_detalle_id' => $idDetalle,
                    'empleado_id' => $emp->id,
                    'periodo' => $periodo,
                    'token_seguridad' => Str::random(32),
                    'estado_entrega' => 'Emitida',
                    'fecha_emision' => now(),
                ]);
            }

            $totIngres += $calc['total_ingresos'];
            $totDescuen += $calc['total_descuentos'];
            $totAport += ($calc['aporte_essalud'] + $calc['aporte_sctr']);
            $totNet += $calc['sueldo_neto'];
            $detallesProcesados[] = array_merge($calc, ['id' => $idDetalle, 'planilla_id' => $idPlanilla]);
        }

        DB::table('planillas_mensuales')->updateOrInsert(
            ['id' => $idPlanilla],
            [
                'periodo' => $periodo,
                'empresa' => $empresa,
                'estado' => 'Procesado',
                'total_ingresos' => round($totIngres, 2),
                'total_descuentos' => round($totDescuen, 2),
                'total_aportes_empleador' => round($totAport, 2),
                'total_neto_pagar' => round($totNet, 2),
                'conteo_trabajadores' => count($detallesProcesados),
                'creado_en' => now(),
                'actualizado_en' => now(),
            ]
        );

        $cabecera = DB::table('planillas_mensuales')->where('id', $idPlanilla)->first();

        return response()->json([
            'success' => true,
            'message' => "Planilla del periodo {$periodo} procesada exitosamente con normativa peruana.",
            'cabecera' => $cabecera,
            'detalles' => $detallesProcesados,
        ]);
    }

    public function getBoletas()
    {
        $boletas = DB::table('boletas_pago')
            ->join('planillas_detalles', 'boletas_pago.planilla_detalle_id', '=', 'planillas_detalles.id')
            ->join('planillas_mensuales', 'planillas_detalles.planilla_id', '=', 'planillas_mensuales.id')
            ->select(
                'boletas_pago.*',
                'planillas_detalles.nombre_empleado',
                'planillas_detalles.numero_documento',
                'planillas_detalles.cargo',
                'planillas_detalles.sueldo_basico',
                'planillas_detalles.total_ingresos',
                'planillas_detalles.total_descuentos',
                'planillas_detalles.sueldo_neto',
                'planillas_mensuales.empresa'
            )
            ->orderBy('boletas_pago.fecha_emision', 'desc')
            ->get();

        return response()->json($boletas);
    }
}