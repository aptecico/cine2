import { Head } from '@inertiajs/react';
import { Encabezado } from '@/components/cine/encabezado';
import { FuncionForm } from '@/components/cine/funcion-form';
import { Pagina } from '@/components/cine/pagina';
import type { Funcion, OpcionPelicula, OpcionSala } from '@/types/cine';

export default function EditarFuncion({
    funcion,
    peliculas,
    salas,
}: {
    funcion: Funcion;
    peliculas: OpcionPelicula[];
    salas: OpcionSala[];
}) {
    return (
        <>
            <Head title="Editar función" />
            <Pagina>
                <div className="mx-auto w-full max-w-3xl space-y-6">
                    <Encabezado
                        titulo="Editar función"
                        descripcion="Al guardar se vuelve a revisar el cruce. Esta función no se choca consigo misma."
                    />
                    <FuncionForm
                        funcion={funcion}
                        peliculas={peliculas}
                        salas={salas}
                    />
                </div>
            </Pagina>
        </>
    );
}

EditarFuncion.layout = {
    breadcrumbs: [
        { title: 'Funciones', href: '/funciones' },
        { title: 'Editar', href: '/funciones' },
    ],
};
