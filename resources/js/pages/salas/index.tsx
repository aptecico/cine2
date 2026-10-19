import { Head, Link } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { BotonEliminar, BotonEstado } from '@/components/cine/botones-crud';
import { Campo, controlClass } from '@/components/cine/campo';
import { Encabezado } from '@/components/cine/encabezado';
import { EstadoBadge } from '@/components/cine/estado-badge';
import { Pagina } from '@/components/cine/pagina';
import { Paginacion } from '@/components/cine/paginacion';
import { Button } from '@/components/ui/button';
import type { Paginador, Sala } from '@/types/cine';

/**
 * Listado de salas.
 * Misma idea que películas: el controlador filtra y esta página solo dibuja.
 */
export default function ListadoSalas({
    salas,
    filtros,
}: {
    salas: Paginador<Sala>;
    filtros: {
        buscar: string;
        estado: string;
    };
}) {
    return (
        <>
            <Head title="Salas" />
            <Pagina>
                <Encabezado
                    titulo="Salas"
                    descripcion="Cada sala tiene un nombre y una capacidad. Desactivarla la esconde al programar, sin borrar sus funciones."
                    accion={
                        <Button asChild>
                            <Link href="/salas/create">
                                <Plus />
                                Nueva sala
                            </Link>
                        </Button>
                    }
                />

                <form
                    method="get"
                    action="/salas"
                    className="grid gap-4 rounded-xl border p-4 md:grid-cols-[1fr_180px_auto]"
                >
                    <Campo id="buscar" etiqueta="Buscar por nombre">
                        <input
                            id="buscar"
                            name="buscar"
                            className={controlClass}
                            defaultValue={filtros.buscar}
                            placeholder="Sala 1"
                        />
                    </Campo>
                    <Campo id="estado" etiqueta="Estado">
                        <select
                            id="estado"
                            name="estado"
                            className={controlClass}
                            defaultValue={filtros.estado}
                        >
                            <option value="">Todas</option>
                            <option value="activas">Activas</option>
                            <option value="inactivas">Inactivas</option>
                        </select>
                    </Campo>
                    <div className="flex items-end gap-2">
                        <Button type="submit">Buscar</Button>
                        <Button variant="outline" asChild>
                            <Link href="/salas">Limpiar</Link>
                        </Button>
                    </div>
                </form>

                {salas.data.length === 0 ? (
                    <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                        No hay salas con esos filtros.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Nombre
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Capacidad
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Estado
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {salas.data.map((sala) => (
                                    <tr key={sala.id} className="border-t">
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/salas/${sala.id}`}
                                                className="font-medium underline-offset-4 hover:underline"
                                            >
                                                {sala.nombre}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {sala.funciones_count ?? 0}{' '}
                                                funciones
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {sala.capacidad} butacas
                                        </td>
                                        <td className="px-4 py-3">
                                            <EstadoBadge activo={sala.estado} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/salas/${sala.id}`}
                                                    >
                                                        <Eye />
                                                        Ver
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/salas/${sala.id}/edit`}
                                                    >
                                                        <Pencil />
                                                        Editar
                                                    </Link>
                                                </Button>
                                                <BotonEstado
                                                    url={`/salas/${sala.id}/estado`}
                                                    activo={sala.estado}
                                                />
                                                {(sala.funciones_count ?? 0) >
                                                0 ? null : (
                                                    <BotonEliminar
                                                        url={`/salas/${sala.id}`}
                                                        nombre={sala.nombre}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Paginacion paginador={salas} />
            </Pagina>
        </>
    );
}

ListadoSalas.layout = {
    breadcrumbs: [{ title: 'Salas', href: '/salas' }],
};
