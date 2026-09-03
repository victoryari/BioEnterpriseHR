<?php

namespace App\Http\Controllers;

use App\Models\AsignacionTurno;
use Illuminate\Http\Request;

class AsignacionTurnoController extends Controller
{
    public function index(Request $request)
    {
        $asignaciones = AsignacionTurno::orderBy('created_at', 'desc')->get();
        return response()->json($asignaciones);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'assignments' => 'required|array',
            'assignments.*.id' => 'required|string|max:30',
            'assignments.*.empleadoId' => 'required|string|max:30',
            'assignments.*.turnoId' => 'required|string|max:30',
            'assignments.*.fechaInicio' => 'required|date',
        ]);

        foreach ($validated['assignments'] as $item) {
            AsignacionTurno::updateOrCreate(
                ['id' => $item['id']],
                [
                    'empleado_id' => $item['empleadoId'],
                    'turno_id' => $item['turnoId'],
                    'fecha_inicio' => $item['fechaInicio'],
                    'fecha_fin' => $item['fechaFin'] ?? null,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Asignaciones de turno guardadas en MySQL',
        ]);
    }

    public function destroy($id)
    {
        $asignacion = AsignacionTurno::findOrFail($id);
        $asignacion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Asignación de turno eliminada de MySQL',
        ]);
    }
}
