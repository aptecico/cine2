import { Head, Link } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';
import { BotonEliminar, BotonEstado } from '@/components/cine/botones-crud';
import { Campo, controlClass } from '@/components/cine/campo';
import { Encabezado } from '@/components/cine/encabezado';
import { EstadoBadge } from '@/components/cine/estado-badge';
import { Pagina } from '@/components/cine/pagina';
import { Paginacion } from '@/components/cine/paginacion';
import { Button } from '@/components/ui/button';
import { formatFecha, formatPrecio, horaCorta } from '@/lib/cine';
import type { Funcion, Paginador, Sala } from '@/types/cine';

/**
 * Cartelera.
 * "Próximas" esconde lo que ya pasó. "Hoy" y "Todas" cambian ese recorte.
 * Buscar, fecha y sala se suman a ese recorte.
 */
export default function ListadoFunciones({
    funciones,
    salas,
    filtros,
}: {
    funciones: Paginador<Funcion>;
    salas: Pick<Sala, 'id' | 'nombre'>[];
    filtros: {
        buscar: string;
        fecha: string;
        sala_id: string;
        periodo: string;
    };
}) {
    return (
        <>
            <Head title="Funciones" />
            <Pagina>
                <Encabezado
                    titulo="Funciones"
                    descripcion="La programación junta una película, una sala, una fecha y un precio. Dos funciones activas no pueden cruzarse en la misma sala."
                    accion={
                        <Button asChild>
                            <Link href="/funciones/create">
                                <Plus />
                                Nueva función
                            </Link>
                        </Button>
                    }
                />

                <form
                    method="get"
                    action="/funciones"
                    className="grid gap-4 rounded-xl border p-4 md:grid-cols-2 xl:grid-cols-[1fr_160px_180px_160px_auto]"
                >
                    <Campo id="buscar" etiqueta="Película">
                        <input
                            id="buscar"
                            name="buscar"
                            className={controlClass}
                            defaultValue={filtros.buscar}
                            placeholder="Título"
                        />
                    </Campo>
                    <Campo id="fecha" etiqueta="Día exacto">
                        <input
                            id="fecha"
                            name="fecha"
                            type="date"
                            className={controlClass}
                            defaultValue={filtros.fecha}
                        />
                    </Campo>
                    <Campo id="sala_id" etiqueta="Sala">
                        <select
                            id="sala_id"
                            name="sala_id"
                            className={controlClass}
                            defaultValue={filtros.sala_id}
                        >
                            <option value="">Todas</option>
                            {salas.map((sala) => (
                                <option key={sala.id} value={sala.id}>
                                    {sala.nombre}
                                </option>
                            ))}
                        </select>
                    </Campo>
                    <Campo id="periodo" etiqueta="Periodo">
                        <select
                            id="periodo"
                            name="periodo"
                            className={controlClass}
                            defaultValue={filtros.periodo}
                        >
                            <option value="proximas">Próximas</option>
                            <option value="hoy">Hoy</option>
                            <option value="todas">Todas</option>
                        </select>
                    </Campo>
                    <div className="flex items-end gap-2">
                        <Button type="submit">Consultar</Button>
                        <Button variant="outline" asChild>
                            <Link href="/funciones">Limpiar</Link>
                        </Button>
                    </div>
                </form>

                {funciones.data.length === 0 ? (
                    <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                        No hay funciones con esos filtros.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full min-w-[860px] text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Cuándo
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Película
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Sala
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Precio
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
                                {funciones.data.map((funcion) => (
                                    <tr key={funcion.id} className="border-t">
                                        <td className="px-4 py-3">
                                            <p>{formatFecha(funcion.fecha)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {horaCorta(funcion.hora_inicio)}{' '}
                                                a {horaCorta(funcion.hora_fin)}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {funcion.pelicula?.titulo}
                                        </td>
                                        <td className="px-4 py-3">
                                            {funcion.sala?.nombre}
                                        </td>
                                        <td className="px-4 py-3">
                                            {formatPrecio(funcion.precio)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <EstadoBadge
                                                activo={funcion.estado}
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
                                                        href={`/funciones/${funcion.id}`}
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
                                                        href={`/funciones/${funcion.id}/edit`}
                                                    >
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
                                                    nombre={`${funcion.pelicula?.titulo ?? 'función'} en ${funcion.sala?.nombre ?? 'la sala'}`}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Paginacion paginador={funciones} />
            </Pagina>
        </>
    );
}

ListadoFunciones.layout = {
    breadcrumbs: [{ title: 'Funciones', href: '/funciones' }],
};
