<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\PayrollController;
use Illuminate\Http\Request;

$ctrl = new PayrollController();
$req = new Request(['periodo' => '2026-08', 'empresa' => 'Grupo Chemmer Perú S.A.C.']);
$res = $ctrl->procesarPlanilla($req);

echo "Resultado procesarPlanilla para Grupo Chemmer:\n";
print_r($res->getData());
