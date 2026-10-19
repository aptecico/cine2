<?php

namespace App\Http\Controllers;

use App\Http\Requests\FuncionRequest;
use App\Models\Funcion;
use App\Models\Pelicula;
use App\Models\Sala;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CRUD de la programación.
 *
 * Guardar una función es distinto de guardar una película:
 * hora_fin no viene del formulario. FuncionRequest la calcula y,
 * si el horario se cruza con otro en la misma sala, no deja seguir.
 */
class FuncionController extends Controller
{
    public function index(Request $request): Response
    {
        $buscar = $request->string('buscar')->trim()->toString();
        $fecha = $request->string('fecha')->toString();
        $salaId = $request->string('sala_id')->toString();
        $periodo = $request->string('periodo')->toString() ?: 'proximas';

        $funciones = Funcion::query()
            ->with(['pelicula', 'sala'])
            ->when($buscar !== '', function ($query) use ($buscar) {
                $query->whereHas('pelicula', function ($query) use ($buscar) {
                    $query->where('titulo', 'like', "%{$buscar}%");
                });
            })
            ->when($salaId !== '', fn ($query) => $query->where('sala_id', $salaId))
            ->when($fecha !== '', fn ($query) => $query->whereDate('fecha', $fecha))
            // Si eligieron un día exacto, ese filtro manda.
            // Si no, "próximas" esconde el pasado y "hoy" deja solo el día actual.
            ->when($fecha === '' && $periodo === 'hoy', fn ($query) => $query->whereDate('fecha', today()))
            ->when($fecha === '' && $periodo === 'proximas', fn ($query) => $query->whereDate('fecha', '>=', today()))
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('funciones/index', [
            'funciones' => $funciones,
            'salas' => Sala::query()->orderBy('nombre')->get(['id', 'nombre']),
            'filtros' => [
                'buscar' => $buscar,
                'fecha' => $fecha,
                'sala_id' => $salaId,
                'periodo' => $periodo,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('funciones/create', $this->opcionesDelFormulario());
    }

    public function store(FuncionRequest $request): RedirectResponse
    {
        Funcion::query()->create($this->datosParaGuardar($request));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Función programada.',
        ]);

        return to_route('funciones.index');
    }

    public function show(Funcion $funcion): Response
    {
        $funcion->load(['pelicula', 'sala']);

        return Inertia::render('funciones/show', [
            'funcion' => $funcion,
            'clasificaciones' => Pelicula::CLASIFICACIONES,
        ]);
    }

    public function edit(Funcion $funcion): Response
    {
        $funcion->load(['pelicula', 'sala']);

        return Inertia::render('funciones/edit', [
            'funcion' => $funcion,
            ...$this->opcionesDelFormulario($funcion),
        ]);
    }

    public function update(FuncionRequest $request, Funcion $funcion): RedirectResponse
    {
        $funcion->update($this->datosParaGuardar($request));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Función actualizada.',
        ]);

        return to_route('funciones.show', $funcion);
    }

    public function destroy(Funcion $funcion): RedirectResponse
    {
        $funcion->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Función eliminada. La película y la sala siguen guardadas.',
        ]);

        return to_route('funciones.index');
    }

    /**
     * Activar también revisa el horario: mientras estaba apagada,
     * otra función pudo ocupar esa sala.
     */
    public function toggleEstado(Funcion $funcion): RedirectResponse
    {
        $activar = ! $funcion->estado;

        if ($activar && Funcion::hayCruce(
            $funcion->sala_id,
            $funcion->fecha->toDateString(),
            (string) $funcion->hora_inicio,
            (string) $funcion->hora_fin,
            $funcion->id,
        )) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'No se puede activar: la sala ya tiene otra función en ese horario.',
            ]);

            return back();
        }

        $funcion->update(['estado' => $activar]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $activar
                ? 'Función activada.'
                : 'Función desactivada. La sala queda libre en ese horario.',
        ]);

        return back();
    }

    /**
     * Películas y salas que el formulario puede ofrecer.
     * Al editar, incluye la actual aunque esté inactiva, para que no desaparezca del select.
     *
     * @return array{peliculas: mixed, salas: mixed}
     */
    private function opcionesDelFormulario(?Funcion $funcion = null): array
    {
        return [
            'peliculas' => Pelicula::query()
                ->where(function ($query) use ($funcion) {
                    $query->where('estado', true);

                    if ($funcion) {
                        $query->orWhere('id', $funcion->pelicula_id);
                    }
                })
                ->orderBy('titulo')
                ->get(['id', 'titulo', 'duracion_minutos', 'estado']),
            'salas' => Sala::query()
                ->where(function ($query) use ($funcion) {
                    $query->where('estado', true);

                    if ($funcion) {
                        $query->orWhere('id', $funcion->sala_id);
                    }
                })
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'capacidad', 'estado']),
        ];
    }

    /**
     * Junta lo que escribió el usuario con la hora de fin que calculó la validación.
     *
     * @return array<string, mixed>
     */
    private function datosParaGuardar(FuncionRequest $request): array
    {
        return [
            ...$request->validated(),
            'hora_inicio' => Funcion::normalizarHora((string) $request->input('hora_inicio')),
            'hora_fin' => (string) $request->input('hora_fin'),
            'estado' => $request->boolean('estado'),
        ];
    }
}
