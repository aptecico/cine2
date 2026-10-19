import { Head } from '@inertiajs/react';
import { Encabezado } from '@/components/cine/encabezado';
import { Pagina } from '@/components/cine/pagina';
import { PeliculaForm } from '@/components/cine/pelicula-form';
import type { Clasificaciones } from '@/types/cine';

/** Formulario vacío. Al enviarlo, el navegador hace POST /peliculas. */
export default function CrearPelicula({
    generos,
    clasificaciones,
}: {
    generos: string[];
    clasificaciones: Clasificaciones;
}) {
    return (
        <>
            <Head title="Nueva película" />
            <Pagina>
                <div className="mx-auto w-full max-w-3xl space-y-6">
                    <Encabezado
                        titulo="Nueva película"
                        descripcion="Completa los datos. Si falta algo obligatorio, Laravel devuelve el formulario con el error al lado del campo."
                    />
                    <PeliculaForm
                        generos={generos}
                        clasificaciones={clasificaciones}
                    />
                </div>
            </Pagina>
        </>
    );
}

CrearPelicula.layout = {
    breadcrumbs: [
        { title: 'Películas', href: '/peliculas' },
        { title: 'Nueva', href: '/peliculas/create' },
    ],
};
