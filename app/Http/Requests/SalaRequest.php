<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Revisa el nombre y la capacidad de una sala.
 * Al editar, el nombre puede repetirse solo si es el de esta misma sala.
 */
class SalaRequest extends FormRequest
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
            'nombre' => [
                'required',
                'string',
                'max:80',
                Rule::unique('salas', 'nombre')->ignore($this->route('sala')),
            ],
            'capacidad' => ['required', 'integer', 'min:1', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'Escribe el nombre de la sala.',
            'nombre.max' => 'El nombre no puede pasar de 80 caracteres.',
            'nombre.unique' => 'Ya existe una sala con ese nombre.',
            'capacidad.required' => 'Indica cuántas personas caben.',
            'capacidad.integer' => 'La capacidad debe ser un número entero.',
            'capacidad.min' => 'La sala debe caber al menos a 1 persona.',
            'capacidad.max' => 'La capacidad máxima es 2000 personas.',
        ];
    }
}
