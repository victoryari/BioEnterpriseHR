<?php
$dir = 'C:\laragon\www\bioenterprise_api\database\migrations\\';
$migrations = [

    '2026_09_07_135012_create_sedes_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('sedes', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique()->comment('Nombre de la sede');
            $table->string('ciudad', 80)->comment('Ciudad');
            $table->string('direccion', 255)->nullable()->comment('Dirección física');
            $table->boolean('activo')->default(true);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent()->useCurrentOnUpdate();
        });
    }
    public function down(): void {
        Schema::dropIfExists('sedes');
    }
};
EOT,

    '2026_09_07_135013_create_departamentos_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('departamentos', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 100)->unique();
            $table->string('descripcion', 255)->nullable();
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent()->useCurrentOnUpdate();
        });
    }
    public function down(): void {
        Schema::dropIfExists('departamentos');
    }
};
EOT,

    '2026_09_07_135014_create_empleados_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('empleados', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->enum('tipo_documento', ['DNI', 'CE', 'Pasaporte'])->default('DNI');
            $table->string('numero_documento', 15)->unique();
            $table->string('pin', 20)->unique();
            $table->string('numero_tarjeta', 30)->nullable()->unique();
            $table->boolean('tarjeta_rfid')->default(false);
            $table->boolean('biometria_huella')->default(false);
            $table->boolean('biometria_rostro')->default(false);
            $table->enum('tipo_marcado_predilecto', ['Huella', 'Tarjeta RFID', 'PIN', 'Rostro'])->default('Huella');
            $table->string('nombres', 100);
            $table->string('apellidos', 100);
            $table->string('nombre_completo', 200);
            $table->string('correo', 150)->unique();
            $table->string('telefono', 30)->nullable();
            $table->string('direccion', 255)->nullable();
            $table->string('cargo', 100);
            $table->unsignedInteger('departamento_id');
            $table->unsignedInteger('sede_id');
            $table->string('empresa', 100)->nullable();
            $table->enum('estado', ['Activo', 'Inactivo'])->default('Activo');
            $table->text('foto_url')->nullable();
            $table->unsignedTinyInteger('conteo_huellas')->default(0);
            $table->string('fecha_actualizacion_rostro', 50)->nullable();
            $table->date('fecha_ingreso')->nullable();
            $table->date('fecha_cese')->nullable();
            $table->date('fecha_nacimiento')->nullable();
            $table->decimal('sueldo_base', 10, 2)->default(1025.00);
            $table->boolean('acceso_entrada_principal')->default(true);
            $table->boolean('acceso_centro_datos')->default(false);
            $table->boolean('acceso_almacen')->default(false);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('departamento_id')->references('id')->on('departamentos')->onUpdate('cascade');
            $table->foreign('sede_id')->references('id')->on('sedes')->onUpdate('cascade');

            $table->index('pin');
            $table->index('numero_tarjeta');
            $table->index('numero_documento');
            $table->index('estado');
        });
    }
    public function down(): void {
        Schema::dropIfExists('empleados');
    }
};
EOT,

    '2026_09_07_135015_create_permisos_acceso_puertas_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('permisos_acceso_puertas', function (Blueprint $table) {
            $table->string('empleado_id', 36)->primary();
            $table->boolean('entrada_principal')->default(true);
            $table->boolean('centro_datos')->default(false);
            $table->boolean('almacen')->default(false);
            $table->timestamp('actualizado_en')->useCurrent()->useCurrentOnUpdate();
            $table->foreign('empleado_id')->references('id')->on('empleados')->onDelete('cascade')->onUpdate('cascade');
        });
    }
    public function down(): void {
        Schema::dropIfExists('permisos_acceso_puertas');
    }
};
EOT,

    '2026_09_07_135016_create_usuarios_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->increments('id');
            $table->string('empleado_id', 36)->nullable();
            $table->string('nombre', 150);
            $table->string('correo', 150)->unique();
            $table->string('clave_hash', 255);
            $table->enum('rol', ['admin', 'empleado', 'gerente_rrhh', 'supervisor'])->default('empleado');
            $table->enum('estado', ['Activo', 'Inactivo'])->default('Activo');
            $table->string('token_recordar', 100)->nullable();
            $table->dateTime('ultimo_login')->nullable();
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('empleado_id')->references('id')->on('empleados')->onDelete('set null')->onUpdate('cascade');
        });
    }
    public function down(): void {
        Schema::dropIfExists('usuarios');
    }
};
EOT,

    '2026_09_07_135017_create_dispositivos_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('dispositivos', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('numero_serie', 50)->unique();
            $table->string('nombre', 120);
            $table->string('ubicacion', 120);
            $table->unsignedInteger('sede_id')->nullable();
            $table->string('direccion_ip', 45);
            $table->unsignedInteger('puerto')->default(4370);
            $table->string('protocolo', 50)->default('Autónomo');
            $table->boolean('soporta_huella')->default(true);
            $table->boolean('soporta_tarjeta_rfid')->default(true);
            $table->boolean('soporta_pin')->default(true);
            $table->enum('estado', ['online', 'offline', 'error'])->default('online');
            $table->dateTime('ultimo_pulso')->nullable();
            $table->unsignedInteger('conteo_usuarios')->default(0);
            $table->unsignedInteger('conteo_registros')->default(0);
            $table->string('version_firmware', 80)->default('BioFirm v4.2.0');
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('sede_id')->references('id')->on('sedes')->onDelete('set null')->onUpdate('cascade');
            $table->index('numero_serie');
            $table->index('estado');
        });
    }
    public function down(): void {
        Schema::dropIfExists('dispositivos');
    }
};
EOT,

    '2026_09_07_135018_create_marcaciones_asistencia_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('marcaciones_asistencia', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->date('fecha');
            $table->time('hora');
            $table->dateTime('fecha_hora');
            $table->string('empleado_id', 36)->nullable();
            $table->string('nombre_empleado', 200)->default('Desconocido');
            $table->string('pin', 20)->default('----');
            $table->string('numero_tarjeta', 30)->nullable();
            $table->string('dispositivo_id', 36)->nullable();
            $table->string('nombre_dispositivo', 120);
            $table->enum('tipo', ['Entrada', 'Salida', 'Refrigerio Inicio', 'Refrigerio Fin'])->default('Entrada');
            $table->enum('estado', ['Escaneo exitoso', 'Tiempo de espera agotado', 'Sincronización', 'No reconocido'])->default('Escaneo exitoso');
            $table->enum('metodo_verificacion', ['Huella', 'Tarjeta RFID', 'PIN', 'Rostro', 'Sistema'])->default('Huella');
            $table->boolean('es_error')->default(false);
            $table->text('trama_cruda')->nullable();
            $table->timestamp('creado_en')->useCurrent();

            $table->foreign('empleado_id')->references('id')->on('empleados')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('dispositivo_id')->references('id')->on('dispositivos')->onDelete('set null')->onUpdate('cascade');

            $table->index('fecha_hora');
            $table->index('fecha');
            $table->index('empleado_id');
            $table->index('pin');
            $table->index('numero_tarjeta');
            $table->index('metodo_verificacion');
        });
    }
    public function down(): void {
        Schema::dropIfExists('marcaciones_asistencia');
    }
};
EOT,

    '2026_09_07_135019_create_solicitudes_permisos_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('solicitudes_permisos', function (Blueprint $table) {
            $table->string('id', 36)->primary();
            $table->string('empleado_id', 36)->nullable();
            $table->string('nombre_empleado', 200);
            $table->enum('tipo', ['Vacaciones', 'Descanso Médico', 'Permiso', 'Compensación']);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->text('motivo');
            $table->string('nombre_documento', 255)->nullable();
            $table->string('ruta_documento', 255)->nullable();
            $table->enum('estado', ['Aprobado', 'Pendiente', 'Rechazado'])->default('Pendiente');
            $table->unsignedInteger('revisado_por')->nullable();
            $table->text('notas_revision')->nullable();
            $table->date('fecha_solicitud');
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('empleado_id')->references('id')->on('empleados')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('revisado_por')->references('id')->on('usuarios')->onDelete('set null')->onUpdate('cascade');

            $table->index('estado');
            $table->index(['fecha_inicio', 'fecha_fin']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('solicitudes_permisos');
    }
};
EOT,

    '2026_09_07_135020_create_dias_festivos_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('dias_festivos', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 150);
            $table->date('fecha_festivo')->unique();
            $table->boolean('es_recurrente')->default(true);
            $table->timestamp('creado_en')->useCurrent();
        });
    }
    public function down(): void {
        Schema::dropIfExists('dias_festivos');
    }
};
EOT,

    '2026_09_07_135021_create_historial_desactivaciones_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('historial_desactivaciones', function (Blueprint $table) {
            $table->increments('id');
            $table->string('empleado_id', 36);
            $table->enum('accion', ['BAJA', 'REACTIVACION']);
            $table->string('motivo', 255)->nullable();
            $table->unsignedInteger('realizado_por')->nullable();
            $table->timestamp('creado_en')->useCurrent();

            $table->foreign('empleado_id')->references('id')->on('empleados')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('realizado_por')->references('id')->on('usuarios')->onDelete('set null')->onUpdate('cascade');
        });
    }
    public function down(): void {
        Schema::dropIfExists('historial_desactivaciones');
    }
};
EOT,

    '2026_09_07_135022_create_comandos_dispositivos_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('comandos_dispositivos', function (Blueprint $table) {
            $table->increments('id');
            $table->string('dispositivo_id', 36);
            $table->enum('tipo_comando', ['ENVIAR_USUARIO', 'ENVIAR_TARJETA', 'ELIMINAR_USUARIO', 'REINICIAR', 'SINCRONIZAR_HORA', 'LIMPIAR_LOGS']);
            $table->text('carga_util')->nullable();
            $table->enum('estado', ['Pendiente', 'Transmitido', 'Ejecutado', 'Error'])->default('Pendiente');
            $table->timestamp('creado_en')->useCurrent();
            $table->dateTime('ejecutado_en')->nullable();

            $table->foreign('dispositivo_id')->references('id')->on('dispositivos')->onDelete('cascade')->onUpdate('cascade');
            $table->index('estado');
        });
    }
    public function down(): void {
        Schema::dropIfExists('comandos_dispositivos');
    }
};
EOT,

    '2026_09_07_135023_create_horarios_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('horarios', function (Blueprint $table) {
            $table->string('id', 30)->primary();
            $table->string('nombre', 100);
            $table->time('hora_entrada');
            $table->time('hora_salida');
            $table->integer('minutos_tolerancia')->default(10);
            $table->time('inicio_refrigerio')->nullable();
            $table->time('fin_refrigerio')->nullable();
            $table->integer('minutos_refrigerio')->default(60);
            $table->boolean('marcado_refrigerio_obligatorio')->default(false);
            $table->string('color_tag', 20)->default('#3B82F6');
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent()->useCurrentOnUpdate();
        });
    }
    public function down(): void {
        Schema::dropIfExists('horarios');
    }
};
EOT,

    '2026_09_07_135024_create_turnos_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('turnos', function (Blueprint $table) {
            $table->string('id', 30)->primary();
            $table->string('nombre', 100);
            $table->enum('tipo', ['Fijo', 'Rotativo', 'Flexible'])->default('Fijo');
            $table->string('descripcion', 255)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('actualizado_en')->useCurrent()->useCurrentOnUpdate();
        });
    }
    public function down(): void {
        Schema::dropIfExists('turnos');
    }
};
EOT,

    '2026_09_07_135025_create_turnos_dias_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('turnos_dias', function (Blueprint $table) {
            $table->increments('id');
            $table->string('turno_id', 30);
            $table->tinyInteger('dia_semana');
            $table->string('nombre_dia', 20);
            $table->string('horario_id', 30)->nullable();
            $table->boolean('es_laborable')->default(true);

            $table->foreign('turno_id')->references('id')->on('turnos')->onDelete('cascade');
            $table->foreign('horario_id')->references('id')->on('horarios')->onDelete('set null');
        });
    }
    public function down(): void {
        Schema::dropIfExists('turnos_dias');
    }
};
EOT,

    '2026_09_07_135026_create_asignaciones_turnos_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('asignaciones_turnos', function (Blueprint $table) {
            $table->string('id', 30)->primary();
            $table->string('empleado_id', 36);
            $table->string('turno_id', 30);
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->timestamp('creado_en')->useCurrent();

            $table->foreign('empleado_id')->references('id')->on('empleados')->onDelete('cascade');
            $table->foreign('turno_id')->references('id')->on('turnos')->onDelete('cascade');
        });
    }
    public function down(): void {
        Schema::dropIfExists('asignaciones_turnos');
    }
};
EOT,

    '2026_09_07_135027_create_reglas_asistencia_empresa_table.php' => <<<'EOT'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('reglas_asistencia_empresa', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('minutos_gracia_ingreso')->default(10);
            $table->integer('tolerancia_maxima_minutos')->default(45);
            $table->decimal('sobretasa_he_primeras_dos', 5, 2)->default(25.00);
            $table->decimal('sobretasa_he_restantes', 5, 2)->default(35.00);
            $table->decimal('sobretasa_feriado_domingo', 5, 2)->default(100.00);
            $table->integer('dias_vacaciones_anuales')->default(30);
            $table->integer('minimo_dias_bloque_vacaciones')->default(7);
            $table->integer('minimo_dias_fraccionados')->default(1);
            $table->time('inicio_jornada_nocturna')->default('22:00:00');
            $table->time('fin_jornada_nocturna')->default('06:00:00');
            $table->decimal('sobretasa_nocturna', 5, 2)->default(35.00);
            $table->decimal('remuneracion_minima_vital', 10, 2)->default(1130.00);
            $table->decimal('piso_minimo_nocturno', 10, 2)->default(1525.50);
            $table->timestamp('actualizado_en')->useCurrent()->useCurrentOnUpdate();
        });
    }
    public function down(): void {
        Schema::dropIfExists('reglas_asistencia_empresa');
    }
};
EOT

];

foreach($migrations as $file => $content) {
    file_put_contents($dir . $file, $content);
    echo "Written $file\n";
}
