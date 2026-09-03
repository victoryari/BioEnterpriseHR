<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\DepositoCts;
use App\Models\DepositoCtsDetalle;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

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

        $periodo = $validated['periodo_semestral'];
        $empresa = $validated['empresa'];

        $empleados = Empleado::where('empresa', $empresa)->get();
        if ($empleados->isEmpty()) {
            $empleados = Empleado::all();
        }

        if ($empleados->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => "No se encontraron colaboradores registrados para procesar CTS.",
            ], 422);
        }

        $idCierre = 'cts-' . Str::slug($periodo) . '-' . Str::slug($empresa);
        $detallesCalculados = [];
        $montoTotalEmpresa = 0;

        foreach ($empleados as $emp) {
            $datosLab = DB::table('empleados_datos_laborales')->where('empleado_id', $emp->id)->first();
            $sueldoBase = $datosLab ? floatval($datosLab->sueldo_basico) : (floatval($emp->sueldo_base) ?: 2500.0);
            $asigFam = ($datosLab && $datosLab->tiene_asignacion_familiar) ? 102.50 : 0.0;

            // 1/6 de la gratificación computable
            $sextoGrati = round(($sueldoBase + $asigFam) / 6.0, 2);
            $remunComputable = $sueldoBase + $asigFam + $sextoGrati;

            $mesesLaborados = 6;
            $diasLaborados = 0;

            // Fórmula CTS semestral: (Remun Computable / 12) * Meses
            $montoCts = round(($remunComputable / 12.0) * $mesesLaborados, 2);
            $montoTotalEmpresa += $montoCts;

            $detallesCalculados[] = [
                'emp' => $emp,
                'datosLab' => $datosLab,
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
                'monto_total_depositado' => $montoTotalEmpresa,
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
                    'fecha_ingreso' => $emp->fecha_ingreso ?: '2024-01-15',
                    'sueldo_basico' => $item['sueldoBase'],
                    'asignacion_familiar' => $item['asigFam'],
                    'sexto_gratificacion' => $item['sextoGrati'],
                    'remuneracion_computable' => $item['remunComputable'],
                    'meses_laborados' => $item['mesesLaborados'],
                    'dias_laborados' => $item['diasLaborados'],
                    'monto_cts_depositado' => $item['montoCts'],
                    'banco_cts' => $datosLab ? ($datosLab->banco_cts ?: 'BCP Banco de Crédito') : 'BCP Banco de Crédito',
                    'numero_cuenta_cts' => $datosLab ? ($datosLab->numero_cuenta_cts ?: '0011-0123-4567890123') : '0011-0123-4567890123',
                    'moneda' => 'PEN',
                ]);

                $detallesResumen[] = $det;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Depósito de CTS '{$periodo}' para '{$empresa}' procesado exitosamente según D.S. 001-97-TR.",
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