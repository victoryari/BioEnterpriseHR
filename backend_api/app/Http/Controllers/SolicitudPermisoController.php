<?php

namespace App\Http\Controllers;

use App\Models\SolicitudPermiso;
use Illuminate\Http\Request;

class SolicitudPermisoController extends Controller
{
    public function index(Request $request)
    {
        $query = SolicitudPermiso::query();

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        $solicitudes = $query->orderBy('fecha_solicitud', 'desc')->get();
        return response()->json($solicitudes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|max:36|unique:solicitudes_permisos,id',
            'empleado_id' => 'nullable|string|max:36',
            'nombre_empleado' => 'required|string|max:200',
            'tipo' => 'required|in:Vacaciones,Descanso Médico,Permiso,Compensación',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date',
            'motivo' => 'required|string',
            'estado' => 'nullable|in:Aprobado,Pendiente,Rechazado',
        ]);

        $solicitud = SolicitudPermiso::create([
            'id' => $validated['id'],
            'empleado_id' => $request->input('empleado_id'),
            'nombre_empleado' => $validated['nombre_empleado'],
            'tipo' => $validated['tipo'],
            'fecha_inicio' => $validated['fecha_inicio'],
            'fecha_fin' => $validated['fecha_fin'],
            'motivo' => $validated['motivo'],
            'nombre_documento' => $request->input('nombre_documento'),
            'ruta_documento' => $request->input('ruta_documento'),
            'estado' => $request->input('estado', 'Pendiente'),
            'fecha_solicitud' => $request->input('fecha_solicitud', now()->toDateString()),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Solicitud registrada en MySQL',
            'data' => $solicitud,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $solicitud = SolicitudPermiso::findOrFail($id);

        if ($request->has('estado')) {
            $request->validate(['estado' => 'required|in:Aprobado,Pendiente,Rechazado']);
            $solicitud->estado = $request->estado;
        }

        if ($request->has('notas_revision')) {
            $solicitud->notas_revision = $request->notas_revision;
        }

        $solicitud->save();

        return response()->json([
            'success' => true,
            'message' => 'Solicitud actualizada en MySQL',
            'data' => $solicitud,
        ]);
    }

    public function destroy($id)
    {
        $solicitud = SolicitudPermiso::findOrFail($id);
        $solicitud->delete();

        return response()->json([
            'success' => true,
            'message' => 'Solicitud eliminada de MySQL',
        ]);
    }

    public function show($id)
    {
        $item = \App\Models\SolicitudPermiso::find($id);
        if (!$item) {
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }
        return response()->json($item);
    }
}
