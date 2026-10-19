<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Crea la tabla de salas.
 *
 * Una sala es el lugar físico donde se proyecta una película.
 * Guardamos su nombre, cuántas personas caben y si está disponible.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 80)->unique();
            $table->unsignedSmallInteger('capacidad');
            // true = se pueden programar funciones. false = la sala sigue existiendo, pero no se usa.
            $table->boolean('estado')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salas');
    }
};
