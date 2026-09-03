<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';

$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Dispositivo;
use App\Services\ZKTecoService;

$devices = Dispositivo::all();
echo "Dispositivos encontrados: " . $devices->count() . "\n";

foreach ($devices as $device) {
    echo "\n--- Sincronizando: {$device->nombre} ({$device->direccion_ip}:{$device->puerto}) ---\n";
    $result = ZKTecoService::syncDeviceHardware($device);
    echo "  Success: " . ($result['success'] ? 'YES' : 'NO') . "\n";
    echo "  Message: " . $result['message'] . "\n";
    echo "  Logs synced: " . $result['logs_synced'] . "\n";
    echo "  Total logs: " . ($result['total_logs'] ?? 'N/A') . "\n";
}

// Verificar marcaciones guardadas
$count = \App\Models\MarcacionAsistencia::count();
echo "\n=== TOTAL MARCACIONES EN DB: $count ===\n";

$marcaciones = \App\Models\MarcacionAsistencia::orderBy('fecha_hora', 'desc')->take(10)->get();
foreach ($marcaciones as $m) {
    echo "  [{$m->fecha_hora}] PIN={$m->pin} Empleado={$m->nombre_empleado} (ID={$m->empleado_id}) Tipo={$m->tipo}\n";
}
