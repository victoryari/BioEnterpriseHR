<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use App\Models\Empleado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * Iniciar sesión en el sistema BioEnterpriseHR
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'nullable|string',
            'correo' => 'nullable|string',
            'identifier' => 'nullable|string',
            'password' => 'nullable|string',
            'clave' => 'nullable|string',
        ]);

        $identifier = $request->input('correo') ?? $request->input('email') ?? $request->input('identifier');
        $password = $request->input('password') ?? $request->input('clave') ?? '';

        if (empty($identifier)) {
            throw ValidationException::withMessages([
                'identifier' => ['Debe ingresar su correo corporativo o número de documento / PIN.'],
            ]);
        }

        $identifierClean = trim($identifier);

        // 1. Buscar en la tabla de usuarios del sistema por correo
        $usuario = Usuario::where('correo', $identifierClean)->first();

        // 2. Si no se encuentra por correo, buscar si está vinculado a un empleado por DNI o PIN
        if (!$usuario) {
            $empleado = Empleado::where('numero_documento', $identifierClean)
                ->orWhere('pin', $identifierClean)
                ->orWhere('correo', $identifierClean)
                ->first();

            if ($empleado) {
                $usuario = Usuario::where('empleado_id', $empleado->id)
                    ->orWhere('correo', $empleado->correo)
                    ->first();

                // Si es un empleado registrado que accede por primera vez al autoservicio
                if (!$usuario) {
                    $pinValido = !empty($empleado->pin) ? $empleado->pin : substr($empleado->numero_documento, -4);
                    // Validar con su PIN biométrico o clave
                    if (!empty($password) && ($password === $pinValido || $password === $empleado->numero_documento)) {
                        $usuario = Usuario::create([
                            'empleado_id' => $empleado->id,
                            'nombre' => $empleado->nombre_completo ?: ($empleado->nombres . ' ' . $empleado->apellidos),
                            'correo' => $empleado->correo ?: "{$empleado->numero_documento}@carmelita.pe",
                            'clave_hash' => Hash::make($password),
                            'rol' => 'empleado',
                            'estado' => $empleado->estado === 'Inactivo' ? 'Inactivo' : 'Activo',
                            'foto' => $empleado->foto_url,
                        ]);
                    }
                }
            }
        }

        if (!$usuario) {
            throw ValidationException::withMessages([
                'identifier' => ['Usuario o colaborador no registrado en el sistema.'],
            ]);
        }

        if ($usuario->estado === 'Inactivo') {
            throw ValidationException::withMessages([
                'identifier' => ['La cuenta se encuentra inactiva o inhabilitada. Contacte a RRHH.'],
            ]);
        }

        // 3. Validar contraseña
        $passwordMatches = false;
        if (!empty($password)) {
            // Verificar hash bcrypt
            if (Hash::check($password, $usuario->clave_hash)) {
                $passwordMatches = true;
            } elseif ($usuario->clave_hash === md5($password) || $usuario->clave_hash === $password) {
                // Compatibilidad y auto-upgrade a Bcrypt
                $usuario->update(['clave_hash' => Hash::make($password)]);
                $passwordMatches = true;
            } elseif ($usuario->rol === 'empleado' && $usuario->empleado_id) {
                $emp = Empleado::find($usuario->empleado_id);
                if ($emp && ($password === $emp->pin || $password === $emp->numero_documento)) {
                    $passwordMatches = true;
                }
            }
        }

        if (!$passwordMatches) {
            throw ValidationException::withMessages([
                'password' => ['La contraseña o PIN ingresado es incorrecto.'],
            ]);
        }

        // Actualizar último login
        $usuario->update(['ultimo_login' => now()]);

        // Generar token Sanctum
        $token = $usuario->createToken('bioenterprise-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Autenticación exitosa',
            'token' => $token,
            'user' => [
                'id' => (string)$usuario->id,
                'empleado_id' => $usuario->empleado_id,
                'nombre' => $usuario->nombre,
                'correo' => $usuario->correo,
                'rol' => $usuario->rol,
                'estado' => $usuario->estado,
                'foto' => $usuario->foto,
            ],
        ]);
    }

    /**
     * Cerrar sesión y revocar tokens
     */
    public function logout(Request $request)
    {
        if ($request->user() && method_exists($request->user(), 'currentAccessToken') && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }
        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    /**
     * Obtener perfil del usuario autenticado
     */
    public function user(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        return response()->json([
            'id' => (string)$user->id,
            'empleado_id' => $user->empleado_id,
            'nombre' => $user->nombre,
            'correo' => $user->correo,
            'rol' => $user->rol,
            'estado' => $user->estado,
            'foto' => $user->foto,
        ]);
    }
}

