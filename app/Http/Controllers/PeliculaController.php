<?php

namespace App\Http\Controllers;

use App\Http\Requests\PeliculaRequest;
use App\Models\Pelicula;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CRUD de películas.
 *
 * Cada método es una letra de CRUD, con los nombres que Laravel espera:
 *   index   -> Read, el listado
 *   create  -> muestra el formulario vacío
 *   store   -> Create, guarda
 *   show    -> Read, un solo registro
 *   edit    -> muestra el formulario lleno
 *   update  -> Update
 *   destroy -> Delete
 *
 * toggleEstado no es una letra del CRUD clásico: desactiva sin borrar.
 * Desactivar deja la película en la base de datos. Eliminar la quita.
 */
class PeliculaController extends Controller
{
    public function index(Request $request): Response
    {
        $buscar = $request->string('buscar')->trim()->toString();
        $genero = $request->string('genero')->toString();
        $estado = $request->string('estado')->toString();

        $peliculas = Pelicula::query()
            ->withCount('funciones')
            ->when($buscar !== '', function ($query) use ($buscar) {
                // El where de adentro agrupa los OR.
                // Si no, un OR podría saltarse el filtro de género o estado.
                $query->where(function ($query) use ($buscar) {
                    $query->where('titulo', 'like', "%{$buscar}%")
                        ->orWhere('sinopsis', 'like', "%{$buscar}%")
                        ->orWhere('director', 'like', "%{$buscar}%");
                });
            })
            ->when($genero !== '', fn ($query) => $query->where('genero', $genero))
            ->when($estado === 'activas', fn ($query) => $query->where('estado', true))
            ->when($estado === 'inactivas', fn ($query) => $query->where('estado', false))
            ->orderBy('titulo')
            ->paginate(8)
            ->withQueryString();

        return Inertia::render('peliculas/index', [
            'peliculas' => $peliculas,
            'generos' => Pelicula::GENEROS,
            'clasificaciones' => Pelicula::CLASIFICACIONES,
            'filtros' => [
                'buscar' => $buscar,
                'genero' => $genero,
                'estado' => $estado,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('peliculas/create', [
            'generos' => Pelicula::GENEROS,
            'clasificaciones' => Pelicula::CLASIFICACIONES,
        ]);
    }

    public function store(PeliculaRequest $request): RedirectResponse
    {
        Pelicula::query()->create([
            ...$request->validated(),
            'estado' => $request->boolean('estado'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Película registrada.',
        ]);

        return to_route('peliculas.index');
    }

    public function show(Pelicula $pelicula): Response
    {
        // Laravel busca la película por el número de la URL.
        // Si no existe, responde 404 sin que escribamos un if.
        $pelicula->loadCount('funciones');
        $pelicula->load(['funciones' => function ($query) {
            $query->with('sala')->orderByDesc('fecha')->orderBy('hora_inicio')->limit(8);
        }]);

        return Inertia::render('peliculas/show', [
            'pelicula' => $pelicula,
            'clasificaciones' => Pelicula::CLASIFICACIONES,
        ]);
    }

    public function edit(Pelicula $pelicula): Response
    {
        return Inertia::render('peliculas/edit', [
            'pelicula' => $pelicula,
            'generos' => Pelicula::GENEROS,
            'clasificaciones' => Pelicula::CLASIFICACIONES,
        ]);
    }

    public function update(PeliculaRequest $request, Pelicula $pelicula): RedirectResponse
    {
        $pelicula->update([
            ...$request->validated(),
            'estado' => $request->boolean('estado'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Película actualizada.',
        ]);

        return to_route('peliculas.show', $pelicula);
    }

    public function destroy(Pelicula $pelicula): RedirectResponse
    {
        if ($pelicula->funciones()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'No se puede eliminar: tiene funciones. Desactívala si ya no se proyecta.',
            ]);

            return back();
        }

        try {
            $pelicula->delete();
        } catch (QueryException) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'No se puede eliminar porque otros registros todavía la usan.',
            ]);

            return back();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Película eliminada.',
        ]);

        return to_route('peliculas.index');
    }

    /**
     * Cambia activa <-> inactiva. El registro no se borra.
     */
    public function toggleEstado(Pelicula $pelicula): RedirectResponse
    {
        $pelicula->update([
            'estado' => ! $pelicula->estado,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $pelicula->estado
                ? 'Película activada.'
                : 'Película desactivada. Ya no se puede programar.',
        ]);

        return back();
    }
}
