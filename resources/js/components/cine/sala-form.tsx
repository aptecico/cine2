import { Form, Link } from '@inertiajs/react';
import { Campo, controlClass } from '@/components/cine/campo';
import { Button } from '@/components/ui/button';
import type { Sala } from '@/types/cine';

/**
 * Crear: POST /salas
 * Editar: PUT /salas/{id}
 */
export function SalaForm({ sala }: { sala?: Sala }) {
    const editando = Boolean(sala);

    return (
        <Form
            action={editando ? `/salas/${sala?.id}` : '/salas'}
            method={editando ? 'put' : 'post'}
            className="space-y-6"
            key={sala?.id ?? 'nueva'}
        >
            {({ processing, errors }) => (
                <>
                    <Campo
                        id="nombre"
                        etiqueta="Nombre"
                        error={errors.nombre}
                        ayuda="Tiene que ser único. Por ejemplo: Sala 1."
                    >
                        <input
                            id="nombre"
                            name="nombre"
                            className={controlClass}
                            defaultValue={sala?.nombre}
                            required
                            maxLength={80}
                        />
                    </Campo>

                    <Campo
                        id="capacidad"
                        etiqueta="Capacidad"
                        error={errors.capacidad}
                        ayuda="Número de butacas. El mínimo es 1."
                    >
                        <input
                            id="capacidad"
                            name="capacidad"
                            type="number"
                            min={1}
                            max={2000}
                            className={controlClass}
                            defaultValue={sala?.capacidad}
                            required
                        />
                    </Campo>

                    <label className="flex items-start gap-3 text-sm">
                        <input
                            type="checkbox"
                            name="estado"
                            value="1"
                            defaultChecked={sala ? sala.estado : true}
                            className="mt-1 size-4"
                        />
                        <span>
                            <span className="font-medium">Sala activa</span>
                            <span className="mt-1 block text-muted-foreground">
                                Una sala inactiva no aparece al programar
                                funciones nuevas. Las funciones que ya tiene
                                siguen en la cartelera.
                            </span>
                        </span>
                    </label>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Guardando...'
                                : editando
                                  ? 'Guardar cambios'
                                  : 'Crear sala'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/salas">Cancelar</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
