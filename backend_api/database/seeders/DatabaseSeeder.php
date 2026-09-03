<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Usuario::firstOrCreate(
            ['email' => 'admin@sistema.com'],
            [
                'nombre' => 'Administrador',
                'password' => Hash::make('admin123'),
                'rol' => 'admin',
            ]
        );

        Usuario::firstOrCreate(
            ['email' => 'jurbano@grupocarmelita.com'],
            [
                'nombre' => 'Jefte Urbano',
                'password' => Hash::make('operario123'),
                'rol' => 'operario',
            ]
        );

        Usuario::firstOrCreate(
            ['email' => 'almacen@sistema.com'],
            [
                'nombre' => 'Almacenista',
                'password' => Hash::make('almacen123'),
                'rol' => 'almacen',
            ]
        );

        Usuario::firstOrCreate(
            ['email' => 'aprobador@sistema.com'],
            [
                'nombre' => 'Aprobador',
                'password' => Hash::make('aprobador123'),
                'rol' => 'aprobador',
            ]
        );
    }
}
