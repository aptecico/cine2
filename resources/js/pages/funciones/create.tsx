import { Head } from '@inertiajs/react';
import { Encabezado } from '@/components/cine/encabezado';
import { FuncionForm } from '@/components/cine/funcion-form';
import { Pagina } from '@/components/cine/pagina';
import type { OpcionPelicula, OpcionSala } from '@/types/cine';

export default function CrearFuncion({
    peliculas,
    salas,
}: {
    peliculas: OpcionPelicula[];
    salas: OpcionSala[];
}) {
    return (
        <>
            <Head title="Nueva función" />
            <Pagina>
                <div className="mx-auto w-full max-w-3xl space-y-6">
                    <Encabezado
                        titulo="Programar función"
                        descripcion="Elige película, sala, día, hora y precio. El sistema calcula la hora de fin y rechaza el horario si la sala ya está ocupada."
                    />
                    <FuncionForm peliculas={peliculas} salas={salas} />
                </div>
            </Pagina>
        </>
    );
}

CrearFuncion.layout = {
    breadcrumbs: [
        { title: 'Funciones', href: '/funciones' },
        { title: 'Nueva', href: '/funciones/create' },
    ],
};
