import { Head, Link } from '@inertiajs/react';
import { CalendarClock, Clapperboard, DoorOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import { Pagina } from '@/components/cine/pagina';
import { formatFecha, formatPrecio, horaCorta } from '@/lib/cine';
import type { Funcion } from '@/types/cine';

type Resumen = {
    peliculas: number;
    peliculas_activas: number;
    salas: number;
    salas_activas: number;
    funciones: number;
    funciones_hoy: number;
};

/**
 * El inicio no es un CRUD: solo resume los tres módulos.
 * Los números salen de DashboardController.
 */
export default function Dashboard({
    resumen,
    proximas,
}: {
    resumen: Resumen;
    proximas: Funcion[];
}) {
    return (
        <>
            <Head title="Inicio" />
            <Pagina>
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Cine
                    </h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        Administra las películas, las salas y la programación.
                        Una función no puede cruzarse con otra en la misma sala.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Tarjeta
                        href="/peliculas"
                        icono={<Clapperboard className="size-5" />}
                        titulo="Películas"
                        texto={`${resumen.peliculas_activas} activas de ${resumen.peliculas}`}
                    />
                    <Tarjeta
                        href="/salas"
                        icono={<DoorOpen className="size-5" />}
                        titulo="Salas"
                        texto={`${resumen.salas_activas} activas de ${resumen.salas}`}
                    />
                    <Tarjeta
                        href="/funciones"
                        icono={<CalendarClock className="size-5" />}
                        titulo="Funciones"
                        texto={`${resumen.funciones_hoy} hoy · ${resumen.funciones} en total`}
                    />
                </div>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold">
                        Próximas funciones
                    </h2>
                    {proximas.length === 0 ? (
                        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            No hay funciones activas de hoy en adelante.
                        </p>
                    ) : (
                        <ul className="divide-y rounded-xl border">
                            {proximas.map((funcion) => (
                                <li key={funcion.id}>
                                    <Link
                                        href={`/funciones/${funcion.id}`}
                                        className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-muted/40"
                                    >
                                        <span className="font-medium">
                                            {funcion.pelicula?.titulo}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {formatFecha(funcion.fecha)} ·{' '}
                                            {horaCorta(funcion.hora_inicio)} ·{' '}
                                            {funcion.sala?.nombre} ·{' '}
                                            {formatPrecio(funcion.precio)}
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

function Tarjeta({
    href,
    icono,
    titulo,
    texto,
}: {
    href: string;
    icono: ReactNode;
    titulo: string;
    texto: string;
}) {
    return (
        <Link
            href={href}
            className="rounded-xl border p-5 transition-colors hover:bg-muted/40"
        >
            <div className="mb-3 text-muted-foreground">{icono}</div>
            <p className="font-medium">{titulo}</p>
            <p className="mt-1 text-sm text-muted-foreground">{texto}</p>
        </Link>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Inicio',
            href: '/dashboard',
        },
    ],
};
