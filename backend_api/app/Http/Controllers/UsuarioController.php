<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        $query = Usuario::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%$search%")
                  ->orWhere('correo', 'like', "%$search%");
            });
        }

        if ($request->filled('rol')) {
            $query->where('rol', $request->rol);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        $usuarios = $query->orderBy('id', 'asc')->get();

        return response()->json($usuarios);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'correo' => 'required|email|max:150|unique:usuarios,correo',
            'clave' => 'nullable|string|min:6',
            'password' => 'nullable|string|min:6',
            'rol' => 'required|in:admin,empleado,gerente_rrhh,supervisor',
            'estado' => 'nullable|in:Activo,Inactivo',
            'foto' => 'nullable|string',
            'empleado_id' => 'nullable|string|max:36',
        ]);

        $clave = $request->input('clave') ?? $request->input('password') ?? '123456';

        $usuario = Usuario::create([
            'empleado_id' => $request->input('empleado_id'),
            'nombre' => $validated['nombre'],
            'correo' => $validated['correo'],
            'clave_hash' => Hash::make($clave),
            'rol' => $validated['rol'],
            'estado' => $request->input('estado', 'Activo'),
            'foto' => $request->input('foto'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'data' => $usuario,
        ], 201);
    }

    public function show($id)
    {
        $usuario = Usuario::findOrFail($id);
        return response()->json($usuario);
    }

    public function update(Request $request, $id)
    {
        $usuario = Usuario::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'correo' => 'required|email|max:150|unique:usuarios,correo,' . $id,
            'rol' => 'required|in:admin,empleado,gerente_rrhh,supervisor',
            'estado' => 'nullable|in:Activo,Inactivo',
            'foto' => 'nullable|string',
            'clave' => 'nullable|string|min:6',
            'password' => 'nullable|string|min:6',
            'empleado_id' => 'nullable|string|max:36',
        ]);

        $data = [
            'nombre' => $validated['nombre'],
            'correo' => $validated['correo'],
            'rol' => $validated['rol'],
            'estado' => $request->input('estado', $usuario->estado),
        ];

        if ($request->has('foto')) {
            $data['foto'] = $request->input('foto');
        }

        if ($request->has('empleado_id')) {
            $data['empleado_id'] = $request->input('empleado_id');
        }

        $clave = $request->input('clave') ?? $request->input('password');
        if (!empty($clave)) {
            $data['clave_hash'] = Hash::make($clave);
        }

        $usuario->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado exitosamente en base de datos',
            'data' => $usuario->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $usuario = Usuario::findOrFail($id);

        if ($usuario->rol === 'admin') {
            $countAdmins = Usuario::where('rol', 'admin')->count();
            if ($countAdmins <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el único administrador del sistema.',
                ], 422);
            }
        }

        $usuario->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado correctamente de la base de datos.',
        ]);
    }
}
