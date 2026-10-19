import { Form, Link } from '@inertiajs/react';
import { Campo, controlClass } from '@/components/cine/campo';
import { Nota } from '@/components/cine/nota';
import { Button } from '@/components/ui/button';
import type { Clasificaciones, Pelicula } from '@/types/cine';

/**
 * El mismo formulario crea y edita.
 * Crear:  POST /peliculas
 * Editar: PUT  /peliculas/{id}
 *
 * El checkbox "estado" solo se envía si está marcado.
 * Si el usuario lo quita, Laravel recibe el campo vacío y lo guarda como inactivo.
 */
export function PeliculaForm({
    pelicula,
    generos,
    clasificaciones,
}: {
    pelicula?: Pelicula;
    generos: string[];
    clasificaciones: Clasificaciones;
}) {
    const editando = Boolean(pelicula);

    return (
        <Form
            action={editando ? `/peliculas/${pelicula?.id}` : '/peliculas'}
            method={editando ? 'put' : 'post'}
            className="space-y-6"
            key={pelicula?.id ?? 'nueva'}
        >
            {({ processing, errors }) => (
                <>
                    <Nota>
                        El título, la sinopsis, la duración, el género y la
                        clasificación son obligatorios. Lo demás puede quedar
                        vacío.
                    </Nota>

                    <Campo id="titulo" etiqueta="Título" error={errors.titulo}>
                        <input
                            id="titulo"
                            name="titulo"
                            className={controlClass}
                            defaultValue={pelicula?.titulo}
                            required
                            maxLength={150}
                            placeholder="El viaje de Luna"
                        />
                    </Campo>

                    <Campo
                        id="sinopsis"
                        etiqueta="Sinopsis"
                        error={errors.sinopsis}
                    >
                        <textarea
                            id="sinopsis"
                            name="sinopsis"
                            className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            defaultValue={pelicula?.sinopsis}
                            required
                            maxLength={5000}
                            placeholder="De qué trata, sin contar el final."
                        />
                    </Campo>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Campo
                            id="duracion_minutos"
                            etiqueta="Duración (minutos)"
                            error={errors.duracion_minutos}
                            ayuda="2 horas se escriben 120. Con este número se calcula la hora de fin de cada función."
                        >
                            <input
                                id="duracion_minutos"
                                name="duracion_minutos"
                                type="number"
                                min={1}
                                max={400}
                                className={controlClass}
                                defaultValue={pelicula?.duracion_minutos}
                                required
                            />
                        </Campo>

                        <Campo
                            id="genero"
                            etiqueta="Género"
                            error={errors.genero}
                        >
                            <select
                                id="genero"
                                name="genero"
                                className={controlClass}
                                defaultValue={pelicula?.genero ?? ''}
                                required
                            >
                                <option value="" disabled>
                                    Elige un género
                                </option>
                                {generos.map((genero) => (
                                    <option key={genero} value={genero}>
                                        {genero}
                                    </option>
                                ))}
                            </select>
                        </Campo>

                        <Campo
                            id="clasificacion"
                            etiqueta="Clasificación"
                            error={errors.clasificacion}
                        >
                            <select
                                id="clasificacion"
                                name="clasificacion"
                                className={controlClass}
                                defaultValue={pelicula?.clasificacion ?? ''}
                                required
                            >
                                <option value="" disabled>
                                    Elige una clasificación
                                </option>
                                {Object.entries(clasificaciones).map(
                                    ([codigo, etiqueta]) => (
                                        <option key={codigo} value={codigo}>
                                            {codigo} — {etiqueta}
                                        </option>
                                    ),
                                )}
                            </select>
                        </Campo>

                        <Campo
                            id="director"
                            etiqueta="Director"
                            error={errors.director}
                        >
                            <input
                                id="director"
                                name="director"
                                className={controlClass}
                                defaultValue={pelicula?.director ?? ''}
                                maxLength={120}
                            />
                        </Campo>

                        <Campo id="anio" etiqueta="Año" error={errors.anio}>
                            <input
                                id="anio"
                                name="anio"
                                type="number"
                                min={1888}
                                className={controlClass}
                                defaultValue={pelicula?.anio ?? ''}
                            />
                        </Campo>

                        <Campo
                            id="fecha_estreno"
                            etiqueta="Fecha de estreno"
                            error={errors.fecha_estreno}
                        >
                            <input
                                id="fecha_estreno"
                                name="fecha_estreno"
                                type="date"
                                className={controlClass}
                                defaultValue={
                                    pelicula?.fecha_estreno?.slice(0, 10) ?? ''
                                }
                            />
                        </Campo>
                    </div>

                    <Campo
                        id="imagen"
                        etiqueta="Imagen (URL)"
                        error={errors.imagen}
                        ayuda="Opcional. Pega una dirección que empiece por https://"
                    >
                        <input
                            id="imagen"
                            name="imagen"
                            type="url"
                            className={controlClass}
                            defaultValue={pelicula?.imagen ?? ''}
                            placeholder="https://"
                        />
                    </Campo>

                    <label className="flex items-start gap-3 text-sm">
                        <input
                            type="checkbox"
                            name="estado"
                            value="1"
                            defaultChecked={pelicula ? pelicula.estado : true}
                            className="mt-1 size-4"
                        />
                        <span>
                            <span className="font-medium">Película activa</span>
                            <span className="mt-1 block text-muted-foreground">
                                Si la desmarcas, sigue en el listado pero no se
                                puede programar.
                            </span>
                        </span>
                    </label>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Guardando...'
                                : editando
                                  ? 'Guardar cambios'
                                  : 'Registrar película'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/peliculas">Cancelar</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
