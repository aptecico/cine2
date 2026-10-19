import { Badge } from '@/components/ui/badge';

/** Activa = se puede usar. Inactiva = sigue guardada, pero no se ofrece. */
export function EstadoBadge({ activo }: { activo: boolean }) {
    return (
        <Badge variant={activo ? 'default' : 'secondary'}>
            {activo ? 'Activa' : 'Inactiva'}
        </Badge>
    );
}
