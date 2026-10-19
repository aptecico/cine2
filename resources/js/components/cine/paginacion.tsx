import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { Paginador } from '@/types/cine';

/**
 * Laravel parte el listado en páginas.
 * prev_page_url y next_page_url ya traen los filtros de la búsqueda.
 */
export function Paginacion<T>({ paginador }: { paginador: Paginador<T> }) {
    if (paginador.total === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
                Mostrando {paginador.from}–{paginador.to} de {paginador.total}
            </p>
            <div className="flex gap-2">
                {paginador.prev_page_url && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={paginador.prev_page_url} preserveScroll>
                            Anterior
                        </Link>
                    </Button>
                )}
                {paginador.next_page_url && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={paginador.next_page_url} preserveScroll>
                            Siguiente
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
