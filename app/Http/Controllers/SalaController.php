<?php

namespace App\Http\Controllers;

use App\Http\Requests\SalaRequest;
use App\Models\Sala;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CRUD de salas.
 *
 * Es el mismo recorrido que PeliculaController: listar, crear, ver, editar,
 * actualizar, eliminar y cambiar el estado. Cambia el contenido, no el camino.
 */
class SalaController extends Controller
{
    public function index(Request $request): Response
    {
        $buscar = $request->string('buscar')->trim()->toString();
        $estado = $request->string('estado')->toString();

        $salas = Sala::query()
            ->withCount('funciones')
            ->when($buscar !== '', fn ($query) => $query->where('nombre', 'like', "%{$buscar}%"))
            ->when($estado === 'activas', fn ($query) => $query->where('estado', true))
            ->when($estado === 'inactivas', fn ($query) => $query->where('estado', false))
            ->orderBy('nombre')
            ->paginate(8)
            ->withQueryString();

        return Inertia::render('salas/index', [
            'salas' => $salas,
            'filtros' => [
                'buscar' => $buscar,
                'estado' => $estado,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('salas/create');
    }

    public function store(SalaRequest $request): RedirectResponse
    {
        Sala::query()->create([
            ...$request->validated(),
            'estado' => $request->boolean('estado'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Sala creada.',
        ]);

        return to_route('salas.index');
    }

    public function show(Sala $sala): Response
    {
        $sala->loadCount('funciones');
        $sala->load(['funciones' => function ($query) {
            $query->with('pelicula')->orderByDesc('fecha')->orderBy('hora_inicio')->limit(8);
        }]);

        return Inertia::render('salas/show', [
            'sala' => $sala,
        ]);
    }

    public function edit(Sala $sala): Response
    {
        return Inertia::render('salas/edit', [
            'sala' => $sala,
        ]);
    }

    public function update(SalaRequest $request, Sala $sala): RedirectResponse
    {
        $sala->update([
            ...$request->validated(),
            'estado' => $request->boolean('estado'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Sala actualizada.',
        ]);

        return to_route('salas.show', $sala);
    }

    public function destroy(Sala $sala): RedirectResponse
    {
        if ($sala->funciones()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'No se puede eliminar: tiene funciones. Desactívala si ya no se usa.',
            ]);

            return back();
        }

        try {
            $sala->delete();
        } catch (QueryException) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'No se puede eliminar porque otros registros todavía la usan.',
            ]);

            return back();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Sala eliminada.',
        ]);

        return to_route('salas.index');
    }

    public function toggleEstado(Sala $sala): RedirectResponse
    {
        $sala->update([
            'estado' => ! $sala->estado,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $sala->estado
                ? 'Sala activada.'
                : 'Sala desactivada. Ya no se pueden programar funciones nuevas.',
        ]);

        return back();
    }
}
