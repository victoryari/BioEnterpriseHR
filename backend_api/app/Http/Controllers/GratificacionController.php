<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\GratificacionSemestral;
use App\Models\GratificacionDetalle;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

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

        $periodo = $validated['periodo_semestral'];
        $empresa = $validated['empresa'];

        $empleados = Empleado::where('empresa', $empresa)->get();
        if ($empleados->isEmpty()) {
            $empleados = Empleado::all();
        }

        if ($empleados->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => "No se encontraron colaboradores registrados para procesar Gratificación.",
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
            $mesesLaborados = 6;

            // Gratificación completa legal
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
                'total_gratificacion_bruta' => $totalBruto,
                'total_bonificacion_ley' => $totalBonif9,
                'total_neto_pagado' => $totalNeto,
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
                    'fecha_ingreso' => $emp->fecha_ingreso ?: '2024-01-15',
                    'sueldo_basico' => $item['sueldoBase'],
                    'asignacion_familiar' => $item['asigFam'],
                    'remuneracion_computable' => $item['remunComputable'],
                    'meses_laborados' => $item['mesesLaborados'],
                    'monto_gratificacion' => $item['montoGrati'],
                    'monto_bonificacion_ley9' => $item['bonifLey9'],
                    'descuento_ir5ta' => $item['descuentoIR5ta'],
                    'total_neto_pagar' => $item['netoPagar'],
                    'banco_abono' => $datosLab ? ($datosLab->banco_sueldo ?: 'BCP Banco de Crédito') : 'BCP Banco de Crédito',
                    'numero_cuenta_abono' => $datosLab ? ($datosLab->numero_cuenta_banco ?: '0011-0123-4567890123') : '0011-0123-4567890123',
                ]);

                $detallesResumen[] = $det;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Gratificación Semestral '{$periodo}' para '{$empresa}' procesada con éxito con Bonificación 9% Ley 29351.",
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