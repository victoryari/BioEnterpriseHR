<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Usuario::updateOrCreate(
            ['correo' => 'admin@carmelita.pe'],
            [
                'nombre' => 'Super Administrador',
                'clave_hash' => Hash::make('admin123'),
                'rol' => 'admin',
                'estado' => 'Activo',
            ]
        );

        Usuario::updateOrCreate(
            ['correo' => 'rrhh@carmelita.pe'],
            [
                'nombre' => 'Gestor de Recursos Humanos',
                'clave_hash' => Hash::make('rrhh123'),
                'rol' => 'gerente_rrhh',
                'estado' => 'Activo',
            ]
        );

        Usuario::updateOrCreate(
            ['correo' => 'supervisor@carmelita.pe'],
            [
                'nombre' => 'Supervisor de Sede Lima',
                'clave_hash' => Hash::make('super123'),
                'rol' => 'supervisor',
                'estado' => 'Activo',
            ]
        );
    }
}

