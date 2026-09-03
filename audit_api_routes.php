<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Route;

echo "=== AUDITORÍA DE RUTAS Y CONTROLADORES LARAVEL API ===\n\n";

$routes = Route::getRoutes();
$issues = [];
$tested = 0;

foreach ($routes as $route) {
    $uri = $route->uri();
    if (!str_starts_with($uri, 'api')) continue;

    $methods = implode('|', array_diff($route->methods(), ['HEAD']));
    $action = $route->getActionName();

    if ($action === 'Closure') {
        echo "[OK] {$methods} {$uri} -> Closure\n";
        continue;
    }

    if (str_contains($action, '@')) {
        list($controllerClass, $method) = explode('@', $action);
        $tested++;

        if (!class_exists($controllerClass)) {
            echo "[ERROR] {$methods} {$uri} -> Clase no existe: {$controllerClass}\n";
            $issues[] = "Controlador no existe: {$controllerClass}";
        } elseif (!method_exists($controllerClass, $method)) {
            echo "[MISSING METHOD ❌] {$methods} {$uri} -> {$controllerClass}@{$method}\n";
            $issues[] = "Método faltante: {$controllerClass}@{$method}";
        } else {
            echo "[OK ✅] {$methods} {$uri} -> {$controllerClass}@{$method}\n";
        }
    }
}

echo "\n=== RESUMEN AUDITORÍA API ===";
echo "\nTotal rutas API probadas: {$tested}";
echo "\nProblemas detectados: " . count($issues) . "\n";
foreach ($issues as $iss) {
    echo " 🔴 {$iss}\n";
}
