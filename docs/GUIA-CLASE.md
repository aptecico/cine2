# Guía de clase: CRUD del cine

Esta guía está para leerla en voz alta. El código repite la misma idea en tres módulos: películas, salas y funciones.

## La idea en una frase

El cine guarda **qué** se proyecta, **dónde** cabe el público y **cuándo** pasa cada función. Una sala no puede tener dos funciones activas al mismo tiempo.

## Las tres tablas

```
peliculas                         salas
-----------                       -----------
id                                id
titulo, sinopsis                  nombre
duracion_minutos                  capacidad
genero, clasificacion             estado
estado
        \                         /
         \                       /
          funciones
          -----------
          id
          pelicula_id   -> apunta a una película
          sala_id       -> apunta a una sala
          fecha
          hora_inicio
          hora_fin      -> no la escribe el usuario
          precio
          estado
```

`pelicula_id` y `sala_id` son llaves foráneas. Dicen: esta fila de funciones no existe sola; necesita una película y una sala que ya estén guardadas.

Por eso no se puede borrar una película si todavía tiene funciones. Primero se borra o se deja la función, o se desactiva la película.

## Qué es un CRUD

CRUD son las cuatro operaciones de un registro:

| Letra | En español | Método del controlador | Cómo viaja |
| --- | --- | --- | --- |
| Create | Crear | `store` | POST |
| Read | Leer | `index` y `show` | GET |
| Update | Editar | `update` | PUT |
| Delete | Eliminar | `destroy` | DELETE |

Hay una quinta acción que no borra: **activar o desactivar**. El registro sigue en la base de datos y `estado` pasa de verdadero a falso. En el menú ese botón llama a `toggleEstado`.

`create` y `edit` no guardan nada. Solo muestran el formulario.

## El viaje de un clic

Ejemplo: el estudiante pulsa "Registrar película".

1. El formulario de React envía `POST /peliculas`.
2. `routes/cine.php` ve esa URL y llama a `PeliculaController@store`.
3. Antes de entrar al método, `PeliculaRequest` revisa los datos. Si falta el título, se vuelve al formulario con el error. El controlador ni siquiera corre.
4. Si los datos sirven, `store` hace `Pelicula::create(...)`.
5. El modelo, al guardarse, arma el `slug` a partir del título.
6. Laravel responde "listo" y el navegador vuelve al listado.
7. React no arma el SQL. Solo dibuja el arreglo que el controlador le mandó.

Esa separación se puede decir así:

- **Ruta:** qué URL existe.
- **Form Request:** si los datos son aceptables.
- **Controlador:** qué hay que hacer.
- **Modelo:** cómo se llama la tabla y cómo se relaciona.
- **Página React:** cómo se ve.

## Mapa de archivos

Empieza por aquí, en este orden:

1. `routes/cine.php`
2. `app/Models/Pelicula.php`, `Sala.php`, `Funcion.php`
3. `app/Http/Requests/PeliculaRequest.php` y los otros dos
4. `app/Http/Controllers/PeliculaController.php` (el más comentado)
5. `resources/js/pages/peliculas/index.tsx`
6. `resources/js/components/cine/pelicula-form.tsx`

Salas y funciones repiten el mismo camino. Cuando el grupo ya entendió películas, en funciones solo hay que detenerse en la regla nueva: el cruce de horarios. Está en `Funcion::hayCruce()` y se usa desde `FuncionRequest`.

Un detalle de Laravel: pluraliza en inglés. Por eso el modelo `Funcion` declara `protected $table = 'funciones'` y la ruta fuerza el parámetro `{funcion}`. Si no, Laravel buscaría la tabla `funcions` y la URL `funciones/{funcione}`.

## Cómo explicar el cruce

Dos rangos se pisan cuando uno empieza antes de que el otro termine **y** termina después de que el otro empiece.

En la sala 1, el mismo día:

- 14:00–16:00 y 15:00–17:00 se cruzan.
- 14:00–16:00 y 16:00–18:00 no se cruzan. La segunda empieza cuando la primera termina.
- La misma hora en la sala 2 no estorba. El cruce mira la sala, no solo la hora.

La hora de fin no se pide. Se suma la duración de la película a la hora de inicio. Una función de 120 minutos que empieza a las 14:00 termina a las 16:00.

Si el resultado pasa de medianoche, no se guarda. Así la comparación cabe en un solo día y es más fácil de leer.

Solo las funciones **activas** ocupan la sala. Desactivar una función libera ese horario. Volver a activarla revisa otra vez, porque mientras estuvo apagada otra función pudo ocupar el lugar.

Los datos de ejemplo usan eso a propósito: *El viaje de Luna* y *Sombras del puerto* empiezan a las 14:00 el mismo día, una en la sala 1 y otra en la sala 2.

## Activar no es eliminar

| | Desactivar | Eliminar |
| --- | --- | --- |
| ¿Sigue en la base de datos? | Sí | No |
| ¿Se puede deshacer con un botón? | Sí, "Activar" | No |
| ¿Cuándo usarlo? | Ya no se programa, pero hubo funciones | Se creó por error y nadie la usa |

La base de datos también impide el borrado: la migración de funciones usa `restrictOnDelete`. Si el controlador se saltara la revisión, MySQL igual rechazaría borrar la película.

## Cómo probarlo en clase

1. En la carpeta del proyecto: `php artisan migrate` y `php artisan db:seed`.
2. Arranca la aplicación como ya lo hacen con Laragon o con `composer run dev`.
3. Entra con `test@example.com` y la contraseña `password`.
4. Recorre este orden, que es el que no se atasca:
   - Crea una película.
   - Crea una sala.
   - Programa una función.
   - Intenta otra función en la misma sala, una hora después de empezar la primera. Tiene que rechazarla.
   - Programa esa segunda función en otra sala, a la misma hora. Tiene que dejarla.
   - Intenta borrar la película. Tiene que negarse.
   - Desactívala. Sigue en el listado, con la etiqueta "Inactiva".

Las pruebas automáticas de esas reglas están en `tests/Feature/CineTest.php`. Se corren con `php artisan test --filter=CineTest`. Cada nombre de prueba es una frase que se puede leer en clase.

## Preguntas útiles

- ¿Por qué el formulario también marca campos obligatorios si Laravel vuelve a revisarlos? Porque el navegador avisa rápido, pero cualquiera puede saltarse esa revisión. La que manda es `PeliculaRequest`.
- ¿Por qué `hora_fin` está en `$fillable` si el usuario no la escribe? Porque `create()` solo guarda lo que está en esa lista, y quien la calcula es el controlador.
- ¿Por qué la página de React no tiene SQL? Porque el controlador ya consultó y le entregó el resultado en props.
- ¿Qué pasa si dos películas se llaman igual? El `slug` agrega `-2`, `-3`, y los dos registros conviven. El id sigue siendo distinto.

## Ejercicio para dejar de tarea

Agregar el campo **idioma** a las películas, sin copiar la solución en clase. El recorrido es el CRUD completo en pequeño:

1. Una migración que sume la columna `idioma` a `peliculas`.
2. Poner `idioma` en `$fillable` del modelo.
3. Pedirlo en `PeliculaRequest` (`required`, `string`, `max:40`).
4. Poner un input `name="idioma"` en `pelicula-form.tsx`.
5. Mostrarlo en el listado y en la ficha.
6. Agregar el idioma en `CineSeeder`.

Si eso funciona, entendieron el camino de un dato: tabla, modelo, validación, formulario y pantalla.
