<?php

namespace App\Http\Controllers;

use App\Models\Sede;
use Illuminate\Http\Request;

class SedeController extends Controller
{
    public function index(Request $request)
    {
        $sedes = Sede::orderBy('nombre', 'asc')->get();
        return response()->json($sedes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:sedes,nombre',
            'ciudad' => 'required|string|max:80',
            'direccion' => 'nullable|string|max:255',
        ]);

        $sede = Sede::create([
            'nombre' => $validated['nombre'],
            'ciudad' => $validated['ciudad'],
            'direccion' => $request->input('direccion'),
            'activo' => $request->boolean('activo', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sede creada en MySQL',
            'data' => $sede,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $sede = Sede::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:sedes,nombre,' . $id,
            'ciudad' => 'required|string|max:80',
        ]);

        $sede->update([
            'nombre' => $validated['nombre'],
            'ciudad' => $validated['ciudad'],
            'direccion' => $request->input('direccion', $sede->direccion),
            'activo' => $request->boolean('activo', $sede->activo),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sede actualizada en MySQL',
            'data' => $sede,
        ]);
    }

    public function destroy($id)
    {
        $sede = Sede::findOrFail($id);
        $sede->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sede eliminada de MySQL',
        ]);
    }

    public function show($id)
    {
        $item = \App\Models\Sede::find($id);
        if (!$item) {
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }
        return response()->json($item);
    }
}
