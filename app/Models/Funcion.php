<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Una función: película + sala + horario + precio.
 *
 * La regla importante del módulo vive en hayCruce():
 * dos funciones activas no pueden ocupar la misma sala al mismo tiempo.
 *
 * Ejemplo. Sala 1, el mismo día:
 *   14:00–16:00 y 15:00–17:00 se cruzan.
 *   14:00–16:00 y 16:00–18:00 no se cruzan: una termina cuando la otra empieza.
 *   14:00–16:00 en la sala 2 no estorba a la sala 1.
 */
class Funcion extends Model
{
    /**
     * Sin esta línea Laravel buscaría la tabla "funcions",
     * porque pluraliza en inglés. La tabla del proyecto se llama "funciones".
     */
    protected $table = 'funciones';
    /**
     * hora_fin está en esta lista porque el controlador la guarda,
     * aunque el formulario no la pida. El usuario escribe la hora de inicio;
     * el sistema suma la duración de la película.
     *
     * @var list<string>
     */
    protected $fillable = [
        'pelicula_id',
        'sala_id',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'precio',
        'estado',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'estado' => 'boolean',
            'fecha' => 'date:Y-m-d',
            'precio' => 'decimal:2',
        ];
    }

    public function pelicula(): BelongsTo
    {
        return $this->belongsTo(Pelicula::class);
    }

    public function sala(): BelongsTo
    {
        return $this->belongsTo(Sala::class);
    }

    /**
     * Deja la hora siempre como 14:00:00.
     * El formulario manda 14:00 y la base de datos guarda los segundos.
     * Comparar las dos formas sin igualarlas puede marcar un cruce falso.
     */
    public static function normalizarHora(string $hora): string
    {
        $hora = trim($hora);

        if (preg_match('/^\d{2}:\d{2}$/', $hora) === 1) {
            return $hora.':00';
        }

        return $hora;
    }

    /**
     * Suma la duración a la hora de inicio.
     * Devuelve null si la función terminaría al día siguiente.
     * En esta versión de clase, una función tiene que empezar y terminar el mismo día.
     */
    public static function calcularHoraFin(string $horaInicio, int $duracionMinutos): ?string
    {
        $hora = static::normalizarHora($horaInicio);

        try {
            $inicio = Carbon::createFromFormat('H:i:s', $hora);
        } catch (\Throwable) {
            return null;
        }

        if (! $inicio) {
            return null;
        }

        $fin = $inicio->copy()->addMinutes($duracionMinutos);

        if ($fin->toDateString() !== $inicio->toDateString()) {
            return null;
        }

        return $fin->format('H:i:s');
    }

    /**
     * ¿Ya hay otra función activa en esa sala que se cruce con este horario?
     *
     * Dos rangos se cruzan cuando uno empieza antes de que el otro termine
     * y termina después de que el otro empiece:
     *
     *   existente.inicio < nuevo.fin  Y  existente.fin > nuevo.inicio
     *
     * $ignorarId sirve al editar: la función no debe chocarse consigo misma.
     * Las funciones inactivas no ocupan la sala.
     */
    public static function hayCruce(
        int $salaId,
        string $fecha,
        string $horaInicio,
        string $horaFin,
        ?int $ignorarId = null,
    ): bool {
        $horaInicio = static::normalizarHora($horaInicio);
        $horaFin = static::normalizarHora($horaFin);

        return static::query()
            ->where('sala_id', $salaId)
            ->whereDate('fecha', $fecha)
            ->where('estado', true)
            ->when(
                $ignorarId !== null,
                fn ($query) => $query->whereKeyNot($ignorarId),
            )
            ->where('hora_inicio', '<', $horaFin)
            ->where('hora_fin', '>', $horaInicio)
            ->exists();
    }
}
