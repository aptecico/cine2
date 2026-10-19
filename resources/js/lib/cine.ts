/**
 * Textos y cuentas que la pantalla necesita.
 * Ninguna de estas funciones guarda datos: solo los presentan.
 * La hora de fin verdadera se calcula en app/Models/Funcion.php.
 */

export function horaCorta(hora: string): string {
    return hora.slice(0, 5);
}

export function minutosATexto(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;

    if (horas === 0) {
        return `${resto} min`;
    }

    if (resto === 0) {
        return `${horas} h`;
    }

    return `${horas} h ${resto} min`;
}

export function formatFecha(fecha: string): string {
    const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number);

    return new Date(anio, mes - 1, dia).toLocaleDateString('es-CO', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatPrecio(valor: string | number): string {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(Number(valor));
}

/**
 * Pista visual: hora de inicio + duración.
 * Devuelve null si el resultado cae al día siguiente.
 */
export function vistaPreviaFin(
    horaInicio: string,
    minutos: number,
): string | null {
    if (!/^\d{2}:\d{2}/.test(horaInicio) || minutos < 1) {
        return null;
    }

    const [horas, mins] = horaInicio.split(':').map(Number);
    const total = horas * 60 + mins + minutos;

    if (total >= 24 * 60) {
        return null;
    }

    const horaFin = Math.floor(total / 60);
    const minutoFin = total % 60;

    return `${String(horaFin).padStart(2, '0')}:${String(minutoFin).padStart(2, '0')}`;
}
