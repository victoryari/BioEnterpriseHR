<?php

namespace App\Http\Controllers;

use App\Models\Departamento;
use Illuminate\Http\Request;

class DepartamentoController extends Controller
{
    public function index(Request $request)
    {
        $departamentos = Departamento::orderBy('nombre', 'asc')->get();
        return response()->json($departamentos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:departamentos,nombre',
            'descripcion' => 'nullable|string|max:255',
        ]);

        $departamento = Departamento::create([
            'nombre' => $validated['nombre'],
            'descripcion' => $request->input('descripcion'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Departamento creado en MySQL',
            'data' => $departamento,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $departamento = Departamento::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:departamentos,nombre,' . $id,
        ]);

        $departamento->update([
            'nombre' => $validated['nombre'],
            'descripcion' => $request->input('descripcion', $departamento->descripcion),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Departamento actualizado en MySQL',
            'data' => $departamento,
        ]);
    }

    public function destroy($id)
    {
        $departamento = Departamento::findOrFail($id);
        $departamento->delete();

        return response()->json([
            'success' => true,
            'message' => 'Departamento eliminado de MySQL',
        ]);
    }

    public function show($id)
    {
        $item = \App\Models\Departamento::find($id);
        if (!$item) {
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }
        return response()->json($item);
    }
}
