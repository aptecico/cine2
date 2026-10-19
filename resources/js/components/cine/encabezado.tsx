import type { ReactNode } from 'react';

export function Encabezado({
    titulo,
    descripcion,
    accion,
}: {
    titulo: string;
    descripcion: string;
    accion?: ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {titulo}
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                    {descripcion}
                </p>
            </div>
            {accion}
        </div>
    );
}
