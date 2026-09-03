<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

if (Schema::hasColumn('movimientos_stock', 'implemento_variacion_id')) { 
    try {
        Schema::table('movimientos_stock', function($table) { 
            $table->dropForeign(['implemento_variacion_id']); 
        });
    } catch(Exception $e) {}
    try {
        Schema::table('movimientos_stock', function($table) { 
            $table->dropColumn('implemento_variacion_id'); 
        }); 
    } catch(Exception $e) {}
}

if (Schema::hasColumn('pedidos', 'implemento_variacion_id')) { 
    try {
        Schema::table('pedidos', function($table) { 
            $table->dropForeign(['implemento_variacion_id']); 
        });
    } catch(Exception $e) {}
    try {
        Schema::table('pedidos', function($table) { 
            $table->dropColumn('implemento_variacion_id'); 
        });
    } catch(Exception $e) {}
}

try { 
    Schema::dropIfExists('implemento_variaciones'); 
} catch(Exception $e) {
    echo "Error dropping table: " . $e->getMessage() . "\n";
}

echo "Cleaned up properly";
