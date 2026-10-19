import { Head, Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { BotonEliminar, BotonEstado } from '@/components/cine/botones-crud';
import { Encabezado } from '@/components/cine/encabezado';
import { EstadoBadge } from '@/components/cine/estado-badge';
import { Pagina } from '@/components/cine/pagina';
import { Button } from '@/components/ui/button';
import { formatFecha, formatPrecio, horaCorta } from '@/lib/cine';
import type { Sala } from '@/types/cine';

export default function VerSala({ sala }: { sala: Sala }) {
    const enUso = (sala.funciones_count ?? 0) > 0;

    return (
        <>
            <Head title={sala.nombre} />
            <Pagina>
                <Encabezado
                    titulo={sala.nombre}
                    descripcion={`Registro #${sala.id}`}
                    accion={
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href={`/salas/${sala.id}/edit`}>
                                    <Pencil />
                                    Editar
                                </Link>
                            </Button>
                            <BotonEstado
                                url={`/salas/${sala.id}/estado`}
                                activo={sala.estado}
                            />
                            {enUso ? null : (
                                <BotonEliminar
                                    url={`/salas/${sala.id}`}
                                    nombre={sala.nombre}
                                />
                            )}
                        </div>
                    }
                />

                <dl className="grid gap-4 sm:grid-cols-3">
                    <Dato etiqueta="Estado">
                        <EstadoBadge activo={sala.estado} />
                    </Dato>
                    <Dato etiqueta="Capacidad">{sala.capacidad} butacas</Dato>
                    <Dato etiqueta="Funciones">
                        {sala.funciones_count ?? 0}
                    </Dato>
                </dl>

                {enUso && (
                    <p className="text-sm text-muted-foreground">
                        No se puede eliminar porque tiene funciones. Puedes
                        desactivarla para que no reciba programación nueva.
                    </p>
                )}

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold">
                        Programación de la sala
                    </h2>
                    {(sala.funciones ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Esta sala todavía no tiene funciones.
                        </p>
                    ) : (
                        <ul className="divide-y rounded-xl border">
                            {sala.funciones?.map((funcion) => (
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
                                            {funcion.pelicula?.titulo} ·{' '}
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

VerSala.layout = {
    breadcrumbs: [
        { title: 'Salas', href: '/salas' },
        { title: 'Detalle', href: '/salas' },
    ],
};
