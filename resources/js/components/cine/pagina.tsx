import type { ReactNode } from 'react';

/** Margen común de las pantallas del cine. */
export function Pagina({ children }: { children: ReactNode }) {
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
            {children}
        </div>
    );
}
