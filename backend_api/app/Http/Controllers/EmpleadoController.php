<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmpleadoController extends Controller
{
    public function index()
    {
        $empleados = Empleado::with(['sede', 'departamento'])->get();
        
        // Adjuntar datos laborales y de CTS
        $empleados->transform(function ($emp) {
            $datosLaborales = DB::table('empleados_datos_laborales')->where('empleado_id', $emp->id)->first();
            if ($datosLaborales) {
                $emp->sueldo_base = $datosLaborales->sueldo_basico;
                $emp->regimen_previsional = $datosLaborales->regimen_previsional;
                $emp->tipo_comision_afp = $datosLaborales->tipo_comision_afp;
                $emp->cuspp = $datosLaborales->cuspp;
                $emp->tiene_asignacion_familiar = (bool)$datosLaborales->tiene_asignacion_familiar;
                $emp->banco_sueldo = $datosLaborales->banco_sueldo;
                $emp->numero_cuenta_banco = $datosLaborales->numero_cuenta_banco;
                $emp->cci = $datosLaborales->cci;
                $emp->banco_cts = $datosLaborales->banco_cts;
                $emp->numero_cuenta_cts = $datosLaborales->numero_cuenta_cts;
                $emp->moneda_cts = $datosLaborales->moneda_cts;
            }
            return $emp;
        });

        return response()->json($empleados);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'correo' => 'required|email|max:150|unique:empleados,correo',
            'cargo' => 'required|string|max:100',
            'departamento_id' => 'required|integer|exists:departamentos,id',
            'sede_id' => 'required|integer|exists:sedes,id',
        ]);

        $id = $request->input('id', 'emp-' . time());
        $nombres = $request->input('nombres', '');
        $apellidos = $request->input('apellidos', '');
        $nombreCompleto = $request->input('nombre_completo', trim("$nombres $apellidos"));

        $empleado = Empleado::create([
            'id' => $id,
            'nombre_completo' => $nombreCompleto,
            'nombres' => $nombres,
            'apellidos' => $apellidos,
            'correo' => $validated['correo'],
            'cargo' => $validated['cargo'],
            'departamento_id' => $validated['departamento_id'],
            'sede_id' => $validated['sede_id'],
            'empresa' => $request->input('empresa'),
            'estado' => $request->input('estado', 'Activo'),
            'tipo_documento' => $request->input('tipo_documento', 'DNI'),
            'numero_documento' => $request->input('numero_documento', '00000000'),
            'pin' => $request->input('pin', rand(1000, 9999)),
            'numero_tarjeta' => $request->input('numero_tarjeta'),
            'tarjeta_rfid' => $request->boolean('tarjeta_rfid', false),
            'biometria_huella' => $request->boolean('biometria_huella', false),
            'biometria_rostro' => $request->boolean('biometria_rostro', false),
            'tipo_marcado_predilecto' => $request->input('tipo_marcado_predilecto', 'Huella'),
            'telefono' => $request->input('telefono'),
            'direccion' => $request->input('direccion'),
            'foto_url' => $request->input('foto_url', ''),
            'sueldo_base' => $request->input('sueldo_base', 1025.00),
            'acceso_entrada_principal' => $request->boolean('acceso_entrada_principal', true),
            'acceso_centro_datos' => $request->boolean('acceso_centro_datos', false),
            'acceso_almacen' => $request->boolean('acceso_almacen', false),
        ]);

        return response()->json($empleado, 201);
    }

    public function update(Request $request, $id)
    {
        $empleado = Empleado::findOrFail($id);

        $validated = $request->validate([
            'correo' => 'required|email|max:150|unique:empleados,correo,' . $id . ',id',
            'cargo' => 'required|string|max:100',
            'departamento_id' => 'required|integer|exists:departamentos,id',
            'sede_id' => 'required|integer|exists:sedes,id',
            'estado' => 'nullable|in:Activo,Inactivo',
        ]);

        $nombres = $request->input('nombres', $empleado->nombres);
        $apellidos = $request->input('apellidos', $empleado->apellidos);
        $nombreCompleto = $request->input('nombre_completo', '');

        if (empty($nombreCompleto)) {
            $nombreCompleto = trim("$nombres $apellidos");
        }

        $data = [
            'nombre_completo' => $nombreCompleto,
            'nombres' => $nombres,
            'apellidos' => $apellidos,
            'correo' => $validated['correo'],
            'cargo' => $validated['cargo'],
            'departamento_id' => $validated['departamento_id'],
            'sede_id' => $validated['sede_id'],
            'estado' => $request->input('estado', $empleado->estado),
        ];

        if ($request->has('tipo_documento')) $data['tipo_documento'] = $request->input('tipo_documento');
        if ($request->has('numero_documento')) $data['numero_documento'] = $request->input('numero_documento');
        if ($request->has('pin')) $data['pin'] = $request->input('pin');
        if ($request->has('numero_tarjeta')) $data['numero_tarjeta'] = $request->input('numero_tarjeta');
        if ($request->has('tarjeta_rfid')) $data['tarjeta_rfid'] = $request->boolean('tarjeta_rfid');
        if ($request->has('biometria_huella')) $data['biometria_huella'] = $request->boolean('biometria_huella');
        if ($request->has('biometria_rostro')) $data['biometria_rostro'] = $request->boolean('biometria_rostro');
        if ($request->has('tipo_marcado_predilecto')) $data['tipo_marcado_predilecto'] = $request->input('tipo_marcado_predilecto');
        if ($request->has('telefono')) $data['telefono'] = $request->input('telefono');
        if ($request->has('direccion')) $data['direccion'] = $request->input('direccion');
        if ($request->has('empresa')) $data['empresa'] = $request->input('empresa');
        if ($request->has('foto_url')) $data['foto_url'] = $request->input('foto_url');
        if ($request->has('fecha_ingreso')) $data['fecha_ingreso'] = $request->input('fecha_ingreso');
        if ($request->has('fecha_cese')) $data['fecha_cese'] = $request->input('fecha_cese');
        if ($request->has('fecha_nacimiento')) $data['fecha_nacimiento'] = $request->input('fecha_nacimiento');
        if ($request->has('sueldo_base')) $data['sueldo_base'] = $request->input('sueldo_base');

        $empleado->update($data);

        // Actualizar o crear datos laborales y de CTS
        DB::table('empleados_datos_laborales')->updateOrInsert(
            ['empleado_id' => $id],
            [
                'sueldo_basico' => $request->input('sueldo_base', $empleado->sueldo_base ?? 2500.00),
                'regimen_previsional' => $request->input('regimen_previsional', 'AFP Integra'),
                'tipo_comision_afp' => $request->input('tipo_comision_afp', 'Flujo'),
                'cuspp' => $request->input('cuspp'),
                'tiene_asignacion_familiar' => $request->boolean('tiene_asignacion_familiar', true),
                'banco_sueldo' => $request->input('banco_sueldo', 'BCP'),
                'numero_cuenta_banco' => $request->input('numero_cuenta_banco'),
                'cci' => $request->input('cci'),
                'banco_cts' => $request->input('banco_cts', 'BBVA Banco Continental'),
                'numero_cuenta_cts' => $request->input('numero_cuenta_cts'),
                'moneda_cts' => $request->input('moneda_cts', 'PEN'),
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Colaborador y datos de nómina/CTS actualizados exitosamente.',
            'data' => $empleado->fresh()->load(['sede', 'departamento']),
        ]);
    }

    public function destroy($id)
    {
        $empleado = Empleado::find($id);
        if (!$empleado) {
            return response()->json(['message' => 'Colaborador no encontrado'], 404);
        }

        // Marcar como Inactivo y registrar fecha de cese (Soft Delete)
        $empleado->update([
            'estado' => 'Inactivo',
            'fecha_cese' => now()->toDateString(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Colaborador inhabilitado exitosamente en la base de datos.',
        ]);
    }

    public function show($id)
    {
        $item = \App\Models\Empleado::find($id);
        if (!$item) {
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }
        return response()->json($item);
    }
}
