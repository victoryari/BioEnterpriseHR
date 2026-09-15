<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\GratificacionSemestral;
use App\Models\GratificacionDetalle;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GratificacionController extends Controller
{
    public function index(Request $request)
    {
        $query = GratificacionSemestral::query();

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
        $cierre = GratificacionSemestral::with('detalles')->find($id);
        if (!$cierre) {
            return response()->json(['message' => 'Gratificación Semestral no encontrada'], 404);
        }
        return response()->json($cierre);
    }

    public function procesar(Request $request)
    {
        $validated = $request->validate([
            'periodo_semestral' => 'required|string|max:50', // 2026-JULIO, 2026-DICIEMBRE
            'empresa' => 'required|string|max:150',
        ]);

        $periodo = trim($validated['periodo_semestral']);
        $empresa = trim($validated['empresa']);

        // Determinar semestre computable: JULIO (Ene-Jun) o DICIEMBRE (Jul-Dic)
        $partes = explode('-', strtoupper($periodo));
        $anio = intval($partes[0] ?? date('Y'));
        $semestre = $partes[1] ?? 'JULIO';

        if (str_contains($semestre, 'JUL')) {
            $inicioSemestre = Carbon::create($anio, 1, 1, 0, 0, 0);
            $finSemestre = Carbon::create($anio, 6, 30, 23, 59, 59);
        } else {
            $inicioSemestre = Carbon::create($anio, 7, 1, 0, 0, 0);
            $finSemestre = Carbon::create($anio, 12, 31, 23, 59, 59);
        }

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

        $idCierre = 'grati-' . Str::slug($periodo) . '-' . Str::slug($empresa);
        $detallesCalculados = [];
        $totalBruto = 0;
        $totalBonif9 = 0;
        $totalNeto = 0;

        foreach ($empleados as $emp) {
            $datosLab = DB::table('empleados_datos_laborales')->where('empleado_id', $emp->id)->first();
            $sueldoBase = $datosLab ? floatval($datosLab->sueldo_basico) : (floatval($emp->sueldo_base) ?: 2500.0);
            $asigFam = ($datosLab && $datosLab->tiene_asignacion_familiar) ? 102.50 : 0.0;

            $remunComputable = $sueldoBase + $asigFam;

            // Calcular meses completos laborados según Ley 27735
            $fechaIngreso = $emp->fecha_ingreso ? Carbon::parse($emp->fecha_ingreso) : Carbon::create($anio, 1, 1);

            if ($fechaIngreso->gt($finSemestre)) {
                continue;
            }

            if ($fechaIngreso->lte($inicioSemestre)) {
                $mesesLaborados = 6;
            } else {
                // Meses calendario completos transcurridos en el semestre
                $mesInicio = $fechaIngreso->day === 1 ? $fechaIngreso->month : ($fechaIngreso->month + 1);
                $mesFin = str_contains($semestre, 'JUL') ? 6 : 12;
                $mesesLaborados = max(0, min(6, ($mesFin - $mesInicio + 1)));
            }

            // Si tiene menos de 1 mes completo, no percibe gratificación proporcional ordinaria
            if ($mesesLaborados <= 0) {
                continue;
            }

            // Gratificación proporcional (Sextos)
            $montoGrati = round(($remunComputable / 6.0) * $mesesLaborados, 2);
            // Bonificación Extraordinaria del 9% (Ley N° 29351)
            $bonifLey9 = round($montoGrati * 0.09, 2);
            $descuentoIR5ta = 0.0;
            $netoPagar = $montoGrati + $bonifLey9 - $descuentoIR5ta;

            $totalBruto += $montoGrati;
            $totalBonif9 += $bonifLey9;
            $totalNeto += $netoPagar;

            $detallesCalculados[] = [
                'emp' => $emp,
                'datosLab' => $datosLab,
                'fechaIngreso' => $fechaIngreso->format('Y-m-d'),
                'sueldoBase' => $sueldoBase,
                'asigFam' => $asigFam,
                'remunComputable' => $remunComputable,
                'mesesLaborados' => $mesesLaborados,
                'montoGrati' => $montoGrati,
                'bonifLey9' => $bonifLey9,
                'descuentoIR5ta' => $descuentoIR5ta,
                'netoPagar' => $netoPagar,
            ];
        }

        DB::beginTransaction();
        try {
            GratificacionDetalle::where('gratificacion_id', $idCierre)->delete();
            GratificacionSemestral::where('id', $idCierre)->delete();

            $cierre = GratificacionSemestral::create([
                'id' => $idCierre,
                'periodo_semestral' => $periodo,
                'empresa' => $empresa,
                'conteo_trabajadores' => count($detallesCalculados),
                'total_gratificacion_bruta' => round($totalBruto, 2),
                'total_bonificacion_ley' => round($totalBonif9, 2),
                'total_neto_pagado' => round($totalNeto, 2),
                'estado' => 'Procesado',
            ]);

            $detallesResumen = [];

            foreach ($detallesCalculados as $item) {
                $emp = $item['emp'];
                $datosLab = $item['datosLab'];

                $det = GratificacionDetalle::create([
                    'id' => 'det-' . $idCierre . '-' . $emp->id,
                    'gratificacion_id' => $idCierre,
                    'empleado_id' => $emp->id,
                    'nombre_empleado' => $emp->nombre_completo ?: ($emp->nombres . ' ' . $emp->apellidos),
                    'numero_documento' => $emp->numero_documento,
                    'cargo' => $emp->cargo ?: 'Colaborador',
                    'fecha_ingreso' => $item['fechaIngreso'],
                    'sueldo_basico' => $item['sueldoBase'],
                    'asignacion_familiar' => $item['asigFam'],
                    'remuneracion_computable' => $item['remunComputable'],
                    'meses_laborados' => $item['mesesLaborados'],
                    'monto_gratificacion' => $item['montoGrati'],
                    'monto_bonificacion_ley9' => $item['bonifLey9'],
                    'descuento_ir5ta' => $item['descuentoIR5ta'],
                    'total_neto_pagar' => $item['netoPagar'],
                    'banco_abono' => $datosLab ? ($datosLab->banco_sueldo ?: 'BCP') : 'BCP',
                    'numero_cuenta_abono' => $datosLab ? ($datosLab->numero_cuenta_banco ?: '---') : '---',
                ]);

                $detallesResumen[] = $det;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Gratificación Semestral '{$periodo}' para '{$empresa}' procesada exitosamente según Ley 27735 y Ley 29351.",
                'cabecera' => $cierre,
                'detalles' => $detallesResumen,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar Gratificación: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        $cierre = GratificacionSemestral::findOrFail($id);
        $cierre->delete();

        return response()->json([
            'success' => true,
            'message' => 'Registro de Gratificación eliminado de MySQL.',
        ]);
    }
}