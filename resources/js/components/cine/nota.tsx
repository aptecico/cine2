import type { ReactNode } from 'react';

/** Recuadro corto para explicar una regla sin salir del formulario. */
export function Nota({ children }: { children: ReactNode }) {
    return (
        <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
            {children}
        </p>
    );
}
