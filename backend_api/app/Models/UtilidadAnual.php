<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UtilidadAnual extends Model
{
    protected $table = 'utilidades_anuales';
    public $incrementing = false;
    protected $keyType = 'string';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'id',
        'ejercicio_fiscal',
        'empresa',
        'renta_neta_empresa',
        'porcentaje_sector',
        'monto_total_distribuir',
        'monto_50_dias',
        'monto_50_remuneraciones',
        'total_dias_empresa',
        'total_remuneraciones_empresa',
        'factor_dias',
        'factor_remuneraciones',
        'conteo_trabajadores',
        'estado',
    ];

    public function detalles()
    {
        return $this->hasMany(UtilidadDetalle::class, 'utilidad_id', 'id');
    }
}