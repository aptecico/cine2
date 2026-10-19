<?php

namespace App\Http\Requests;

use App\Models\Funcion;
use App\Models\Pelicula;
use App\Models\Sala;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * Revisa una función antes de guardarla.
 *
 * Además de los campos sueltos, comprueba tres reglas del cine:
 * 1. La película y la sala tienen que estar activas.
 * 2. La función no puede pasar de medianoche.
 * 3. No puede cruzarse con otra función activa de la misma sala.
 */
class FuncionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'pelicula_id' => ['required', 'integer', 'exists:peliculas,id'],
            'sala_id' => ['required', 'integer', 'exists:salas,id'],
            'fecha' => ['required', 'date'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'precio' => ['required', 'numeric', 'min:0', 'max:999999.99'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pelicula_id.required' => 'Elige una película.',
            'pelicula_id.exists' => 'Esa película no existe.',
            'sala_id.required' => 'Elige una sala.',
            'sala_id.exists' => 'Esa sala no existe.',
            'fecha.required' => 'Elige la fecha.',
            'fecha.date' => 'La fecha no es válida.',
            'hora_inicio.required' => 'Elige la hora de inicio.',
            'hora_inicio.date_format' => 'La hora debe tener el formato HH:MM.',
            'precio.required' => 'Escribe el precio de la boleta.',
            'precio.numeric' => 'El precio debe ser un número.',
            'precio.min' => 'El precio no puede ser negativo.',
            'precio.max' => 'El precio es demasiado alto.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $pelicula = Pelicula::query()->find($this->integer('pelicula_id'));
            $sala = Sala::query()->find($this->integer('sala_id'));

            if (! $pelicula || ! $sala) {
                return;
            }

            if (! $pelicula->estado) {
                $validator->errors()->add(
                    'pelicula_id',
                    'Esa película está inactiva. Actívala antes de programarla.',
                );
            }

            if (! $sala->estado) {
                $validator->errors()->add(
                    'sala_id',
                    'Esa sala está inactiva. Actívala antes de programar.',
                );
            }

            $horaFin = Funcion::calcularHoraFin(
                (string) $this->input('hora_inicio'),
                $pelicula->duracion_minutos,
            );

            if ($horaFin === null) {
                $validator->errors()->add(
                    'hora_inicio',
                    'La función pasaría de medianoche. Elige una hora más temprana o una película más corta.',
                );

                return;
            }

            // El horario calculado viaja con la petición para que el controlador lo guarde.
            $this->merge(['hora_fin' => $horaFin]);

            $quedaraActiva = $this->boolean('estado');

            if (! $quedaraActiva) {
                return;
            }

            $funcion = $this->route('funcion');
            $ignorarId = $funcion instanceof Funcion ? $funcion->id : null;

            if (Funcion::hayCruce(
                $sala->id,
                (string) $this->input('fecha'),
                (string) $this->input('hora_inicio'),
                $horaFin,
                $ignorarId,
            )) {
                $validator->errors()->add(
                    'hora_inicio',
                    'Esa sala ya tiene una función activa en ese horario.',
                );
            }
        });
    }
}
