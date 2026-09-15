<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\DepositoCts;
use App\Models\DepositoCtsDetalle;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CtsController extends Controller
{
    public function index(Request $request)
    {
        $query = DepositoCts::query();

        if ($request->filled('empresa')) {
            $query->where('empresa', $request->empresa);
        }

        if ($request->filled('periodo')) {
            $query->where('periodo_semestral', $request->periodo);
        }

        $cierres = $query->orderBy('creado_en', 'desc')->get();
        return response()->json($cierres);
    }

    public function show($id)
    {
        $cierre = DepositoCts::with('detalles')->find($id);
        if (!$cierre) {
            return response()->json(['message' => 'Depósito de CTS no encontrado'], 404);
        }
        return response()->json($cierre);
    }

    public function procesar(Request $request)
    {
        $validated = $request->validate([
            'periodo_semestral' => 'required|string|max:50', // 2026-MAYO, 2026-NOVIEMBRE
            'empresa' => 'required|string|max:150',
        ]);

        $periodo = trim($validated['periodo_semestral']);
        $empresa = trim($validated['empresa']);

        // Extraer año y semestre (MAYO o NOVIEMBRE)
        $partes = explode('-', strtoupper($periodo));
        $anio = intval($partes[0] ?? date('Y'));
        $semestre = $partes[1] ?? 'MAYO';

        if (str_contains($semestre, 'MAY')) {
            // Semestre computable MAYO: 01 Noviembre (año anterior) a 30 Abril (año actual)
            $inicioSemestre = Carbon::create($anio - 1, 11, 1, 0, 0, 0);
            $finSemestre = Carbon::create($anio, 4, 30, 23, 59, 59);
        } else {
            // Semestre computable NOVIEMBRE: 01 Mayo a 31 Octubre (año actual)
            $inicioSemestre = Carbon::create($anio, 5, 1, 0, 0, 0);
            $finSemestre = Carbon::create($anio, 10, 31, 23, 59, 59);
        }

        // Filtrar exclusivamente colaboradores activos de esta empresa
        $empleados = Empleado::where('estado', 'Activo')
            ->where(function ($q) use ($empresa) {
                $q->where('empresa', $empresa);
                if (str_contains($empresa, 'Importaciones Carmelita')) {
                    $q->orWhereNull('empresa')->orWhere('empresa', '');
                }
            })
            ->get();

        if ($empleados->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => "No se encontraron colaboradores activos registrados para la empresa '{$empresa}'.",
            ], 422);
        }

        $idCierre = 'cts-' . Str::slug($periodo) . '-' . Str::slug($empresa);
        $detallesCalculados = [];
        $montoTotalEmpresa = 0;

        foreach ($empleados as $emp) {
            $datosLab = DB::table('empleados_datos_laborales')->where('empleado_id', $emp->id)->first();
            $sueldoBase = $datosLab ? floatval($datosLab->sueldo_basico) : (floatval($emp->sueldo_base) ?: 2500.0);
            $asigFam = ($datosLab && $datosLab->tiene_asignacion_familiar) ? 102.50 : 0.0;

            // 1/6 de la gratificación computable legal (D.S. 001-97-TR)
            $sextoGrati = round(($sueldoBase + $asigFam) / 6.0, 2);
            $remunComputable = $sueldoBase + $asigFam + $sextoGrati;

            // Cálculo dinámico de Tiempo Computable dentro del semestre
            $fechaIngreso = $emp->fecha_ingreso ? Carbon::parse($emp->fecha_ingreso) : Carbon::create($anio - 1, 1, 1);
            
            // Si ingresó después del fin del semestre
            if ($fechaIngreso->gt($finSemestre)) {
                continue;
            }

            // Fecha efectiva de inicio de cómputo para este semestre
            $fechaInicioComputo = $fechaIngreso->gt($inicioSemestre) ? $fechaIngreso : $inicioSemestre;
            
            // Si ingresó antes o al inicio del semestre -> 6 meses completos
            if ($fechaIngreso->lte($inicioSemestre)) {
                $mesesLaborados = 6;
                $diasLaborados = 0;
            } else {
                // Cálculo de meses y días transcurridos hasta el fin del semestre
                $diff = $fechaInicioComputo->diff($finSemestre->copy()->addDay());
                $mesesLaborados = min(6, $diff->m + ($diff->y * 12));
                $diasLaborados = min(30, $diff->d);
            }

            // Fórmula oficial CTS: (Remun Computable / 12) * Meses + (Remun Computable / 360) * Días
            $montoCts = round((($remunComputable / 12.0) * $mesesLaborados) + (($remunComputable / 360.0) * $diasLaborados), 2);
            $montoTotalEmpresa += $montoCts;

            $detallesCalculados[] = [
                'emp' => $emp,
                'datosLab' => $datosLab,
                'fechaIngreso' => $fechaIngreso->format('Y-m-d'),
                'sueldoBase' => $sueldoBase,
                'asigFam' => $asigFam,
                'sextoGrati' => $sextoGrati,
                'remunComputable' => $remunComputable,
                'mesesLaborados' => $mesesLaborados,
                'diasLaborados' => $diasLaborados,
                'montoCts' => $montoCts,
            ];
        }

        DB::beginTransaction();
        try {
            DepositoCtsDetalle::where('cts_id', $idCierre)->delete();
            DepositoCts::where('id', $idCierre)->delete();

            $cierre = DepositoCts::create([
                'id' => $idCierre,
                'periodo_semestral' => $periodo,
                'empresa' => $empresa,
                'conteo_trabajadores' => count($detallesCalculados),
                'monto_total_depositado' => round($montoTotalEmpresa, 2),
                'estado' => 'Procesado',
            ]);

            $detallesResumen = [];

            foreach ($detallesCalculados as $item) {
                $emp = $item['emp'];
                $datosLab = $item['datosLab'];

                $det = DepositoCtsDetalle::create([
                    'id' => 'det-' . $idCierre . '-' . $emp->id,
                    'cts_id' => $idCierre,
                    'empleado_id' => $emp->id,
                    'nombre_empleado' => $emp->nombre_completo ?: ($emp->nombres . ' ' . $emp->apellidos),
                    'numero_documento' => $emp->numero_documento,
                    'cargo' => $emp->cargo ?: 'Colaborador',
                    'fecha_ingreso' => $item['fechaIngreso'],
                    'sueldo_basico' => $item['sueldoBase'],
                    'asignacion_familiar' => $item['asigFam'],
                    'sexto_gratificacion' => $item['sextoGrati'],
                    'remuneracion_computable' => $item['remunComputable'],
                    'meses_laborados' => $item['mesesLaborados'],
                    'dias_laborados' => $item['diasLaborados'],
                    'monto_cts_depositado' => $item['montoCts'],
                    'banco_cts' => $datosLab ? ($datosLab->banco_cts ?: 'BCP') : 'BCP',
                    'numero_cuenta_cts' => $datosLab ? ($datosLab->numero_cuenta_cts ?: '---') : '---',
                    'moneda' => 'PEN',
                ]);

                $detallesResumen[] = $det;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Depósito de CTS '{$periodo}' para '{$empresa}' liquidado exitosamente según D.S. 001-97-TR.",
                'cabecera' => $cierre,
                'detalles' => $detallesResumen,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar depósito de CTS: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        $cierre = DepositoCts::findOrFail($id);
        $cierre->delete();

        return response()->json([
            'success' => true,
            'message' => 'Registro de CTS eliminado de MySQL.',
        ]);
    }
}