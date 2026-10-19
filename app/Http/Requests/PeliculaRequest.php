<?php

namespace App\Http\Requests;

use App\Models\Pelicula;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Revisa los datos de una película antes de que el controlador los guarde.
 *
 * El formulario del navegador también marca campos obligatorios,
 * pero eso se puede saltar. Esta clase es la revisión que sí manda.
 * Sirve para crear y para editar: las reglas son las mismas.
 */
class PeliculaRequest extends FormRequest
{
    /**
     * La ruta ya exige haber iniciado sesión. Aquí solo miramos los datos.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Un campo vacío llega como "" y la regla "nullable" no lo aceptaría
     * si además pedimos que sea una URL o un número. Lo convertimos en null.
     */
    protected function prepareForValidation(): void
    {
        foreach (['director', 'anio', 'fecha_estreno', 'imagen'] as $campo) {
            if (! $this->filled($campo)) {
                $this->merge([$campo => null]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:150'],
            'sinopsis' => ['required', 'string', 'max:5000'],
            'duracion_minutos' => ['required', 'integer', 'min:1', 'max:400'],
            'genero' => ['required', Rule::in(Pelicula::GENEROS)],
            'clasificacion' => ['required', Rule::in(array_keys(Pelicula::CLASIFICACIONES))],
            'director' => ['nullable', 'string', 'max:120'],
            'anio' => ['nullable', 'integer', 'min:1888', 'max:'.(date('Y') + 2)],
            'fecha_estreno' => ['nullable', 'date'],
            'imagen' => ['nullable', 'url', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'titulo.required' => 'Escribe el título de la película.',
            'titulo.max' => 'El título no puede pasar de 150 caracteres.',
            'sinopsis.required' => 'Escribe una sinopsis.',
            'sinopsis.max' => 'La sinopsis no puede pasar de 5000 caracteres.',
            'duracion_minutos.required' => 'Indica la duración en minutos.',
            'duracion_minutos.integer' => 'La duración debe ser un número entero de minutos.',
            'duracion_minutos.min' => 'La duración mínima es 1 minuto.',
            'duracion_minutos.max' => 'La duración máxima es 400 minutos.',
            'genero.required' => 'Elige un género.',
            'genero.in' => 'Ese género no está en la lista.',
            'clasificacion.required' => 'Elige una clasificación.',
            'clasificacion.in' => 'Esa clasificación no está en la lista.',
            'anio.integer' => 'El año debe ser un número.',
            'anio.min' => 'El año es demasiado antiguo.',
            'anio.max' => 'El año es demasiado lejano.',
            'fecha_estreno.date' => 'La fecha de estreno no es válida.',
            'imagen.url' => 'La imagen debe ser una dirección web (https://...).',
        ];
    }
}
