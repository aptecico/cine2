<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Una sala del cine.
 *
 * No guarda las películas: solo el lugar y su cupo.
 * Las funciones son las que dicen "esta película, en esta sala, a esta hora".
 */
class Sala extends Model
{
    protected $table = 'salas';
    /**
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'capacidad',
        'estado',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'estado' => 'boolean',
            'capacidad' => 'integer',
        ];
    }

    public function scopeActivas($query)
    {
        return $query->where('estado', true);
    }

    public function funciones(): HasMany
    {
        return $this->hasMany(Funcion::class);
    }
}
