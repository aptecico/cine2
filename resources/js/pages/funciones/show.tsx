import { Head, Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { BotonEliminar, BotonEstado } from '@/components/cine/botones-crud';
import { Encabezado } from '@/components/cine/encabezado';
import { EstadoBadge } from '@/components/cine/estado-badge';
import { Pagina } from '@/components/cine/pagina';
import { Button } from '@/components/ui/button';
import {
    formatFecha,
    formatPrecio,
    horaCorta,
    minutosATexto,
} from '@/lib/cine';
import type { Clasificaciones, Funcion } from '@/types/cine';

export default function VerFuncion({
    funcion,
    clasificaciones,
}: {
    funcion: Funcion;
    clasificaciones: Clasificaciones;
}) {
    const titulo = funcion.pelicula?.titulo ?? 'Función';

    return (
        <>
            <Head title={titulo} />
            <Pagina>
                <Encabezado
                    titulo={titulo}
                    descripcion={`${funcion.sala?.nombre ?? 'Sala'} · registro #${funcion.id}`}
                    accion={
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href={`/funciones/${funcion.id}/edit`}>
                                    <Pencil />
                                    Editar
                                </Link>
                            </Button>
                            <BotonEstado
                                url={`/funciones/${funcion.id}/estado`}
                                activo={funcion.estado}
                            />
                            <BotonEliminar
                                url={`/funciones/${funcion.id}`}
                                nombre={titulo}
                            />
                        </div>
                    }
                />

                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Dato etiqueta="Estado">
                        <EstadoBadge activo={funcion.estado} />
                    </Dato>
                    <Dato etiqueta="Fecha">{formatFecha(funcion.fecha)}</Dato>
                    <Dato etiqueta="Horario">
                        {horaCorta(funcion.hora_inicio)} a{' '}
                        {horaCorta(funcion.hora_fin)}
                    </Dato>
                    <Dato etiqueta="Precio">
                        {formatPrecio(funcion.precio)}
                    </Dato>
                    <Dato etiqueta="Sala">
                        {funcion.sala ? (
                            <Link
                                href={`/salas/${funcion.sala.id}`}
                                className="underline-offset-4 hover:underline"
                            >
                                {funcion.sala.nombre} · {funcion.sala.capacidad}{' '}
                                butacas
                            </Link>
                        ) : (
                            'Sin sala'
                        )}
                    </Dato>
                    <Dato etiqueta="Película">
                        {funcion.pelicula ? (
                            <Link
                                href={`/peliculas/${funcion.pelicula.id}`}
                                className="underline-offset-4 hover:underline"
                            >
                                {funcion.pelicula.titulo} ·{' '}
                                {minutosATexto(
                                    funcion.pelicula.duracion_minutos,
                                )}{' '}
                                ·{' '}
                                {clasificaciones[
                                    funcion.pelicula.clasificacion
                                ] ?? funcion.pelicula.clasificacion}
                            </Link>
                        ) : (
                            'Sin película'
                        )}
                    </Dato>
                </dl>
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
        <div className="rounded-xl border p-4">
            <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
            <dd className="mt-1 text-sm">{children}</dd>
        </div>
    );
}

VerFuncion.layout = {
    breadcrumbs: [
        { title: 'Funciones', href: '/funciones' },
        { title: 'Detalle', href: '/funciones' },
    ],
};
