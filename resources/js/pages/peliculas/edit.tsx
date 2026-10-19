import { Head } from '@inertiajs/react';
import { Encabezado } from '@/components/cine/encabezado';
import { Pagina } from '@/components/cine/pagina';
import { PeliculaForm } from '@/components/cine/pelicula-form';
import type { Clasificaciones, Pelicula } from '@/types/cine';

/** El mismo formulario de crear, ahora con los datos de una película. */
export default function EditarPelicula({
    pelicula,
    generos,
    clasificaciones,
}: {
    pelicula: Pelicula;
    generos: string[];
    clasificaciones: Clasificaciones;
}) {
    return (
        <>
            <Head title={`Editar ${pelicula.titulo}`} />
            <Pagina>
                <div className="mx-auto w-full max-w-3xl space-y-6">
                    <Encabezado
                        titulo="Editar película"
                        descripcion={`Estás cambiando el registro #${pelicula.id}. El slug de la URL se actualiza si cambias el título.`}
                    />
                    <PeliculaForm
                        pelicula={pelicula}
                        generos={generos}
                        clasificaciones={clasificaciones}
                    />
                </div>
            </Pagina>
        </>
    );
}

EditarPelicula.layout = {
    breadcrumbs: [
        { title: 'Películas', href: '/peliculas' },
        { title: 'Editar', href: '/peliculas' },
    ],
};
