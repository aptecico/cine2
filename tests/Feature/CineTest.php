<?php

namespace Tests\Feature;

use App\Models\Funcion;
use App\Models\Pelicula;
use App\Models\Sala;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Estas pruebas describen las reglas del cine en frases.
 * Cada una entra como un usuario, intenta una acción y comprueba el resultado.
 */
class CineTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_un_visitante_no_puede_ver_las_peliculas(): void
    {
        $this->get(route('peliculas.index'))
            ->assertRedirect(route('login'));
    }

    public function test_se_puede_registrar_una_pelicula(): void
    {
        $this->entrar();

        $this->post(route('peliculas.store'), $this->datosPelicula([
            'titulo' => 'El viaje de Luna',
            'estado' => '1',
        ]))->assertRedirect(route('peliculas.index'));

        $this->assertDatabaseHas('peliculas', [
            'titulo' => 'El viaje de Luna',
            'slug' => 'el-viaje-de-luna',
            'estado' => true,
        ]);
    }

    public function test_no_guarda_una_pelicula_sin_titulo(): void
    {
        $this->entrar();

        $this->from(route('peliculas.create'))
            ->post(route('peliculas.store'), $this->datosPelicula([
                'titulo' => '',
            ]))
            ->assertRedirect(route('peliculas.create'))
            ->assertSessionHasErrors('titulo');
    }

    public function test_la_busqueda_encuentra_por_titulo(): void
    {
        $this->entrar();
        $this->pelicula(['titulo' => 'El viaje de Luna']);
        $this->pelicula(['titulo' => 'Sombras del puerto']);

        $this->get(route('peliculas.index', ['buscar' => 'Luna']))
            ->assertOk()
            ->assertInertia(fn ($pagina) => $pagina
                ->component('peliculas/index')
                ->has('peliculas.data', 1)
                ->where('peliculas.data.0.titulo', 'El viaje de Luna'));
    }

    public function test_no_elimina_una_pelicula_con_funciones(): void
    {
        $this->entrar();
        $pelicula = $this->pelicula();
        $this->funcion($pelicula, $this->sala(), '14:00');

        $this->delete(route('peliculas.destroy', $pelicula))
            ->assertRedirect();

        $this->assertModelExists($pelicula);
    }

    public function test_si_elimina_una_pelicula_sin_funciones(): void
    {
        $this->entrar();
        $pelicula = $this->pelicula();

        $this->delete(route('peliculas.destroy', $pelicula))
            ->assertRedirect(route('peliculas.index'));

        $this->assertModelMissing($pelicula);
    }

    public function test_no_repite_el_nombre_de_una_sala(): void
    {
        $this->entrar();
        $this->sala('Sala 1');

        $this->from(route('salas.create'))
            ->post(route('salas.store'), [
                'nombre' => 'Sala 1',
                'capacidad' => 80,
                'estado' => '1',
            ])
            ->assertRedirect(route('salas.create'))
            ->assertSessionHasErrors('nombre');
    }

    public function test_programa_una_funcion_y_calcula_la_hora_de_fin(): void
    {
        $this->entrar();
        $pelicula = $this->pelicula(['duracion_minutos' => 120]);
        $sala = $this->sala();

        $this->post(route('funciones.store'), [
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => '2026-10-20',
            'hora_inicio' => '14:00',
            'precio' => 18000,
            'estado' => '1',
        ])->assertRedirect(route('funciones.index'));

        $funcion = Funcion::query()->first();

        $this->assertNotNull($funcion);
        $this->assertSame('14:00:00', $funcion->hora_inicio);
        $this->assertSame('16:00:00', $funcion->hora_fin);
    }

    public function test_no_deja_cruzar_dos_funciones_en_la_misma_sala(): void
    {
        $this->entrar();
        $pelicula = $this->pelicula(['duracion_minutos' => 120]);
        $sala = $this->sala();
        $this->funcion($pelicula, $sala, '14:00', '2026-10-20');

        $this->from(route('funciones.create'))
            ->post(route('funciones.store'), [
                'pelicula_id' => $pelicula->id,
                'sala_id' => $sala->id,
                'fecha' => '2026-10-20',
                'hora_inicio' => '15:00',
                'precio' => 18000,
                'estado' => '1',
            ])
            ->assertRedirect(route('funciones.create'))
            ->assertSessionHasErrors('hora_inicio');

        $this->assertDatabaseCount('funciones', 1);
    }

    public function test_deja_programar_cuando_la_anterior_ya_termino(): void
    {
        $this->entrar();
        $pelicula = $this->pelicula(['duracion_minutos' => 120]);
        $sala = $this->sala();
        $this->funcion($pelicula, $sala, '14:00', '2026-10-20');

        $this->post(route('funciones.store'), [
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => '2026-10-20',
            'hora_inicio' => '16:00',
            'precio' => 18000,
            'estado' => '1',
        ])->assertRedirect(route('funciones.index'));

        $this->assertDatabaseCount('funciones', 2);
    }

    public function test_la_misma_hora_en_otra_sala_si_se_puede(): void
    {
        $this->entrar();
        $pelicula = $this->pelicula(['duracion_minutos' => 90]);
        $this->funcion($pelicula, $this->sala('Sala 1'), '14:00', '2026-10-20');

        $this->post(route('funciones.store'), [
            'pelicula_id' => $pelicula->id,
            'sala_id' => $this->sala('Sala 2')->id,
            'fecha' => '2026-10-20',
            'hora_inicio' => '14:00',
            'precio' => 15000,
            'estado' => '1',
        ])->assertRedirect(route('funciones.index'));
    }

    public function test_una_funcion_inactiva_no_ocupa_la_sala(): void
    {
        $this->entrar();
        $pelicula = $this->pelicula(['duracion_minutos' => 120]);
        $sala = $this->sala();
        $ocupada = $this->funcion($pelicula, $sala, '14:00', '2026-10-20');
        $ocupada->update(['estado' => false]);

        $this->post(route('funciones.store'), [
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => '2026-10-20',
            'hora_inicio' => '14:00',
            'precio' => 15000,
            'estado' => '1',
        ])->assertRedirect(route('funciones.index'));
    }

    public function test_no_programa_una_funcion_que_pase_de_medianoche(): void
    {
        $this->entrar();

        $this->from(route('funciones.create'))
            ->post(route('funciones.store'), [
                'pelicula_id' => $this->pelicula(['duracion_minutos' => 120])->id,
                'sala_id' => $this->sala()->id,
                'fecha' => '2026-10-20',
                'hora_inicio' => '23:30',
                'precio' => 15000,
                'estado' => '1',
            ])
            ->assertRedirect(route('funciones.create'))
            ->assertSessionHasErrors('hora_inicio');
    }

    public function test_puede_guardar_la_misma_funcion_sin_chocar_consigo(): void
    {
        $this->entrar();
        $pelicula = $this->pelicula(['duracion_minutos' => 120]);
        $sala = $this->sala();
        $funcion = $this->funcion($pelicula, $sala, '14:00', '2026-10-20');

        $this->put(route('funciones.update', $funcion), [
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => '2026-10-20',
            'hora_inicio' => '14:00',
            'precio' => 20000,
            'estado' => '1',
        ])->assertRedirect(route('funciones.show', $funcion));

        $this->assertDatabaseCount('funciones', 1);
    }

    private function entrar(): void
    {
        $this->actingAs(User::factory()->create());
    }

    /**
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    private function datosPelicula(array $extra = []): array
    {
        return array_merge([
            'titulo' => 'Película de prueba',
            'sinopsis' => 'Una sinopsis corta para la prueba.',
            'duracion_minutos' => 100,
            'genero' => 'Drama',
            'clasificacion' => '+12',
            'estado' => '1',
        ], $extra);
    }

    /**
     * @param  array<string, mixed>  $extra
     */
    private function pelicula(array $extra = []): Pelicula
    {
        return Pelicula::query()->create(array_merge([
            'titulo' => 'Película de prueba '.fake()->unique()->numerify('###'),
            'sinopsis' => 'Una sinopsis corta para la prueba.',
            'duracion_minutos' => 100,
            'genero' => 'Drama',
            'clasificacion' => '+12',
            'estado' => true,
        ], $extra));
    }

    private function sala(string $nombre = 'Sala 1'): Sala
    {
        return Sala::query()->create([
            'nombre' => $nombre,
            'capacidad' => 100,
            'estado' => true,
        ]);
    }

    private function funcion(Pelicula $pelicula, Sala $sala, string $hora, string $fecha = '2026-10-20'): Funcion
    {
        return Funcion::query()->create([
            'pelicula_id' => $pelicula->id,
            'sala_id' => $sala->id,
            'fecha' => $fecha,
            'hora_inicio' => Funcion::normalizarHora($hora),
            'hora_fin' => Funcion::calcularHoraFin($hora, $pelicula->duracion_minutos),
            'precio' => 15000,
            'estado' => true,
        ]);
    }
}
