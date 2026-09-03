<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiquidacionCese extends Model
{
    protected $table = 'liquidaciones_cese';
    public $incrementing = false;
    protected $keyType = 'string';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'id',
        'empleado_id',
        'nombre_empleado',
        'numero_documento',
        'empresa',
        'cargo',
        'fecha_ingreso',
        'fecha_cese',
        'tiempo_servicio_texto',
        'motivo_cese',
        'sueldo_base_cese',
        'dias_laborados_mes_cese',
        'monto_boleta_trunca',
        'monto_cts_trunca',
        'monto_vacaciones_truncas',
        'monto_gratificacion_trunca',
        'monto_bonificacion_ley',
        'monto_indemnizacion',
        'total_bruto_lbs',
        'descuento_ir5ta',
        'total_neto_lbs',
        'banco_cts',
        'numero_cuenta_cts',
        'estado',
    ];

    public function empleado()
    {
        return $this->belongsTo(Empleado::class, 'empleado_id', 'id');
    }
}