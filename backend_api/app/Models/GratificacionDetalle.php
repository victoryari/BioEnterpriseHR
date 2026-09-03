<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GratificacionDetalle extends Model
{
    protected $table = 'gratificaciones_detalles';
    public $incrementing = false;
    protected $keyType = 'string';
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'id',
        'gratificacion_id',
        'empleado_id',
        'nombre_empleado',
        'numero_documento',
        'cargo',
        'fecha_ingreso',
        'sueldo_basico',
        'asignacion_familiar',
        'remuneracion_computable',
        'meses_laborados',
        'monto_gratificacion',
        'monto_bonificacion_ley9',
        'descuento_ir5ta',
        'total_neto_pagar',
        'banco_abono',
        'numero_cuenta_abono',
    ];

    public function gratificacion()
    {
        return $this->belongsTo(GratificacionSemestral::class, 'gratificacion_id', 'id');
    }
}