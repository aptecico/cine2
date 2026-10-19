/**
 * Formas de los datos que Laravel envía a React.
 * No son las tablas: son el JSON que llega a la página.
 * Si agregas una columna y quieres verla, primero ponla en $fillable
 * y luego agrégala aquí para que TypeScript la reconozca.
 */

export type Paginador<T> = {
    data: T[];
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type Clasificaciones = Record<string, string>;

export type Pelicula = {
    id: number;
    titulo: string;
    slug: string;
    sinopsis: string;
    imagen: string | null;
    duracion_minutos: number;
    genero: string;
    clasificacion: string;
    director: string | null;
    anio: number | null;
    fecha_estreno: string | null;
    estado: boolean;
    funciones_count?: number;
    funciones?: Funcion[];
};

export type Sala = {
    id: number;
    nombre: string;
    capacidad: number;
    estado: boolean;
    funciones_count?: number;
    funciones?: Funcion[];
};

export type Funcion = {
    id: number;
    pelicula_id: number;
    sala_id: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    precio: string;
    estado: boolean;
    pelicula?: Pelicula;
    sala?: Sala;
};

export type OpcionPelicula = Pick<
    Pelicula,
    'id' | 'titulo' | 'duracion_minutos' | 'estado'
>;

export type OpcionSala = Pick<Sala, 'id' | 'nombre' | 'capacidad' | 'estado'>;
