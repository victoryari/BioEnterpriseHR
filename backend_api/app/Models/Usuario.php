<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'usuarios';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'empleado_id',
        'nombre',
        'correo',
        'clave_hash',
        'rol',
        'estado',
        'foto',
        'ultimo_login',
    ];

    protected $hidden = [
        'clave_hash',
        'token_recordar',
    ];

    public function getAuthPassword()
    {
        return $this->clave_hash;
    }
}
