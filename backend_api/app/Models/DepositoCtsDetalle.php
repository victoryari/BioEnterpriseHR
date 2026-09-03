<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DepositoCtsDetalle extends Model
{
    protected $table = 'depositos_cts_detalles';
    public $incrementing = false;
    protected $keyType = 'string';
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'id',
        'cts_id',
        'empleado_id',
        'nombre_empleado',
        'numero_documento',
        'cargo',
        'fecha_ingreso',
        'sueldo_basico',
        'asignacion_familiar',
        'sexto_gratificacion',
        'remuneracion_computable',
        'meses_laborados',
        'dias_laborados',
        'monto_cts_depositado',
        'banco_cts',
        'numero_cuenta_cts',
        'moneda',
    ];

    public function deposito()
    {
        return $this->belongsTo(DepositoCts::class, 'cts_id', 'id');
    }
}