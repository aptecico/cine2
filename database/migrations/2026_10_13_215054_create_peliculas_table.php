<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('peliculas', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 150);
            $table->string('slug', 180)->unique();
            $table->text('sinopsis');
            $table->string('imagen')->nullable();
            $table->unsignedSmallInteger('duracion_minutos');
            $table->string('genero', 50);
            $table->string('clasificacion', 10);
            $table->string('director', 120)->nullable();
            $table->unsignedSmallInteger('anio')->nullable();
            $table->date('fecha_estreno')->nullable();
            $table->boolean('estado')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peliculas');
    }
};
