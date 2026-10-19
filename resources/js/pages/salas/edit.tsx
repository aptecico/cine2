import { Head } from '@inertiajs/react';
import { Encabezado } from '@/components/cine/encabezado';
import { Pagina } from '@/components/cine/pagina';
import { SalaForm } from '@/components/cine/sala-form';
import type { Sala } from '@/types/cine';

export default function EditarSala({ sala }: { sala: Sala }) {
    return (
        <>
            <Head title={`Editar ${sala.nombre}`} />
            <Pagina>
                <div className="mx-auto w-full max-w-xl space-y-6">
                    <Encabezado
                        titulo="Editar sala"
                        descripcion={`Estás cambiando el registro #${sala.id}.`}
                    />
                    <SalaForm sala={sala} />
                </div>
            </Pagina>
        </>
    );
}

EditarSala.layout = {
    breadcrumbs: [
        { title: 'Salas', href: '/salas' },
        { title: 'Editar', href: '/salas' },
    ],
};
