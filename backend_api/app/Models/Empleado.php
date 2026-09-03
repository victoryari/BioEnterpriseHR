<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empleado extends Model
{
    protected $table = 'empleados';

    public $incrementing = false;
    protected $keyType = 'string';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'id',
        'tipo_documento',
        'numero_documento',
        'pin',
        'numero_tarjeta',
        'tarjeta_rfid',
        'biometria_huella',
        'biometria_rostro',
        'tipo_marcado_predilecto',
        'nombres',
        'apellidos',
        'nombre_completo',
        'correo',
        'telefono',
        'direccion',
        'cargo',
        'departamento_id',
        'sede_id',
        'empresa',
        'estado',
        'foto_url',
        'conteo_huellas',
        'fecha_actualizacion_rostro',
        'fecha_ingreso',
        'fecha_cese',
        'fecha_nacimiento',
        'sueldo_base',
        'acceso_entrada_principal',
        'acceso_centro_datos',
        'acceso_almacen',
    ];

    protected $casts = [
        'tarjeta_rfid' => 'boolean',
        'biometria_huella' => 'boolean',
        'biometria_rostro' => 'boolean',
        'conteo_huellas' => 'integer',
        'sueldo_base' => 'decimal:2',
        'acceso_entrada_principal' => 'boolean',
        'acceso_centro_datos' => 'boolean',
        'acceso_almacen' => 'boolean',
        'departamento_id' => 'integer',
        'sede_id' => 'integer',
    ];

    public function sede()
    {
        return $this->belongsTo(Sede::class, 'sede_id');
    }

    public function departamento()
    {
        return $this->belongsTo(Departamento::class, 'departamento_id');
    }
}
