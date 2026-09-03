<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$marcaciones = App\Models\MarcacionAsistencia::orderBy('fecha_hora', 'desc')->get();
echo "Total marcaciones en DB: " . $marcaciones->count() . "\n\n";

foreach ($marcaciones as $m) {
    echo "{$m->fecha} {$m->hora} | pin={$m->pin} | emp={$m->empleado_id} | metodo={$m->metodo_verificacion} | id=" . substr($m->id, 0, 40) . "\n";
}

echo "\n=== Solo registros del 2026-08-31 ===\n";
$hoy = App\Models\MarcacionAsistencia::where('fecha', '2026-08-31')->get();
echo "Total para hoy: " . $hoy->count() . "\n";
foreach ($hoy as $m) {
    echo "  {$m->fecha_hora} | pin={$m->pin} | emp={$m->empleado_id} | metodo={$m->metodo_verificacion}\n";
}
