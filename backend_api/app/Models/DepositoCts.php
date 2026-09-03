<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DepositoCts extends Model
{
    protected $table = 'depositos_cts';
    public $incrementing = false;
    protected $keyType = 'string';
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'id',
        'periodo_semestral',
        'empresa',
        'conteo_trabajadores',
        'monto_total_depositado',
        'estado',
    ];

    public function detalles()
    {
        return $this->hasMany(DepositoCtsDetalle::class, 'cts_id', 'id');
    }
}