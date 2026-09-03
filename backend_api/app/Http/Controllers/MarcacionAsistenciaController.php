<?php

namespace App\Http\Controllers;

use App\Models\MarcacionAsistencia;
use Illuminate\Http\Request;

class MarcacionAsistenciaController extends Controller
{
    public function index(Request $request)
    {
        $query = MarcacionAsistencia::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre_empleado', 'like', "%$search%")
                  ->orWhere('pin', 'like', "%$search%")
                  ->orWhere('nombre_dispositivo', 'like', "%$search%");
            });
        }

        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('fecha', [$request->fecha_inicio, $request->fecha_fin]);
        }

        $marcaciones = $query->orderBy('fecha_hora', 'desc')->limit(1000)->get();
        return response()->json($marcaciones);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|max:100|unique:marcaciones_asistencia,id',
            'fecha' => 'required|date',
            'hora' => 'required|string',
            'empleado_id' => 'nullable|string|max:50',
            'nombre_empleado' => 'required|string|max:200',
            'pin' => 'required|string|max:50',
            'dispositivo_id' => 'nullable|string|max:50',
            'nombre_dispositivo' => 'required|string|max:150',
            'tipo' => 'nullable|string|max:50',
            'estado' => 'nullable|string|max:100',
            'metodo_verificacion' => 'nullable|string|max:100',
        ]);

        $fechaHora = $validated['fecha'] . ' ' . $validated['hora'];

        $marcacion = MarcacionAsistencia::create([
            'id' => $validated['id'],
            'fecha' => $validated['fecha'],
            'hora' => $validated['hora'],
            'fecha_hora' => $fechaHora,
            'empleado_id' => $request->input('empleado_id'),
            'nombre_empleado' => $validated['nombre_empleado'],
            'pin' => $validated['pin'],
            'numero_tarjeta' => $request->input('numero_tarjeta'),
            'dispositivo_id' => $request->input('dispositivo_id'),
            'nombre_dispositivo' => $validated['nombre_dispositivo'],
            'tipo' => $request->input('tipo', 'Entrada'),
            'estado' => $request->input('estado', 'Escaneo exitoso'),
            'metodo_verificacion' => $request->input('metodo_verificacion', 'Huella'),
            'es_error' => $request->boolean('es_error', false),
            'trama_cruda' => $request->input('trama_cruda'),
            'motivo_regularizacion' => $request->input('motivo_regularizacion'),
            'regularizado_por' => $request->input('regularizado_por'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Marcación registrada exitosamente en MySQL',
            'data' => $marcacion,
        ], 201);
    }
}