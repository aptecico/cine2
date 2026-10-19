<?php

namespace Database\Seeders;

use App\Models\Funcion;
use App\Models\Pelicula;
use App\Models\Sala;
use Illuminate\Database\Seeder;

/**
 * Datos de ejemplo para explicar el sistema sin empezar de cero.
 *
 * Se puede volver a ejecutar: updateOrCreate busca por título o nombre
 * y, si ya existe, actualiza en lugar de duplicar.
 */
class CineSeeder extends Seeder
{
    public function run(): void
    {
        $luna = $this->pelicula([
            'titulo' => 'El viaje de Luna',
            'sinopsis' => 'Una niña construye un cohete de cartón y termina en un cine que flota sobre la ciudad.',
            'duracion_minutos' => 95,
            'genero' => 'Animación',
            'clasificacion' => 'ATP',
            'director' => 'Ana Rivas',
            'anio' => 2024,
            'estado' => true,
        ]);

        $sombras = $this->pelicula([
            'titulo' => 'Sombras del puerto',
            'sinopsis' => 'Un farero descubre que las luces del muelle se apagan cada vez que alguien miente.',
            'duracion_minutos' => 118,
            'genero' => 'Suspenso',
            'clasificacion' => '+15',
            'director' => 'Mateo Cruz',
            'anio' => 2023,
            'estado' => true,
        ]);

        $risas = $this->pelicula([
            'titulo' => 'Risas en la estación',
            'sinopsis' => 'Tres desconocidos pierden el último tren y montan una función con lo que llevan en las maletas.',
            'duracion_minutos' => 102,
            'genero' => 'Comedia',
            'clasificacion' => '+7',
            'director' => 'Lucía Gómez',
            'anio' => 2022,
            'estado' => true,
        ]);

        $tren = $this->pelicula([
            'titulo' => 'El último tren',
            'sinopsis' => 'Una maquinista recorre por última vez la vía que la vio crecer.',
            'duracion_minutos' => 130,
            'genero' => 'Drama',
            'clasificacion' => '+12',
            'director' => 'Helena Paz',
            'anio' => 2021,
            'estado' => true,
        ]);

        $this->pelicula([
            'titulo' => 'Archivo perdido',
            'sinopsis' => 'Documental sobre rollos de cine encontrados en un sótano. Está inactivo a propósito, para ver el botón de desactivar.',
            'duracion_minutos' => 80,
            'genero' => 'Documental',
            'clasificacion' => 'ATP',
            'director' => 'Curso de programación',
            'anio' => 2020,
            'estado' => false,
        ]);

        $sala1 = $this->sala('Sala 1', 120, true);
        $sala2 = $this->sala('Sala 2', 80, true);
        $this->sala('Sala 3', 40, false);

        $hoy = now()->toDateString();
        $manana = now()->addDay()->toDateString();

        $this->funcion($luna, $sala1, $hoy, '14:00', 15000);
        $this->funcion($sombras, $sala1, $hoy, '16:00', 18000);
        $this->funcion($risas, $sala1, $hoy, '19:00', 16000);
        $this->funcion($sombras, $sala2, $hoy, '14:00', 18000);
        $this->funcion($tren, $sala2, $manana, '17:00', 17000);
    }

    /**
     * @param  array<string, mixed>  $datos
     */
    private function pelicula(array $datos): Pelicula
    {
        return Pelicula::query()->updateOrCreate(
            ['titulo' => $datos['titulo']],
            $datos,
        );
    }

    private function sala(string $nombre, int $capacidad, bool $estado): Sala
    {
        return Sala::query()->updateOrCreate(
            ['nombre' => $nombre],
            [
                'capacidad' => $capacidad,
                'estado' => $estado,
            ],
        );
    }

    private function funcion(Pelicula $pelicula, Sala $sala, string $fecha, string $hora, float $precio): void
    {
        $horaFin = Funcion::calcularHoraFin($hora, $pelicula->duracion_minutos);

        if ($horaFin === null) {
            throw new \RuntimeException("La función de {$pelicula->titulo} pasa de medianoche.");
        }

        Funcion::query()->updateOrCreate(
            [
                'sala_id' => $sala->id,
                'fecha' => $fecha,
                'hora_inicio' => Funcion::normalizarHora($hora),
            ],
            [
                'pelicula_id' => $pelicula->id,
                'hora_fin' => $horaFin,
                'precio' => $precio,
                'estado' => true,
            ],
        );
    }
}
