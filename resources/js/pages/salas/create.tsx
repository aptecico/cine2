import { Head } from '@inertiajs/react';
import { Encabezado } from '@/components/cine/encabezado';
import { Pagina } from '@/components/cine/pagina';
import { SalaForm } from '@/components/cine/sala-form';

export default function CrearSala() {
    return (
        <>
            <Head title="Nueva sala" />
            <Pagina>
                <div className="mx-auto w-full max-w-xl space-y-6">
                    <Encabezado
                        titulo="Nueva sala"
                        descripcion="El nombre identifica la sala y la capacidad dice cuántas personas caben."
                    />
                    <SalaForm />
                </div>
            </Pagina>
        </>
    );
}

CrearSala.layout = {
    breadcrumbs: [
        { title: 'Salas', href: '/salas' },
        { title: 'Nueva', href: '/salas/create' },
    ],
};
