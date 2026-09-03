<?php

namespace App\Http\Controllers;

use App\Models\Horario;
use Illuminate\Http\Request;

class HorarioController extends Controller
{
    public function index(Request $request)
    {
        $horarios = Horario::orderBy('nombre', 'asc')->get();
        return response()->json($horarios);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|max:30|unique:horarios,id',
            'nombre' => 'required|string|max:100',
            'hora_entrada' => 'required|string',
            'hora_salida' => 'required|string',
        ]);

        $horario = Horario::create([
            'id' => $validated['id'],
            'nombre' => $validated['nombre'],
            'hora_entrada' => $validated['hora_entrada'],
            'ventana_entrada_desde' => $request->input('ventana_entrada_desde'),
            'ventana_entrada_hasta' => $request->input('ventana_entrada_hasta'),
            'hora_salida' => $validated['hora_salida'],
            'ventana_salida_desde' => $request->input('ventana_salida_desde'),
            'ventana_salida_hasta' => $request->input('ventana_salida_hasta'),
            'minutos_tolerancia' => $request->input('minutos_tolerancia', 10),
            'inicio_refrigerio' => $request->input('inicio_refrigerio'),
            'fin_refrigerio' => $request->input('fin_refrigerio'),
            'minutos_refrigerio' => $request->input('minutos_refrigerio', 60),
            'marcado_refrigerio_obligatorio' => $request->boolean('marcado_refrigerio_obligatorio', false),
            'color_tag' => $request->input('color_tag', '#3B82F6'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Horario creado en MySQL',
            'data' => $horario,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $horario = Horario::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'hora_entrada' => 'required|string',
            'hora_salida' => 'required|string',
        ]);

        $horario->update([
            'nombre' => $validated['nombre'],
            'hora_entrada' => $validated['hora_entrada'],
            'ventana_entrada_desde' => $request->input('ventana_entrada_desde', $horario->ventana_entrada_desde),
            'ventana_entrada_hasta' => $request->input('ventana_entrada_hasta', $horario->ventana_entrada_hasta),
            'hora_salida' => $validated['hora_salida'],
            'ventana_salida_desde' => $request->input('ventana_salida_desde', $horario->ventana_salida_desde),
            'ventana_salida_hasta' => $request->input('ventana_salida_hasta', $horario->ventana_salida_hasta),
            'minutos_tolerancia' => $request->input('minutos_tolerancia', $horario->minutos_tolerancia),
            'inicio_refrigerio' => $request->input('inicio_refrigerio', $horario->inicio_refrigerio),
            'fin_refrigerio' => $request->input('fin_refrigerio', $horario->fin_refrigerio),
            'minutos_refrigerio' => $request->input('minutos_refrigerio', $horario->minutos_refrigerio),
            'marcado_refrigerio_obligatorio' => $request->boolean('marcado_refrigerio_obligatorio', $horario->marcado_refrigerio_obligatorio),
            'color_tag' => $request->input('color_tag', $horario->color_tag),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Horario actualizado en MySQL',
            'data' => $horario,
        ]);
    }

    public function destroy($id)
    {
        $horario = Horario::findOrFail($id);
        $horario->delete();

        return response()->json([
            'success' => true,
            'message' => 'Horario eliminado de MySQL',
        ]);
    }

    public function show($id)
    {
        $item = \App\Models\Horario::find($id);
        if (!$item) {
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }
        return response()->json($item);
    }
}
