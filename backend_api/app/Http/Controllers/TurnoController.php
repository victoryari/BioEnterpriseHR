<?php

namespace App\Http\Controllers;

use App\Models\Turno;
use App\Models\TurnoDia;
use Illuminate\Http\Request;

class TurnoController extends Controller
{
    public function index(Request $request)
    {
        $turnos = Turno::with('dias')->orderBy('nombre', 'asc')->get();
        return response()->json($turnos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|max:30|unique:turnos,id',
            'nombre' => 'required|string|max:100',
            'tipo' => 'nullable|in:Fijo,Rotativo,Flexible',
            'descripcion' => 'nullable|string|max:255',
        ]);

        $turno = Turno::create([
            'id' => $validated['id'],
            'nombre' => $validated['nombre'],
            'tipo' => $request->input('tipo', 'Fijo'),
            'descripcion' => $request->input('descripcion', ''),
            'activo' => $request->boolean('activo', true),
        ]);

        if ($request->has('dias') && is_array($request->input('dias'))) {
            foreach ($request->input('dias') as $d) {
                $esLaborable = isset($d['esLaborable']) ? $d['esLaborable'] : (isset($d['es_laborable']) ? $d['es_laborable'] : false);
                $horarioId = isset($d['horarioId']) ? $d['horarioId'] : (isset($d['horario_id']) ? $d['horario_id'] : null);
                TurnoDia::create([
                    'turno_id' => $turno->id,
                    'dia_semana' => $d['diaSemana'] ?? $d['dia_semana'],
                    'nombre_dia' => $d['nombreDia'] ?? $d['nombre_dia'] ?? '',
                    'horario_id' => $esLaborable ? $horarioId : null,
                    'es_laborable' => (bool)$esLaborable,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Turno creado en MySQL',
            'data' => $turno->load('dias'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $turno = Turno::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'tipo' => 'nullable|in:Fijo,Rotativo,Flexible',
        ]);

        $turno->update([
            'nombre' => $validated['nombre'],
            'tipo' => $request->input('tipo', $turno->tipo),
            'descripcion' => $request->input('descripcion', $turno->descripcion),
            'activo' => $request->boolean('activo', $turno->activo),
        ]);

        if ($request->has('dias') && is_array($request->input('dias'))) {
            TurnoDia::where('turno_id', $turno->id)->delete();
            foreach ($request->input('dias') as $d) {
                $esLaborable = isset($d['esLaborable']) ? $d['esLaborable'] : (isset($d['es_laborable']) ? $d['es_laborable'] : false);
                $horarioId = isset($d['horarioId']) ? $d['horarioId'] : (isset($d['horario_id']) ? $d['horario_id'] : null);
                TurnoDia::create([
                    'turno_id' => $turno->id,
                    'dia_semana' => $d['diaSemana'] ?? $d['dia_semana'],
                    'nombre_dia' => $d['nombreDia'] ?? $d['nombre_dia'] ?? '',
                    'horario_id' => $esLaborable ? $horarioId : null,
                    'es_laborable' => (bool)$esLaborable,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Turno actualizado en MySQL',
            'data' => $turno->load('dias'),
        ]);
    }

    public function destroy($id)
    {
        $turno = Turno::findOrFail($id);
        TurnoDia::where('turno_id', $turno->id)->delete();
        $turno->delete();

        return response()->json([
            'success' => true,
            'message' => 'Turno eliminado de MySQL',
        ]);
    }

    public function show($id)
    {
        $item = \App\Models\Turno::find($id);
        if (!$item) {
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }
        return response()->json($item);
    }
}
