<?php

namespace App\Http\Controllers;

use App\Models\DiaFestivo;
use Illuminate\Http\Request;

class DiaFestivoController extends Controller
{
    public function index(Request $request)
    {
        $festivos = DiaFestivo::orderBy('fecha_festivo', 'asc')->get();
        return response()->json($festivos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'fecha_festivo' => 'required|date|unique:dias_festivos,fecha_festivo',
        ]);

        $festivo = DiaFestivo::create([
            'nombre' => $validated['nombre'],
            'fecha_festivo' => $validated['fecha_festivo'],
            'es_recurrente' => $request->boolean('es_recurrente', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Día festivo registrado en MySQL',
            'data' => $festivo,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $festivo = DiaFestivo::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'fecha_festivo' => 'required|date|unique:dias_festivos,fecha_festivo,' . $id,
        ]);

        $festivo->update([
            'nombre' => $validated['nombre'],
            'fecha_festivo' => $validated['fecha_festivo'],
            'es_recurrente' => $request->boolean('es_recurrente', $festivo->es_recurrente),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Día festivo actualizado en MySQL',
            'data' => $festivo,
        ]);
    }

    public function destroy($id)
    {
        $festivo = DiaFestivo::where('id', $id)->orWhere('fecha_festivo', $id)->firstOrFail();
        $festivo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Día festivo eliminado de MySQL',
        ]);
    }

    public function show($id)
    {
        $item = \App\Models\DiaFestivo::find($id);
        if (!$item) {
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }
        return response()->json($item);
    }
}
