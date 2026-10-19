import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';

export const controlClass =
    'border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]';

/**
 * Junta las cuatro piezas de un campo: etiqueta, control, ayuda y error.
 * El error llega desde Laravel cuando la validación rechaza el dato.
 */
export function Campo({
    id,
    etiqueta,
    error,
    ayuda,
    children,
}: {
    id: string;
    etiqueta: string;
    error?: string;
    ayuda?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{etiqueta}</Label>
            {children}
            {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
            <InputError message={error} />
        </div>
    );
}
