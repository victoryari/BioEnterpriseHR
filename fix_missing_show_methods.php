<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$controllersDir = 'c:\laragon\www\bioenterprise_api\app\Http\Controllers';

$targets = [
    'EmpleadoController' => 'Empleado',
    'SolicitudPermisoController' => 'SolicitudPermiso',
    'HorarioController' => 'Horario',
    'TurnoController' => 'Turno',
    'DiaFestivoController' => 'DiaFestivo',
    'SedeController' => 'Sede',
    'DepartamentoController' => 'Departamento',
];

foreach ($targets as $ctrlName => $modelName) {
    $filePath = "{$controllersDir}\\{$ctrlName}.php";
    if (!file_exists($filePath)) {
        echo "Archivo no encontrado: {$filePath}\n";
        continue;
    }

    $content = file_get_contents($filePath);
    if (str_contains($content, 'function show(')) {
        echo "[SKIP] {$ctrlName} ya tiene show().\n";
        continue;
    }

    $showMethod = "\n    public function show(\$id)\n    {\n        \$item = \\App\\Models\\{$modelName}::find(\$id);\n        if (!\$item) {\n            return response()->json(['message' => 'Registro no encontrado'], 404);\n        }\n        return response()->json(\$item);\n    }\n";

    // Insertar show() antes de la última llave de cierre
    $pos = strrpos($content, '}');
    if ($pos !== false) {
        $newContent = substr($content, 0, $pos) . $showMethod . "}\n";
        file_put_contents($filePath, $newContent);
        echo "[FIXED ✅] Se añadió método show() en {$ctrlName}.\n";
    }
}
