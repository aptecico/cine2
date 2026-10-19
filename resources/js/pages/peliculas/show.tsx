import { Head, Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { BotonEliminar, BotonEstado } from '@/components/cine/botones-crud';
import { Encabezado } from '@/components/cine/encabezado';
import { EstadoBadge } from '@/components/cine/estado-badge';
import { Pagina } from '@/components/cine/pagina';
import { Button } from '@/components/ui/button';
import { formatFecha, horaCorta, minutosATexto } from '@/lib/cine';
import type { Clasificaciones, Pelicula } from '@/types/cine';

/** Ficha de una película y las funciones en las que aparece. */
export default function VerPelicula({
    pelicula,
    clasificaciones,
}: {
    pelicula: Pelicula;
    clasificaciones: Clasificaciones;
}) {
    const enUso = (pelicula.funciones_count ?? 0) > 0;

    return (
        <>
            <Head title={pelicula.titulo} />
            <Pagina>
                <Encabezado
                    titulo={pelicula.titulo}
                    descripcion={`Registro #${pelicula.id} · ${pelicula.slug}`}
                    accion={
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href={`/peliculas/${pelicula.id}/edit`}>
                                    <Pencil />
                                    Editar
                                </Link>
                            </Button>
                            <BotonEstado
                                url={`/peliculas/${pelicula.id}/estado`}
                                activo={pelicula.estado}
                            />
                            {enUso ? null : (
                                <BotonEliminar
                                    url={`/peliculas/${pelicula.id}`}
                                    nombre={pelicula.titulo}
                                />
                            )}
                        </div>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                    <div className="overflow-hidden rounded-xl border bg-muted/30">
                        {pelicula.imagen ? (
                            <img
                                src={pelicula.imagen}
                                alt=""
                                className="h-full max-h-80 w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                                Sin imagen
                            </div>
                        )}
                    </div>

                    <dl className="grid gap-4 sm:grid-cols-2">
                        <Dato etiqueta="Estado">
                            <EstadoBadge activo={pelicula.estado} />
                        </Dato>
                        <Dato etiqueta="Género">{pelicula.genero}</Dato>
                        <Dato etiqueta="Duración">
                            {minutosATexto(pelicula.duracion_minutos)}
                        </Dato>
                        <Dato etiqueta="Clasificación">
                            {clasificaciones[pelicula.clasificacion] ??
                                pelicula.clasificacion}
                        </Dato>
                        <Dato etiqueta="Director">
                            {pelicula.director || 'Sin registrar'}
                        </Dato>
                        <Dato etiqueta="Año">
                            {pelicula.anio || 'Sin registrar'}
                        </Dato>
                        <Dato etiqueta="Estreno">
                            {pelicula.fecha_estreno
                                ? formatFecha(pelicula.fecha_estreno)
                                : 'Sin registrar'}
                        </Dato>
                        <div className="sm:col-span-2">
                            <Dato etiqueta="Sinopsis">{pelicula.sinopsis}</Dato>
                        </div>
                    </dl>
                </div>

                {enUso && (
                    <p className="text-sm text-muted-foreground">
                        No se puede eliminar porque tiene funciones. Desactívala
                        si ya no quieres programarla.
                    </p>
                )}

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold">
                        Funciones de esta película
                    </h2>
                    {(pelicula.funciones ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Todavía no está programada.
                        </p>
                    ) : (
                        <ul className="divide-y rounded-xl border">
                            {pelicula.funciones?.map((funcion) => (
                                <li key={funcion.id}>
                                    <Link
                                        href={`/funciones/${funcion.id}`}
                                        className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-muted/40"
                                    >
                                        <span>
                                            {formatFecha(funcion.fecha)} ·{' '}
                                            {horaCorta(funcion.hora_inicio)} a{' '}
                                            {horaCorta(funcion.hora_fin)}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {funcion.sala?.nombre}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </Pagina>
        </>
    );
}

function Dato({
    etiqueta,
    children,
}: {
    etiqueta: string;
    children: ReactNode;
}) {
    return (
        <div>
            <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
            <dd className="mt-1 text-sm">{children}</dd>
        </div>
    );
}

VerPelicula.layout = {
    breadcrumbs: [
        { title: 'Películas', href: '/peliculas' },
        { title: 'Detalle', href: '/peliculas' },
    ],
};
