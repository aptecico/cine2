<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Crea un usuario de práctica y el catálogo de ejemplo.
     *
     * Correo:    test@example.com
     * Contraseña: password
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Estudiante',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        $this->call(CineSeeder::class);
    }
}
