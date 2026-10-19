<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FuncionController;
use App\Http\Controllers\PeliculaController;
use App\Http\Controllers\SalaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas del cine
|--------------------------------------------------------------------------
|
| Solo entran personas que ya iniciaron sesión.
| "verified" pide el correo confirmado cuando el usuario tiene esa regla.
|
| Route::resource crea las 7 rutas del CRUD. Con películas queda así:
|
|   GET     /peliculas                     peliculas.index
|   GET     /peliculas/create              peliculas.create
|   POST    /peliculas                     peliculas.store
|   GET     /peliculas/{pelicula}          peliculas.show
|   GET     /peliculas/{pelicula}/edit     peliculas.edit
|   PUT     /peliculas/{pelicula}          peliculas.update
|   DELETE  /peliculas/{pelicula}          peliculas.destroy
|
| {funcion} es el id. En películas y salas Laravel lo deduce solo.
| En funciones hay que indicarlo: el inglés convertiría "funciones" en "funcione".
|
| La ruta /estado va aparte: activar o desactivar no es borrar.
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::patch('peliculas/{pelicula}/estado', [PeliculaController::class, 'toggleEstado'])
        ->name('peliculas.estado');
    Route::resource('peliculas', PeliculaController::class);

    Route::patch('salas/{sala}/estado', [SalaController::class, 'toggleEstado'])
        ->name('salas.estado');
    Route::resource('salas', SalaController::class);

    Route::patch('funciones/{funcion}/estado', [FuncionController::class, 'toggleEstado'])
        ->name('funciones.estado');

    // "funciones" en inglés se singulariza como "funcione".
    // Forzamos el parámetro {funcion} para que coincida con Funcion $funcion.
    Route::resource('funciones', FuncionController::class)
        ->parameters(['funciones' => 'funcion']);
});
