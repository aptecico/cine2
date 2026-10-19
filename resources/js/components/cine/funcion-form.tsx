import { Form, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Campo, controlClass } from '@/components/cine/campo';
import { Nota } from '@/components/cine/nota';
import { Button } from '@/components/ui/button';
import { minutosATexto, vistaPreviaFin } from '@/lib/cine';
import type { Funcion, OpcionPelicula, OpcionSala } from '@/types/cine';

/**
 * Crear: POST /funciones
 * Editar: PUT  /funciones/{id}
 *
 * La hora de fin no es un campo. Se muestra como pista y el servidor
 * la vuelve a calcular con la duración de la película.
 */
export function FuncionForm({
    funcion,
    peliculas,
    salas,
}: {
    funcion?: Funcion;
    peliculas: OpcionPelicula[];
    salas: OpcionSala[];
}) {
    const editando = Boolean(funcion);
    const [peliculaId, setPeliculaId] = useState(
        funcion ? String(funcion.pelicula_id) : '',
    );
    const [horaInicio, setHoraInicio] = useState(
        funcion?.hora_inicio.slice(0, 5) ?? '',
    );

    const pelicula = peliculas.find((item) => String(item.id) === peliculaId);
    const fin = pelicula
        ? vistaPreviaFin(horaInicio, pelicula.duracion_minutos)
        : null;

    return (
        <Form
            action={editando ? `/funciones/${funcion?.id}` : '/funciones'}
            method={editando ? 'put' : 'post'}
            className="space-y-6"
            key={funcion?.id ?? 'nueva'}
        >
            {({ processing, errors }) => (
                <>
                    <Nota>
                        Una función ocupa una sala desde la hora de inicio hasta
                        que termina la película. Si otra función activa cae en
                        ese mismo tramo, el sistema no la guarda.
                    </Nota>

                    {peliculas.length === 0 || salas.length === 0 ? (
                        <Nota>
                            Hace falta al menos una película activa y una sala
                            activa. Créalas antes de programar.
                        </Nota>
                    ) : null}

                    <div className="grid gap-6 md:grid-cols-2">
                        <Campo
                            id="pelicula_id"
                            etiqueta="Película"
                            error={errors.pelicula_id}
                        >
                            <select
                                id="pelicula_id"
                                name="pelicula_id"
                                className={controlClass}
                                value={peliculaId}
                                required
                                onChange={(event) =>
                                    setPeliculaId(event.target.value)
                                }
                            >
                                <option value="" disabled>
                                    Elige una película
                                </option>
                                {peliculas.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.titulo} (
                                        {minutosATexto(item.duracion_minutos)})
                                        {item.estado ? '' : ' — inactiva'}
                                    </option>
                                ))}
                            </select>
                        </Campo>

                        <Campo
                            id="sala_id"
                            etiqueta="Sala"
                            error={errors.sala_id}
                        >
                            <select
                                id="sala_id"
                                name="sala_id"
                                className={controlClass}
                                defaultValue={funcion?.sala_id ?? ''}
                                required
                            >
                                <option value="" disabled>
                                    Elige una sala
                                </option>
                                {salas.map((sala) => (
                                    <option key={sala.id} value={sala.id}>
                                        {sala.nombre} — {sala.capacidad} butacas
                                        {sala.estado ? '' : ' — inactiva'}
                                    </option>
                                ))}
                            </select>
                        </Campo>

                        <Campo id="fecha" etiqueta="Fecha" error={errors.fecha}>
                            <input
                                id="fecha"
                                name="fecha"
                                type="date"
                                className={controlClass}
                                defaultValue={funcion?.fecha.slice(0, 10) ?? ''}
                                required
                            />
                        </Campo>

                        <Campo
                            id="hora_inicio"
                            etiqueta="Hora de inicio"
                            error={errors.hora_inicio}
                            ayuda={
                                pelicula && horaInicio
                                    ? fin
                                        ? `Termina aproximadamente a las ${fin}.`
                                        : 'Con esa hora, la película pasaría de medianoche.'
                                    : 'La hora de fin se calcula sola.'
                            }
                        >
                            <input
                                id="hora_inicio"
                                name="hora_inicio"
                                type="time"
                                className={controlClass}
                                value={horaInicio}
                                required
                                onChange={(event) =>
                                    setHoraInicio(event.target.value)
                                }
                            />
                        </Campo>

                        <Campo
                            id="precio"
                            etiqueta="Precio de la boleta"
                            error={errors.precio}
                        >
                            <input
                                id="precio"
                                name="precio"
                                type="number"
                                min={0}
                                step="0.01"
                                className={controlClass}
                                defaultValue={funcion?.precio ?? ''}
                                required
                            />
                        </Campo>
                    </div>

                    <label className="flex items-start gap-3 text-sm">
                        <input
                            type="checkbox"
                            name="estado"
                            value="1"
                            defaultChecked={funcion ? funcion.estado : true}
                            className="mt-1 size-4"
                        />
                        <span>
                            <span className="font-medium">Función activa</span>
                            <span className="mt-1 block text-muted-foreground">
                                Solo las funciones activas ocupan la sala. Una
                                inactiva deja el horario libre.
                            </span>
                        </span>
                    </label>

                    <div className="flex items-center gap-3">
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                peliculas.length === 0 ||
                                salas.length === 0
                            }
                        >
                            {processing
                                ? 'Guardando...'
                                : editando
                                  ? 'Guardar cambios'
                                  : 'Programar función'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/funciones">Cancelar</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
