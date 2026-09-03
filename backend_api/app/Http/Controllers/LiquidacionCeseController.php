<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\LiquidacionCese;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LiquidacionCeseController extends Controller
{
    public function index(Request $request)
    {
        $query = LiquidacionCese::query();

        if ($request->filled('empresa')) {
            $query->where('empresa', $request->empresa);
        }

        $list = $query->orderBy('fecha_cese', 'desc')->orderBy('creado_en', 'desc')->get();
        return response()->json($list);
    }

    public function show($id)
    {
        $liq = LiquidacionCese::find($id);
        if (!$liq) {
            return response()->json(['message' => 'Liquidación de cese no encontrada'], 404);
        }
        return response()->json($liq);
    }

    public function procesar(Request $request)
    {
        $validated = $request->validate([
            'empleado_id' => 'required|string',
            'fecha_cese' => 'required|date',
            'motivo_cese' => 'required|string',
            'incluye_indemnizacion' => 'nullable|boolean',
        ]);

        $emp = Empleado::find($validated['empleado_id']);
        if (!$emp) {
            return response()->json(['success' => false, 'message' => 'Empleado no encontrado'], 442);
        }

        $fechaCese = Carbon::parse($validated['fecha_cese']);
        $datosLab = DB::table('empleados_datos_laborales')->where('empleado_id', $emp->id)->first();
        $fechaIngreso = ($datosLab && $datosLab->fecha_ingreso) ? Carbon::parse($datosLab->fecha_ingreso) : Carbon::parse($emp->fecha_ingreso ?: '2024-01-15');

        $sueldoBase = $datosLab ? floatval($datosLab->sueldo_basico) : (floatval($emp->sueldo_base) ?: 2500.0);
        $asigFam = ($datosLab && $datosLab->tiene_asignacion_familiar) ? 102.50 : 0.0;
        $remunMensual = $sueldoBase + $asigFam;

        // Cálculo de Tiempo de Servicio
        $diff = $fechaIngreso->diff($fechaCese);
        $aniosServicio = $diff->y;
        $mesesServicio = $diff->m;
        $diasServicio = $diff->d;
        $tiempoServicioTexto = "{$aniosServicio} años, {$mesesServicio} meses, {$diasServicio} días";

        // 1. Boleta Trunca del Mes de Cese
        $diasLaboradosMesCese = $fechaCese->day;
        $montoBoletaTrunca = round(($remunMensual / 30.0) * $diasLaboradosMesCese, 2);

        // 2. CTS Trunca (Periodos: Mayo-Oct o Nov-Abr)
        $remunComputableCTS = $remunMensual + ($remunMensual / 6.0); // Sueldo + 1/6 Grata
        $mesesTruncosCTS = ($fechaCese->month >= 5 && $fechaCese->month <= 10) ? ($fechaCese->month - 5) : (($fechaCese->month >= 11) ? ($fechaCese->month - 11) : ($fechaCese->month + 1));
        $montoCTSTrunca = round(($remunComputableCTS / 12.0) * $mesesTruncosCTS + ($remunComputableCTS / 360.0) * $fechaCese->day, 2);

        // 3. Vacaciones Truncas (Año acumulado proporcional)
        $mesesTruncosVac = $mesesServicio % 12;
        $montoVacacionesTruncas = round(($remunMensual / 12.0) * $mesesTruncosVac + ($remunMensual / 360.0) * $fechaCese->day, 2);

        // 4. Gratificación Trunca + Ley 29351 (9% EsSalud) (Semestres: Ene-Jun o Jul-Dic)
        $mesesCalendarioGrat = ($fechaCese->month <= 6) ? ($fechaCese->month - 1) : ($fechaCese->month - 7);
        $mesesCalendarioGrat = max(0, $mesesCalendarioGrat);
        $montoGratificacionTrunca = round(($remunMensual / 6.0) * $mesesCalendarioGrat, 2);
        $montoBonificacionLey = round($montoGratificacionTrunca * 0.09, 2);

        // 5. Indemnización por Despido Arbitrario (Si aplica)
        $montoIndemnizacion = 0.0;
        if ($validated['motivo_cese'] === 'Despido arbitrario' || !empty($validated['incluye_indemnizacion'])) {
            $montoIndemnizacion = min($remunMensual * 12, $remunMensual * 1.5 * max(1, $aniosServicio));
            $montoIndemnizacion = round($montoIndemnizacion, 2);
        }

        // Totales y Retenciones
        $totalBruto = $montoBoletaTrunca + $montoCTSTrunca + $montoVacacionesTruncas + $montoGratificacionTrunca + $montoBonificacionLey + $montoIndemnizacion;
        $descuentoIR5ta = $totalBruto > 4000 ? round($totalBruto * 0.05, 2) : 0.0;
        $totalNeto = $totalBruto - $descuentoIR5ta;

        $idLiquidacion = 'lbs-' . $emp->id . '-' . $fechaCese->format('Ymd');

        DB::beginTransaction();
        try {
            // Eliminar liquidación previa si existe
            LiquidacionCese::where('id', $idLiquidacion)->delete();

            $liq = LiquidacionCese::create([
                'id' => $idLiquidacion,
                'empleado_id' => $emp->id,
                'nombre_empleado' => $emp->nombre_completo ?: ($emp->nombres . ' ' . $emp->apellidos),
                'numero_documento' => $emp->numero_documento,
                'empresa' => $emp->empresa ?: 'Importaciones Carmelita del Norte S.A.C.',
                'cargo' => $emp->cargo ?: 'Colaborador',
                'fecha_ingreso' => $fechaIngreso->format('Y-m-d'),
                'fecha_cese' => $fechaCese->format('Y-m-d'),
                'tiempo_servicio_texto' => $tiempoServicioTexto,
                'motivo_cese' => $validated['motivo_cese'],
                'sueldo_base_cese' => $remunMensual,
                'dias_laborados_mes_cese' => $diasLaboradosMesCese,
                'monto_boleta_trunca' => $montoBoletaTrunca,
                'monto_cts_trunca' => $montoCTSTrunca,
                'monto_vacaciones_truncas' => $montoVacacionesTruncas,
                'monto_gratificacion_trunca' => $montoGratificacionTrunca,
                'monto_bonificacion_ley' => $montoBonificacionLey,
                'monto_indemnizacion' => $montoIndemnizacion,
                'total_bruto_lbs' => $totalBruto,
                'descuento_ir5ta' => $descuentoIR5ta,
                'total_neto_lbs' => $totalNeto,
                'banco_cts' => $datosLab ? $datosLab->banco_cts : 'BCP',
                'numero_cuenta_cts' => $datosLab ? $datosLab->numero_cuenta_cts : '---',
                'estado' => 'Procesado',
            ]);

            // Actualizar estado del empleado a 'Cesado'
            $emp->update([
                'estado' => 'Cesado',
                'fecha_cese' => $fechaCese->format('Y-m-d'),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Liquidación de Beneficios Sociales (LBS) para '{$emp->nombre_completo}' procesada exitosamente.",
                'liquidacio' => $liq,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar liquidación de cese: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        $liq = LiquidacionCese::findOrFail($id);
        $liq->delete();

        return response()->json([
            'success' => true,
            'message' => 'Liquidación de cese eliminada exitosamente.',
        ]);
    }
}