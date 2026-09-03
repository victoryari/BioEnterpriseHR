<?php

use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\EmpleadoController;
use App\Http\Controllers\DispositivoController;
use App\Http\Controllers\MarcacionAsistenciaController;
use App\Http\Controllers\SolicitudPermisoController;
use App\Http\Controllers\HorarioController;
use App\Http\Controllers\TurnoController;
use App\Http\Controllers\AsignacionTurnoController;
use App\Http\Controllers\DiaFestivoController;
use App\Http\Controllers\ReglasAsistenciaController;
use App\Http\Controllers\SedeController;
use App\Http\Controllers\DepartamentoController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\UtilidadController;
use App\Http\Controllers\LiquidacionCeseController;
use App\Http\Controllers\PlameController;
use App\Http\Controllers\CtsController;
use App\Http\Controllers\GratificacionController;
use Illuminate\Support\Facades\Route;

// Estado / Salud de la API
Route::get('/health', function () {
    return response()->json([
        'status' => 'online',
        'app' => 'BioEnterpriseHR API',
        'database' => config('database.connections.mysql.database'),
        'timestamp' => now()->toIso8601String(),
    ]);
});

// CRUD de Usuarios del Sistema
Route::apiResource('usuarios', UsuarioController::class);

// CRUD de Colaboradores / Empleados
Route::apiResource('empleados', EmpleadoController::class);

// Rutas de Sincronizacion de Hardware Biometrico
Route::post('/dispositivos/sync-all', [DispositivoController::class, 'syncAll']);
Route::post('/dispositivos/{id}/sync', [DispositivoController::class, 'sync']);

// CRUD de Dispositivos / Hardware
Route::apiResource('dispositivos', DispositivoController::class);

// CRUD de Marcaciones de Asistencia
Route::get('/marcaciones', [MarcacionAsistenciaController::class, 'index']);
Route::post('/marcaciones', [MarcacionAsistenciaController::class, 'store']);

// CRUD de Solicitudes de Permisos
Route::apiResource('solicitudes', SolicitudPermisoController::class);

// CRUD de Horarios
Route::apiResource('horarios', HorarioController::class);

// CRUD de Turnos
Route::apiResource('turnos', TurnoController::class);

// Asignaciones de Turnos
Route::get('/asignaciones-turnos', [AsignacionTurnoController::class, 'index']);
Route::post('/asignaciones-turnos', [AsignacionTurnoController::class, 'store']);
Route::delete('/asignaciones-turnos/{id}', [AsignacionTurnoController::class, 'destroy']);

// CRUD Dias Festivos
Route::apiResource('feriados', DiaFestivoController::class);

// Reglas de Asistencia
Route::get('/reglas', [ReglasAsistenciaController::class, 'index']);
Route::put('/reglas', [ReglasAsistenciaController::class, 'update']);

// CRUD Sedes y Departamentos
Route::apiResource('sedes', SedeController::class);
Route::apiResource('departamentos', DepartamentoController::class);

// Módulo de Nóminas y Boletas de Pago (Normativa Peruana)
Route::get('/afp-tasas', [PayrollController::class, 'getAFPTasas']);
Route::put('/afp-tasas/{id}', [PayrollController::class, 'updateAFPTasa']);
Route::get('/parametros', [PayrollController::class, 'getParametros']);
Route::put('/parametros', [PayrollController::class, 'updateParametros']);

Route::get('/nominas/planillas', [PayrollController::class, 'getPlanillas']);
Route::get('/nominas/planillas/{id}', [PayrollController::class, 'getPlanillaDetalle']);
Route::post('/nominas/procesar', [PayrollController::class, 'procesarPlanilla']);
Route::get('/nominas/boletas', [PayrollController::class, 'getBoletas']);

// Módulo de Reparto de Utilidades (D.L. 892)
Route::get('/utilidades', [UtilidadController::class, 'index']);
Route::get('/utilidades/{id}', [UtilidadController::class, 'show']);
Route::post('/utilidades/procesar', [UtilidadController::class, 'procesar']);
Route::delete('/utilidades/{id}', [UtilidadController::class, 'destroy']);

// Módulo de Liquidación de Beneficios Sociales y Ceses (D.L. 728)
Route::get('/liquidaciones', [LiquidacionCeseController::class, 'index']);
Route::get('/liquidaciones/{id}', [LiquidacionCeseController::class, 'show']);
Route::post('/liquidaciones/procesar', [LiquidacionCeseController::class, 'procesar']);
Route::delete('/liquidaciones/{id}', [LiquidacionCeseController::class, 'destroy']);

// Módulo de Generación de Estructuras PLAME / T-Registro (SUNAT)
Route::post('/plame/generar', [PlameController::class, 'generar']);

// Módulo de Depósitos de CTS (D.S. 001-97-TR)
Route::get('/cts', [CtsController::class, 'index']);
Route::get('/cts/{id}', [CtsController::class, 'show']);
Route::post('/cts/procesar', [CtsController::class, 'procesar']);
Route::delete('/cts/{id}', [CtsController::class, 'destroy']);

// Módulo de Gratificaciones Legales y Bonificación 9% Ley 29351
Route::get('/gratificaciones', [GratificacionController::class, 'index']);
Route::get('/gratificaciones/{id}', [GratificacionController::class, 'show']);
Route::post('/gratificaciones/procesar', [GratificacionController::class, 'procesar']);
Route::delete('/gratificaciones/{id}', [GratificacionController::class, 'destroy']);