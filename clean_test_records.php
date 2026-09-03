<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\MarcacionAsistencia;

echo "=== INICIANDO LIMPIEZA DE REGISTROS DE PRUEBA ===\n\n";

// 1. Eliminar marcaciones de prueba fuera del periodo de Agosto (Septiembre)
$deletedSept = MarcacionAsistencia::where('fecha', '>=', '2026-09-01')->delete();
echo "✔ Marcaciones de prueba fuera de periodo (Septiembre): {$deletedSept} eliminadas.\n";

// 2. Eliminar marcaciones duplicadas/intermedias de prueba del 28/08
$deleted28 = MarcacionAsistencia::where('fecha', '2026-08-28')
    ->whereIn('hora', ['17:27:35', '17:11:53', '17:11:52', '17:08:56', '16:55:15', '16:34:01', '16:31:57'])
    ->delete();
echo "✔ Marcaciones duplicadas de prueba del 28/08: {$deleted28} eliminadas.\n";

// 3. Eliminar marcaciones intermedias de prueba del 31/08
$deleted31 = MarcacionAsistencia::where('fecha', '2026-08-31')
    ->whereIn('hora', ['07:37:52', '14:42:37'])
    ->delete();
echo "✔ Marcaciones intermedias de prueba del 31/08: {$deleted31} eliminadas.\n";

// 4. Asegurar la marcación de salida formal aprobada del 31/08 (19:45:00) para Horas Extras
$hasSalida31 = MarcacionAsistencia::where('fecha', '2026-08-31')->where('tipo', 'Salida')->exists();
if (!$hasSalida31) {
    MarcacionAsistencia::create([
        'id' => 'manual-he-20260831',
        'empleado_id' => 'emp-4',
        'dispositivo_id' => 'dev-1',
        'fecha' => '2026-08-31',
        'hora' => '19:45:00',
        'fecha_hora' => '2026-08-31 19:45:00',
        'tipo' => 'Salida',
        'metodo_verificacion' => 'Manual RRHH',
        'estado' => 'Escaneo exitoso',
        'pin' => '40869749',
        'nombre_empleado' => 'Victor Antonio Mamani Yaringaño',
    ]);
    echo "✔ Marcación de salida formal aprobada (19:45:00) del 31/08 registrada.\n";
}

$total = MarcacionAsistencia::count();
echo "\nTotal de marcaciones procesadas y validadas conservadas: {$total}\n";
echo "=== LIMPIEZA FINALIZADA CON ÉXITO ===\n";
