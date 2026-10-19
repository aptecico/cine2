<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Una película del catálogo.
 *
 * La tabla se llama "peliculas". Laravel relaciona esta clase con esa tabla
 * porque el nombre del modelo, en plural y en minúsculas, coincide.
 *
 * El slug es la versión del título para una URL (El viaje de Luna -> el-viaje-de-luna).
 * No se pide en el formulario: se arma solo cada vez que cambia el título.
 */
class Pelicula extends Model
{
    /**
     * Laravel adivina el nombre de la tabla poniendo el modelo en plural.
     * Lo escribimos igual para que se vea de una vez: esta clase usa "peliculas".
     */
    protected $table = 'peliculas';
    /**
     * Géneros que el formulario puede elegir.
     * La validación usa esta misma lista, para no escribirla dos veces.
     *
     * @var list<string>
     */
    public const GENEROS = [
        'Acción',
        'Aventura',
        'Comedia',
        'Drama',
        'Terror',
        'Ciencia ficción',
        'Animación',
        'Romance',
        'Documental',
        'Suspenso',
    ];

    /**
     * Código corto => texto que ve el usuario.
     *
     * @var array<string, string>
     */
    public const CLASIFICACIONES = [
        'ATP' => 'Apta para todo público',
        '+7' => 'Mayores de 7 años',
        '+12' => 'Mayores de 12 años',
        '+15' => 'Mayores de 15 años',
        '+18' => 'Mayores de 18 años',
    ];

    /**
     * Campos que se pueden llenar de una sola vez con create() o update().
     * El id, el slug y las fechas de creación no están aquí: los maneja el sistema.
     *
     * @var list<string>
     */
    protected $fillable = [
        'titulo',
        'sinopsis',
        'imagen',
        'duracion_minutos',
        'genero',
        'clasificacion',
        'director',
        'anio',
        'fecha_estreno',
        'estado',
    ];

    /**
     * Convierte columnas de la base de datos a tipos de PHP.
     * estado llega como 1 o 0 y aquí se vuelve true o false.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'estado' => 'boolean',
            'duracion_minutos' => 'integer',
            'anio' => 'integer',
            'fecha_estreno' => 'date:Y-m-d',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Pelicula $pelicula): void {
            if ($pelicula->slug && ! $pelicula->isDirty('titulo')) {
                return;
            }

            $pelicula->slug = static::slugDisponible($pelicula->titulo, $pelicula->id);
        });
    }

    /**
     * Arma un slug único. Si "luna" ya existe, prueba "luna-2", "luna-3"...
     */
    public static function slugDisponible(string $titulo, ?int $ignorarId = null): string
    {
        $base = Str::slug($titulo);
        $base = $base !== '' ? $base : 'pelicula';
        $slug = $base;
        $contador = 2;

        while (
            static::query()
                ->where('slug', $slug)
                ->when($ignorarId, fn ($query) => $query->whereKeyNot($ignorarId))
                ->exists()
        ) {
            $slug = $base.'-'.$contador;
            $contador++;
        }

        return $slug;
    }

    /**
     * Atajo para pedir solo las películas que se pueden programar.
     * Se usa así: Pelicula::activas()->get()
     */
    public function scopeActivas($query)
    {
        return $query->where('estado', true);
    }

    /**
     * Una película tiene muchas funciones.
     * En la tabla funciones, la columna pelicula_id apunta aquí.
     */
    public function funciones(): HasMany
    {
        return $this->hasMany(Funcion::class);
    }
}
