<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Crea la tabla de funciones (la programación del cine).
 *
 * Una función une tres datos: qué película, en qué sala y a qué hora.
 * hora_fin no la escribe el usuario: se calcula con la duración de la película.
 * Así podemos preguntar si dos funciones se cruzan en la misma sala.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funciones', function (Blueprint $table) {
            $table->id();

            // restrictOnDelete: la base de datos rechaza borrar una película o sala
            // que todavía tenga funciones. El controlador explica el motivo antes.
            $table->foreignId('pelicula_id')->constrained('peliculas')->restrictOnDelete();
            $table->foreignId('sala_id')->constrained('salas')->restrictOnDelete();

            $table->date('fecha');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->decimal('precio', 8, 2);
            $table->boolean('estado')->default(true);
            $table->timestamps();

            // Esta búsqueda se repite al validar cruces: sala + día.
            $table->index(['sala_id', 'fecha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funciones');
    }
};
