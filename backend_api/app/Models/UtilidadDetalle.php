<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UtilidadDetalle extends Model
{
    protected $table = 'utilidades_detalles';
    public $incrementing = false;
    protected $keyType = 'string';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'id',
        'utilidad_id',
        'empleado_id',
        'nombre_empleado',
        'numero_documento',
        'cargo',
        'dias_laborados_trabajador',
        'monto_por_dias',
        'remuneracion_anual_trabajador',
        'monto_por_remuneracion',
        'utilidad_bruta',
        'excedente_tope_18_sueldos',
        'utilidad_computable',
        'descuento_ir5ta',
        'utilidad_neta_pagar',
        'banco_abono',
        'numero_cuenta_abono',
    ];

    public function cabecera()
    {
        return $this->belongsTo(UtilidadAnual::class, 'utilidad_id', 'id');
    }
}