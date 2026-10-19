import { Head, Link } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { BotonEliminar, BotonEstado } from '@/components/cine/botones-crud';
import { Campo, controlClass } from '@/components/cine/campo';
import { Encabezado } from '@/components/cine/encabezado';
import { EstadoBadge } from '@/components/cine/estado-badge';
import { Pagina } from '@/components/cine/pagina';
import { Paginacion } from '@/components/cine/paginacion';
import { Button } from '@/components/ui/button';
import { minutosATexto } from '@/lib/cine';
import type { Clasificaciones, Paginador, Pelicula } from '@/types/cine';

/**
 * Listado de películas.
 *
 * Esta página no consulta la base de datos. El controlador ya hizo la
 * búsqueda y mandó el resultado en la prop "peliculas".
 * El formulario de arriba es GET: vuelve a pedir /peliculas?buscar=...
 */
export default function ListadoPeliculas({
    peliculas,
    generos,
    clasificaciones,
    filtros,
}: {
    peliculas: Paginador<Pelicula>;
    generos: string[];
    clasificaciones: Clasificaciones;
    filtros: {
        buscar: string;
        genero: string;
        estado: string;
    };
}) {
    return (
        <>
            <Head title="Películas" />
            <Pagina>
                <Encabezado
                    titulo="Películas"
                    descripcion="Registra el catálogo, búscalo y decide si una película sigue en cartelera o solo queda archivada."
                    accion={
                        <Button asChild>
                            <Link href="/peliculas/create">
                                <Plus />
                                Nueva película
                            </Link>
                        </Button>
                    }
                />

                <form
                    method="get"
                    action="/peliculas"
                    className="grid gap-4 rounded-xl border p-4 md:grid-cols-[1fr_180px_160px_auto]"
                >
                    <Campo id="buscar" etiqueta="Buscar">
                        <input
                            id="buscar"
                            name="buscar"
                            className={controlClass}
                            defaultValue={filtros.buscar}
                            placeholder="Título, sinopsis o director"
                        />
                    </Campo>
                    <Campo id="genero" etiqueta="Género">
                        <select
                            id="genero"
                            name="genero"
                            className={controlClass}
                            defaultValue={filtros.genero}
                        >
                            <option value="">Todos</option>
                            {generos.map((genero) => (
                                <option key={genero} value={genero}>
                                    {genero}
                                </option>
                            ))}
                        </select>
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
                            <Link href="/peliculas">Limpiar</Link>
                        </Button>
                    </div>
                </form>

                {peliculas.data.length === 0 ? (
                    <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                        No hay películas con esos filtros.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Título
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Género
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Duración
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Clasificación
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
                                {peliculas.data.map((pelicula) => (
                                    <tr key={pelicula.id} className="border-t">
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/peliculas/${pelicula.id}`}
                                                className="font-medium underline-offset-4 hover:underline"
                                            >
                                                {pelicula.titulo}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {pelicula.funciones_count ?? 0}{' '}
                                                funciones
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {pelicula.genero}
                                        </td>
                                        <td className="px-4 py-3">
                                            {minutosATexto(
                                                pelicula.duracion_minutos,
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {clasificaciones[
                                                pelicula.clasificacion
                                            ] ?? pelicula.clasificacion}
                                        </td>
                                        <td className="px-4 py-3">
                                            <EstadoBadge
                                                activo={pelicula.estado}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/peliculas/${pelicula.id}`}
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
                                                        href={`/peliculas/${pelicula.id}/edit`}
                                                    >
                                                        <Pencil />
                                                        Editar
                                                    </Link>
                                                </Button>
                                                <BotonEstado
                                                    url={`/peliculas/${pelicula.id}/estado`}
                                                    activo={pelicula.estado}
                                                />
                                                {(pelicula.funciones_count ??
                                                    0) > 0 ? null : (
                                                    <BotonEliminar
                                                        url={`/peliculas/${pelicula.id}`}
                                                        nombre={pelicula.titulo}
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

                <Paginacion paginador={peliculas} />
            </Pagina>
        </>
    );
}

ListadoPeliculas.layout = {
    breadcrumbs: [
        {
            title: 'Películas',
            href: '/peliculas',
        },
    ],
};
