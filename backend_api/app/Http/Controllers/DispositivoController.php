<?php

namespace App\Http\Controllers;

use App\Models\Dispositivo;
use App\Services\ZKTecoService;
use Illuminate\Http\Request;

class DispositivoController extends Controller
{
    public function index(Request $request)
    {
        $dispositivos = Dispositivo::orderBy('nombre', 'asc')->get();
        return response()->json($dispositivos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|max:36|unique:dispositivos,id',
            'nombre' => 'required|string|max:120',
            'numero_serie' => 'required|string|max:50',
            'ubicacion' => 'required|string|max:120',
            'direccion_ip' => 'required|string|max:45',
            'puerto' => 'nullable|integer',
            'protocolo' => 'nullable|string',
            'estado' => 'nullable|in:online,offline,error',
        ]);

        $dispositivo = Dispositivo::create([
            'id' => $validated['id'],
            'nombre' => $validated['nombre'],
            'numero_serie' => $validated['numero_serie'],
            'ubicacion' => $validated['ubicacion'],
            'direccion_ip' => $validated['direccion_ip'],
            'puerto' => $request->input('puerto', 4370),
            'protocolo' => $request->input('protocolo', 'Autónomo'),
            'soporta_huella' => $request->boolean('soporta_huella', true),
            'soporta_tarjeta_rfid' => $request->boolean('soporta_tarjeta_rfid', true),
            'soporta_pin' => $request->boolean('soporta_pin', true),
            'estado' => $request->input('estado', 'online'),
            'ultimo_pulso' => now(),
            'conteo_usuarios' => $request->input('conteo_usuarios', 0),
            'conteo_registros' => $request->input('conteo_registros', 0),
            'version_firmware' => $request->input('version_firmware', 'BioFirm v4.3.0'),
        ]);

        try {
            ZKTecoService::syncDeviceHardware($dispositivo);
        } catch (\Throwable $th) {
        }

        return response()->json([
            'success' => true,
            'message' => 'Dispositivo registrado exitosamente en MySQL',
            'data' => $dispositivo->fresh(),
        ], 201);
    }

    public function show($id)
    {
        $dispositivo = Dispositivo::findOrFail($id);
        return response()->json($dispositivo);
    }

    public function update(Request $request, $id)
    {
        $dispositivo = Dispositivo::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:120',
            'ubicacion' => 'required|string|max:120',
            'direccion_ip' => 'required|string|max:45',
            'puerto' => 'nullable|integer',
            'protocolo' => 'nullable|string',
            'estado' => 'nullable|in:online,offline,error',
        ]);

        $dispositivo->update([
            'nombre' => $validated['nombre'],
            'ubicacion' => $validated['ubicacion'],
            'direccion_ip' => $validated['direccion_ip'],
            'puerto' => $request->input('puerto', $dispositivo->puerto),
            'protocolo' => $request->input('protocolo', $dispositivo->protocolo),
            'estado' => $request->input('estado', $dispositivo->estado),
            'ultimo_pulso' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dispositivo actualizado en MySQL',
            'data' => $dispositivo->fresh(),
        ]);
    }

    public function sync($id)
    {
        $dispositivo = Dispositivo::findOrFail($id);
        $result = ZKTecoService::syncDeviceHardware($dispositivo);

        return response()->json($result);
    }

    public function syncAll()
    {
        $dispositivos = Dispositivo::all();
        $results = [];
        $totalLogsSynced = 0;

        foreach ($dispositivos as $dispositivo) {
            $res = ZKTecoService::syncDeviceHardware($dispositivo);
            $results[] = $res;
            if (!empty($res['logs_synced'])) {
                $totalLogsSynced += $res['logs_synced'];
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Sincronización completada en {$dispositivos->count()} dispositivo(s)",
            'total_logs_synced' => $totalLogsSynced,
            'details' => $results,
            'devices' => Dispositivo::all(),
        ]);
    }

    public function destroy($id)
    {
        $dispositivo = Dispositivo::findOrFail($id);
        $dispositivo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dispositivo eliminado de MySQL',
        ]);
    }
}
