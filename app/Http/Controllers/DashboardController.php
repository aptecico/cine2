<?php

namespace App\Http\Controllers;

use App\Models\Funcion;
use App\Models\Pelicula;
use App\Models\Sala;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pantalla de inicio del cine.
 *
 * No guarda nada: solo cuenta registros y toma las próximas funciones
 * para que la vista los muestre. Preparar datos aquí y dibujarlos en React
 * es la misma idea que usar un controlador y una vista.
 */
class DashboardController extends Controller
{
    public function index(): Response
    {
        $proximas = Funcion::query()
            ->with(['pelicula', 'sala'])
            ->where('estado', true)
            ->whereDate('fecha', '>=', today())
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'resumen' => [
                'peliculas' => Pelicula::query()->count(),
                'peliculas_activas' => Pelicula::query()->activas()->count(),
                'salas' => Sala::query()->count(),
                'salas_activas' => Sala::query()->activas()->count(),
                'funciones' => Funcion::query()->count(),
                'funciones_hoy' => Funcion::query()->whereDate('fecha', today())->count(),
            ],
            'proximas' => $proximas,
        ]);
    }
}
