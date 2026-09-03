<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = DB::select("SHOW TABLES");
foreach ($tables as $t) {
    foreach ($t as $k => $v) {
        if (str_contains($v, 'utilidad')) {
            echo "Tabla de utilidades encontrada: {$v}\n";
            print_r(DB::table($v)->get());
        }
    }
}
