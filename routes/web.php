<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

/*
| La portada es pública.
| El panel (inicio, películas, salas y funciones) está en routes/cine.php.
*/
Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

require __DIR__.'/cine.php';
require __DIR__.'/settings.php';
