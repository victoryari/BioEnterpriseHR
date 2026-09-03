<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\UtilidadAnual;
use App\Models\UtilidadDetalle;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class UtilidadController extends Controller
{
    public function index(Request $request)
    {
        $query = UtilidadAnual::query();

        if ($request->filled('empresa')) {
            $query->where('empresa', $request->empresa);
        }

        if ($request->filled('ejercicio')) {
            $query->where('ejercicio_fiscal', $request->ejercicio);
        }

        $cierres = $query->orderBy('ejercicio_fiscal', 'desc')->orderBy('creado_en', 'desc')->get();
        return response()->json($cierres);
    }

    public function show($id)
    {
        $cierre = UtilidadAnual::with('detalles')->find($id);
        if (!$cierre) {
            return response()->json(['message' => 'Cierre de utilidades no encontrado'], 404);
        }
        return response()->json($cierre);
    }

    public function procesar(Request $request)
    {
        $validated = $request->validate([
            'ejercicio_fiscal' => 'required|integer|min:2020|max:2030',
            'empresa' => 'required|string|max:150',
            'renta_neta_empresa' => 'required|numeric|min:0',
            'porcentaje_sector' => 'required|numeric|min:1|max:100',
        ]);

        $ejercicio = $validated['ejercicio_fiscal'];
        $empresa = $validated['empresa'];
        $rentaNeta = floatval($validated['renta_neta_empresa']);
        $porcentaje = floatval($validated['porcentaje_sector']);

        $montoTotalDistribuir = $rentaNeta * ($porcentaje / 100.0);
        $monto50Dias = $montoTotalDistribuir / 2.0;
        $monto50Remun = $montoTotalDistribuir / 2.0;

        // Filtrar estricta y exclusivamente a los colaboradores pertenecientes a esta empresa / RUC
        $empleados = Empleado::where('empresa', $empresa)->get();

        // Si el campo empresa está vacío en BD, asociarlos a la empresa por defecto (Importaciones Carmelita)
        if ($empleados->isEmpty() && str_contains($empresa, 'Importaciones Carmelita')) {
            $empleados = Empleado::whereNull('empresa')->orWhere('empresa', '')->orWhere('empresa', $empresa)->get();
        }

        if ($empleados->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => "No se encontraron colaboradores registrados pertenecientes a la empresa '{$empresa}'.",
            ], 422);
        }

        $trabajadoresCalculados = [];
        $totalDiasEmpresa = 0;
        $totalRemunEmpresa = 0;

        foreach ($empleados as $emp) {
            $datosLab = DB::table('empleados_datos_laborales')->where('empleado_id', $emp->id)->first();
            $sueldoBase = $datosLab ? floatval($datosLab->sueldo_basico) : (floatval($emp->sueldo_base) ?: 2500.0);
            $asigFam = ($datosLab && $datosLab->tiene_asignacion_familiar) ? 102.50 : 0.0;

            // Días trabajados al año (Estándar 300 días para año laboral completo D.L. 892)
            $diasLaborados = 300;

            // Remuneración anual computable: (Sueldo + Asig Fam) * 12 meses + 2 Gratificaciones legales
            $remunMensual = $sueldoBase + $asigFam;
            $remunAnual = $remunMensual * 14;

            $totalDiasEmpresa += $diasLaborados;
            $totalRemunEmpresa += $remunAnual;

            $trabajadoresCalculados[] = [
                'emp' => $emp,
                'datosLab' => $datosLab,
                'sueldoBase' => $sueldoBase,
                'remunMensual' => $remunMensual,
                'diasLaborados' => $diasLaborados,
                'remunAnual' => $remunAnual,
            ];
        }

        $factorDias = $totalDiasEmpresa > 0 ? ($monto50Dias / $totalDiasEmpresa) : 0;
        $factorRemun = $totalRemunEmpresa > 0 ? ($monto50Remun / $totalRemunEmpresa) : 0;

        $idCierre = 'util-' . $ejercicio . '-' . Str::slug($empresa);

        DB::beginTransaction();
        try {
            // Eliminar cierre anterior si existe para recalcular
            UtilidadDetalle::where('utilidad_id', $idCierre)->delete();
            UtilidadAnual::where('id', $idCierre)->delete();

            $cierre = UtilidadAnual::create([
                'id' => $idCierre,
                'ejercicio_fiscal' => $ejercicio,
                'empresa' => $empresa,
                'renta_neta_empresa' => $rentaNeta,
                'porcentaje_sector' => $porcentaje,
                'monto_total_distribuir' => $montoTotalDistribuir,
                'monto_50_dias' => $monto50Dias,
                'monto_50_remuneraciones' => $monto50Remun,
                'total_dias_empresa' => $totalDiasEmpresa,
                'total_remuneraciones_empresa' => $totalRemunEmpresa,
                'factor_dias' => $factorDias,
                'factor_remuneraciones' => $factorRemun,
                'conteo_trabajadores' => count($trabajadoresCalculados),
                'estado' => 'Procesado',
            ]);

            $detallesResumen = [];

            foreach ($trabajadoresCalculados as $item) {
                $emp = $item['emp'];
                $datosLab = $item['datosLab'];
                $sueldoBase = $item['sueldoBase'];
                $remunMensual = $item['remunMensual'];
                $diasLaborados = $item['diasLaborados'];
                $remunAnual = $item['remunAnual'];

                $montoDias = $diasLaborados * $factorDias;
                $montoRemun = $remunAnual * $factorRemun;
                $utilidadBruta = $montoDias + $montoRemun;

                // Límite legal D.L. 892: Máximo 18 remuneraciones mensuales del trabajador
                $tope18Sueldos = $remunMensual * 18;
                $excedente = 0;
                $utilidadComputable = $utilidadBruta;

                if ($utilidadBruta > $tope18Sueldos) {
                    $excedente = $utilidadBruta - $tope18Sueldos;
                    $utilidadComputable = $tope18Sueldos;
                }

                // Retención Renta de 5ta Categoría (Aproximado legal ~5% a 8% según escala)
                $descuentoIR5ta = $utilidadComputable > 5000 ? round($utilidadComputable * 0.08, 2) : round($utilidadComputable * 0.05, 2);
                $netoPagar = $utilidadComputable - $descuentoIR5ta;

                $det = UtilidadDetalle::create([
                    'id' => 'det-' . $idCierre . '-' . $emp->id,
                    'utilidad_id' => $idCierre,
                    'empleado_id' => $emp->id,
                    'nombre_empleado' => $emp->nombre_completo ?: ($emp->nombres . ' ' . $emp->apellidos),
                    'numero_documento' => $emp->numero_documento,
                    'cargo' => $emp->cargo ?: 'Colaborador',
                    'dias_laborados_trabajador' => $diasLaborados,
                    'monto_por_dias' => round($montoDias, 2),
                    'remuneracion_anual_trabajador' => round($remunAnual, 2),
                    'monto_por_remuneracion' => round($montoRemun, 2),
                    'utilidad_bruta' => round($utilidadBruta, 2),
                    'excedente_tope_18_sueldos' => round($excedente, 2),
                    'utilidad_computable' => round($utilidadComputable, 2),
                    'descuento_ir5ta' => round($descuentoIR5ta, 2),
                    'utilidad_neta_pagar' => round($netoPagar, 2),
                    'banco_abono' => $datosLab ? $datosLab->banco_sueldo : 'BCP',
                    'numero_cuenta_abono' => $datosLab ? $datosLab->numero_cuenta_banco : '---',
                ]);

                $detallesResumen[] = $det;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Distribución de Utilidades del ejercicio {$ejercicio} para '{$empresa}' procesada con éxito según D.L. 892.",
                'cabecera' => $cierre,
                'detalles' => $detallesResumen,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar utilidades: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        $cierre = UtilidadAnual::findOrFail($id);
        $cierre->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cierre de utilidades eliminado exitosamente de MySQL.',
        ]);
    }
}