import { router } from '@inertiajs/react';
import { Power, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Estos botones no navegan a otra página.
 * Le piden a Inertia que envíe PATCH o DELETE a la URL del controlador.
 *
 * PATCH /peliculas/3/estado  -> toggleEstado
 * DELETE /peliculas/3        -> destroy
 */
export function BotonEstado({ url, activo }: { url: string; activo: boolean }) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.patch(url, {}, { preserveScroll: true })}
        >
            <Power />
            {activo ? 'Desactivar' : 'Activar'}
        </Button>
    );
}

export function BotonEliminar({
    url,
    nombre,
}: {
    url: string;
    nombre: string;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
                const seguro = confirm(
                    `¿Eliminar «${nombre}»? Esta acción no se puede deshacer.`,
                );

                if (seguro) {
                    router.delete(url);
                }
            }}
        >
            <Trash2 />
            Eliminar
        </Button>
    );
}
