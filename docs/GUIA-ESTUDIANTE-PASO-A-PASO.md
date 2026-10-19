# Laboratorio: sistema de cine (CRUD completo)

**Materia:** Lenguaje de programación avanzado 2  
**Cómo usar esta guía:** continúa después del documento *Creación de proyecto laravel.docx*.  
Ahí ya creaste el proyecto, instalaste dependencias, configuraste MySQL y empezaste el módulo de películas (`php artisan make:model Pelicula -mrc`).

Esta guía te lleva, **paso a paso**, hasta terminar los tres módulos:

1. Películas  
2. Salas  
3. Funciones (con regla: no se cruzan en la misma sala)

Trabaja en orden. No saltes a React hasta que el backend de cada módulo responda bien.

---

## Antes de empezar

### Qué debes tener listo (de la guía anterior)

- [ ] Proyecto Laravel creado (por ejemplo `cine` o `cine2`)
- [ ] `npm install` y `composer` ya corridos
- [ ] Inertia + React funcionando
- [ ] Base de datos MySQL creada y configurada en `.env`
- [ ] Usuario de prueba con el que puedas iniciar sesión
- [ ] Modelo/migración/controlador de `Pelicula` generados con:

```bash
php artisan make:model Pelicula -mrc
```

### Cómo trabajar en clase

1. Abre **dos ventanas**: el editor (Cursor / VS Code) y la terminal de Laragon.
2. En la terminal usa **PHP 8.3 o superior** (Laravel 13 no corre en PHP 7).
3. Para desarrollo:

```bash
composer run dev
```

o, si prefieres por separado:

```bash
php artisan serve
npm run dev
```

4. Cada vez que termines un paso marcado como **CHECKPOINT**, prueba en el navegador o con `php artisan route:list`.

### Idea del sistema (léela en voz alta)

| Módulo | Pregunta que responde | Tabla |
|--------|------------------------|--------|
| Películas | ¿Qué se proyecta? | `peliculas` |
| Salas | ¿Dónde cabe el público? | `salas` |
| Funciones | ¿Cuándo y a qué precio? | `funciones` |

Una **función** une película + sala + fecha/hora + precio.  
Dos funciones **activas** no pueden ocupar la misma sala al mismo tiempo.

---

# FASE 0 — Entender el CRUD

CRUD = Create, Read, Update, Delete.

| Acción | Método HTTP | Método del controlador | ¿Guarda datos? |
|--------|-------------|------------------------|----------------|
| Listar | GET | `index` | No |
| Formulario nuevo | GET | `create` | No |
| Guardar nuevo | POST | `store` | Sí |
| Ver uno | GET | `show` | No |
| Formulario editar | GET | `edit` | No |
| Guardar cambios | PUT | `update` | Sí |
| Eliminar | DELETE | `destroy` | Sí |

Además usamos **activar / desactivar** (`toggleEstado`): el registro no se borra; solo cambia `estado` a `true` o `false`.

**Viaje de un clic (película):**

1. React envía `POST /peliculas`
2. La ruta llama a `PeliculaController@store`
3. `PeliculaRequest` valida los datos
4. El modelo guarda en MySQL
5. Laravel redirige al listado
6. React muestra lo que el controlador le envió (props)

---

# FASE 1 — Base de datos

## Paso 1.1 — Completar la migración de películas

Abre el archivo en `database/migrations/..._create_peliculas_table.php` y déjalo así:

```php
Schema::create('peliculas', function (Blueprint $table) {
    $table->id();
    $table->string('titulo', 150);
    $table->string('slug', 180)->unique();
    $table->text('sinopsis');
    $table->string('imagen')->nullable();
    $table->unsignedSmallInteger('duracion_minutos');
    $table->string('genero', 50);
    $table->string('clasificacion', 10);
    $table->string('director', 120)->nullable();
    $table->unsignedSmallInteger('anio')->nullable();
    $table->date('fecha_estreno')->nullable();
    $table->boolean('estado')->default(true);
    $table->timestamps();
});
```

**Qué significa:**

- `nullable()` = puede quedar vacío  
- `unique()` = no se repite  
- `estado` = `true` activa, `false` inactiva (desactivar sin borrar)  
- `slug` = versión del título para URL; **no** lo pide el formulario, lo arma el modelo

## Paso 1.2 — Crear modelo, migración y controlador de salas

```bash
php artisan make:model Sala -mrc
```

Eso crea:

- `app/Models/Sala.php`
- `database/migrations/..._create_salas_table.php`
- `app/Http/Controllers/SalaController.php`

En la migración de salas:

```php
Schema::create('salas', function (Blueprint $table) {
    $table->id();
    $table->string('nombre', 80)->unique();
    $table->unsignedSmallInteger('capacidad');
    $table->boolean('estado')->default(true);
    $table->timestamps();
});
```

## Paso 1.3 — Crear modelo, migración y controlador de funciones

```bash
php artisan make:model Funcion -mrc
```

En la migración de funciones:

```php
Schema::create('funciones', function (Blueprint $table) {
    $table->id();
    $table->foreignId('pelicula_id')->constrained('peliculas')->restrictOnDelete();
    $table->foreignId('sala_id')->constrained('salas')->restrictOnDelete();
    $table->date('fecha');
    $table->time('hora_inicio');
    $table->time('hora_fin');
    $table->decimal('precio', 8, 2);
    $table->boolean('estado')->default(true);
    $table->timestamps();

    $table->index(['sala_id', 'fecha']);
});
```

**Importante:**

- `pelicula_id` y `sala_id` son llaves foráneas.
- `restrictOnDelete` = MySQL no deja borrar una película/sala si aún tiene funciones.
- `hora_fin` **no** la escribe el estudiante en el formulario: se calcula con la duración de la película.

## Paso 1.4 — Ejecutar migraciones

```bash
php artisan migrate
```

**CHECKPOINT:** en MySQL / HeidiSQL / phpMyAdmin deben existir las tablas `peliculas`, `salas` y `funciones`.

Si algo falla, lee el mensaje: casi siempre es un typo en el nombre de la tabla o el orden de las migraciones (primero películas y salas, después funciones).

---

# FASE 2 — Modelos

Los modelos son la “puerta” a cada tabla.

## Paso 2.1 — Modelo `Pelicula`

Archivo: `app/Models/Pelicula.php`

Debes incluir:

1. `protected $table = 'peliculas';`
2. Constantes `GENEROS` y `CLASIFICACIONES` (listas del formulario)
3. `$fillable` con los campos que se pueden guardar
4. `casts()` para `estado` (boolean), duración, año y fecha
5. Al guardar (`saving`), generar el `slug` único con `Str::slug()`
6. Relación: `funciones()` → `hasMany(Funcion::class)`
7. Scope `activas()` → `where('estado', true)`

Referencia completa del proyecto: `app/Models/Pelicula.php`.

## Paso 2.2 — Modelo `Sala`

Archivo: `app/Models/Sala.php`

```php
protected $table = 'salas';

protected $fillable = ['nombre', 'capacidad', 'estado'];

protected function casts(): array
{
    return [
        'estado' => 'boolean',
        'capacidad' => 'integer',
    ];
}

public function scopeActivas($query)
{
    return $query->where('estado', true);
}

public function funciones()
{
    return $this->hasMany(Funcion::class);
}
```

## Paso 2.3 — Modelo `Funcion` (el más importante)

Archivo: `app/Models/Funcion.php`

Obligatorio:

```php
protected $table = 'funciones'; // sin esto Laravel buscaría "funcions"
```

También:

- `$fillable` con `pelicula_id`, `sala_id`, `fecha`, `hora_inicio`, `hora_fin`, `precio`, `estado`
- Relaciones `pelicula()` y `sala()` (`belongsTo`)
- Método `normalizarHora()` → convierte `14:00` en `14:00:00`
- Método `calcularHoraFin($horaInicio, $duracionMinutos)` → suma minutos; si pasa de medianoche, `null`
- Método `hayCruce(...)` → la regla del cine:

```
existe.inicio < nuevo.fin  Y  existe.fin > nuevo.inicio
```

Solo cuentan funciones **activas** de la **misma sala** y el **mismo día**.

**Ejemplos para explicar:**

| Sala | Horario A | Horario B | ¿Se cruzan? |
|------|-----------|-----------|-------------|
| 1 | 14:00–16:00 | 15:00–17:00 | Sí |
| 1 | 14:00–16:00 | 16:00–18:00 | No (una termina cuando la otra empieza) |
| 1 y 2 | 14:00–16:00 | 14:00–16:00 | No (salas distintas) |

Referencia completa: `app/Models/Funcion.php`.

**CHECKPOINT:** en `php artisan tinker`:

```php
App\Models\Funcion::calcularHoraFin('14:00', 120); // "16:00:00"
```

---

# FASE 3 — Validación (Form Requests)

El formulario del navegador se puede saltar. La validación real vive en el servidor.

## Paso 3.1 — Crear las tres clases

```bash
php artisan make:request PeliculaRequest
php artisan make:request SalaRequest
php artisan make:request FuncionRequest
```

En las tres: `authorize()` debe devolver `true` (la ruta ya exige login).

## Paso 3.2 — `PeliculaRequest`

Reglas mínimas:

- `titulo` required, max 150  
- `sinopsis` required  
- `duracion_minutos` required, integer, min 1  
- `genero` in: lista de `Pelicula::GENEROS`  
- `clasificacion` in: claves de `Pelicula::CLASIFICACIONES`  
- `director`, `anio`, `fecha_estreno`, `imagen` nullable  

Agrega mensajes en español en `messages()`.

## Paso 3.3 — `SalaRequest`

- `nombre` required, unique en `salas` (ignorar la sala actual al editar)  
- `capacidad` required, integer, min 1  

## Paso 3.4 — `FuncionRequest`

Reglas base: `pelicula_id`, `sala_id`, `fecha`, `hora_inicio` (formato `H:i`), `precio`.

En `withValidator()` (después de las reglas):

1. Película y sala deben existir y estar **activas**.
2. Calcular `hora_fin` con `Funcion::calcularHoraFin`.
3. Si `hora_fin` es `null` → error (pasaría de medianoche).
4. Si la función quedará activa y `Funcion::hayCruce(...)` es true → error.
5. Guardar `hora_fin` con `$this->merge(['hora_fin' => $horaFin])` para el controlador.

Referencias: `app/Http/Requests/`.

---

# FASE 4 — Controladores

Ya tienes los controladores vacíos. Complétalos método por método.

## Paso 4.1 — `PeliculaController` (hazlo primero; es el modelo mental)

| Método | Qué hace |
|--------|----------|
| `index` | Lista con búsqueda (`buscar`, `genero`, `estado`) y paginación |
| `create` | Muestra formulario vacío + listas de géneros/clasificaciones |
| `store` | Valida con `PeliculaRequest`, crea, flash de éxito, redirige a index |
| `show` | Muestra una película y sus últimas funciones |
| `edit` | Formulario con datos actuales |
| `update` | Actualiza y redirige a show |
| `destroy` | Si tiene funciones → no borra; si no → `delete()` |
| `toggleEstado` | Invierte `estado` |

Patrón de `store`:

```php
public function store(PeliculaRequest $request): RedirectResponse
{
    Pelicula::query()->create([
        ...$request->validated(),
        'estado' => $request->boolean('estado'),
    ]);

    Inertia::flash('toast', [
        'type' => 'success',
        'message' => 'Película registrada.',
    ]);

    return to_route('peliculas.index');
}
```

`index` debe devolver:

```php
return Inertia::render('peliculas/index', [
    'peliculas' => $peliculas,
    'generos' => Pelicula::GENEROS,
    'clasificaciones' => Pelicula::CLASIFICACIONES,
    'filtros' => [...],
]);
```

Eso significa: React buscará el archivo `resources/js/pages/peliculas/index.tsx`.

## Paso 4.2 — `SalaController`

Copia la misma estructura que películas, cambiando nombres y campos (`nombre`, `capacidad`).

## Paso 4.3 — `FuncionController`

Igual que los anteriores, pero:

- En `store`/`update` guarda también `hora_fin` (ya viene del Request).
- En `create`/`edit` manda listas de películas y salas **activas**.
- En `toggleEstado`, si vas a activar, vuelve a llamar `hayCruce`.

## Paso 4.4 — `DashboardController` (opcional pero útil)

```bash
php artisan make:controller DashboardController
```

Cuenta películas, salas y funciones, y lista las próximas 5 funciones activas.  
Renderiza `dashboard`.

Referencias: `app/Http/Controllers/`.

---

# FASE 5 — Rutas

## Paso 5.1 — Crear `routes/cine.php`

```php
<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FuncionController;
use App\Http\Controllers\PeliculaController;
use App\Http\Controllers\SalaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::patch('peliculas/{pelicula}/estado', [PeliculaController::class, 'toggleEstado'])
        ->name('peliculas.estado');
    Route::resource('peliculas', PeliculaController::class);

    Route::patch('salas/{sala}/estado', [SalaController::class, 'toggleEstado'])
        ->name('salas.estado');
    Route::resource('salas', SalaController::class);

    Route::patch('funciones/{funcion}/estado', [FuncionController::class, 'toggleEstado'])
        ->name('funciones.estado');

    // Laravel pluraliza en inglés: "funciones" → "funcione". Lo corregimos:
    Route::resource('funciones', FuncionController::class)
        ->parameters(['funciones' => 'funcion']);
});
```

## Paso 5.2 — Incluirlo desde `routes/web.php`

En `web.php`, después de la ruta de inicio (welcome), agrega:

```php
require __DIR__.'/cine.php';
```

Quita o reemplaza el `Route::inertia('dashboard', ...)` viejo si chocaba con el nuevo dashboard.

## Paso 5.3 — Ver las rutas

```bash
php artisan route:list --path=peliculas
php artisan route:list --path=salas
php artisan route:list --path=funciones
```

**CHECKPOINT:** debes ver `index`, `create`, `store`, `show`, `edit`, `update`, `destroy` y `estado` en cada módulo.

---

# FASE 6 — Frontend (React + Inertia)

Orden recomendado:

1. Tipos TypeScript  
2. Utilidades y componentes compartidos  
3. Formularios  
4. Páginas de películas  
5. Páginas de salas (misma idea)  
6. Páginas de funciones  
7. Menú lateral  

## Paso 6.1 — Tipos

Crea `resources/js/types/cine.ts` con tipos `Pelicula`, `Sala`, `Funcion`, `Paginador`, etc.  
(Referencia: el archivo del mismo nombre en este proyecto.)

## Paso 6.2 — Utilidades

Crea `resources/js/lib/cine.ts` con:

- `horaCorta`, `minutosATexto`, `formatFecha`, `formatPrecio`
- `vistaPreviaFin` (solo ayuda visual; la verdad la calcula PHP)

## Paso 6.3 — Componentes compartidos

Carpeta: `resources/js/components/cine/`

| Archivo | Para qué |
|---------|----------|
| `pagina.tsx` | Contenedor con margen |
| `encabezado.tsx` | Título + descripción + botón |
| `campo.tsx` | Label + input + error de Laravel |
| `estado-badge.tsx` | Activa / Inactiva |
| `paginacion.tsx` | Anterior / Siguiente |
| `botones-crud.tsx` | Activar y Eliminar con `router.patch` / `router.delete` |
| `nota.tsx` | Texto explicativo en el formulario |
| `pelicula-form.tsx` | Formulario crear/editar película |
| `sala-form.tsx` | Formulario sala |
| `funcion-form.tsx` | Formulario función (muestra hora de fin estimada) |

**Regla del formulario Inertia:**

```tsx
<Form
  action={editando ? `/peliculas/${pelicula.id}` : '/peliculas'}
  method={editando ? 'put' : 'post'}
>
```

El checkbox `estado` usa `name="estado"` y `value="1"`.  
Si no está marcado, Laravel recibe “apagado” y lo guardas con `$request->boolean('estado')`.

## Paso 6.4 — Páginas de películas

Crea la carpeta `resources/js/pages/peliculas/`:

| Archivo | Ruta que lo usa |
|---------|-----------------|
| `index.tsx` | GET `/peliculas` |
| `create.tsx` | GET `/peliculas/create` |
| `edit.tsx` | GET `/peliculas/{id}/edit` |
| `show.tsx` | GET `/peliculas/{id}` |

En `index.tsx`:

- Formulario de búsqueda con `method="get"` (no es Inertia Form)
- Tabla con Ver / Editar / Desactivar / Eliminar
- No muestres Eliminar si `funciones_count > 0`

Cada página puede definir migas de pan:

```tsx
ListadoPeliculas.layout = {
  breadcrumbs: [{ title: 'Películas', href: '/peliculas' }],
};
```

## Paso 6.5 — Páginas de salas

Crea `resources/js/pages/salas/` igual que películas (`index`, `create`, `edit`, `show`), usando `SalaForm`.

## Paso 6.6 — Páginas de funciones

Crea `resources/js/pages/funciones/`.

En el formulario:

- Select de película y sala
- Fecha, hora de inicio, precio
- Texto de ayuda: “Termina aproximadamente a las …”
- Explicar en una nota la regla del cruce

## Paso 6.7 — Dashboard

Reemplaza `resources/js/pages/dashboard.tsx` para mostrar contadores y próximas funciones (props de `DashboardController`).

## Paso 6.8 — Menú lateral

En `resources/js/components/app-sidebar.tsx` agrega enlaces:

- Inicio → `/dashboard`
- Películas → `/peliculas`
- Salas → `/salas`
- Funciones → `/funciones`

Opcional: cambia el logo a “Cine”.

**CHECKPOINT:** con `npm run dev` activo, inicia sesión y abre cada enlace del menú. No debe aparecer pantalla en blanco ni error 500.

---

# FASE 7 — Datos de ejemplo (seeder)

## Paso 7.1 — Crear seeder

```bash
php artisan make:seeder CineSeeder
```

En `CineSeeder`:

1. Crea 4–5 películas (una inactiva a propósito).
2. Crea 3 salas (una inactiva).
3. Crea funciones de ejemplo **sin cruces** (misma hora solo en salas distintas).

## Paso 7.2 — Llamarlo desde `DatabaseSeeder`

```php
User::query()->updateOrCreate(
    ['email' => 'test@example.com'],
    [
        'name' => 'Estudiante',
        'password' => Hash::make('password'),
        'email_verified_at' => now(),
    ],
);

$this->call(CineSeeder::class);
```

## Paso 7.3 — Ejecutar

```bash
php artisan db:seed
```

**Usuario de práctica:** `test@example.com` / `password`

---

# FASE 8 — Prueba manual (entrega)

Haz estas pruebas y anota el resultado:

### Películas

1. Registrar una película con todos los campos.  
2. Buscarla por título.  
3. Editar la sinopsis.  
4. Desactivarla → no debe aparecer al programar funciones.  
5. Intentar eliminarla si tiene funciones → debe rechazarlo.  

### Salas

6. Crear “Sala A” con capacidad 50.  
7. Intentar otra con el mismo nombre → error.  
8. Desactivar la sala → no debe salir al crear funciones.  

### Funciones

9. Programar película activa en sala activa a las 14:00.  
10. Otra en la **misma sala** a las 15:00 con duración que se cruce → **debe fallar**.  
11. La misma hora en **otra sala** → **debe funcionar**.  
12. Una que empiece a las 23:30 con 120 minutos → **debe fallar** (medianoche).  
13. Desactivar una función → esa sala queda libre en ese horario.  

---

# FASE 9 — Pruebas automáticas (opcional / avanzado)

Copia o escribe `tests/Feature/CineTest.php` con casos como:

- visitante no entra a `/peliculas`
- se registra película
- no se elimina película con funciones
- no se cruzan funciones
- se permite la misma hora en otra sala

Correr (con PHP 8.3):

```bash
php artisan test --filter=CineTest
```

---

# Orden de archivos (checklist de entrega)

Marca cuando exista y funcione:

### Base de datos

- [ ] migración `peliculas`
- [ ] migración `salas`
- [ ] migración `funciones`
- [ ] `php artisan migrate` sin error

### Backend

- [ ] `app/Models/Pelicula.php`
- [ ] `app/Models/Sala.php`
- [ ] `app/Models/Funcion.php`
- [ ] `app/Http/Requests/PeliculaRequest.php`
- [ ] `app/Http/Requests/SalaRequest.php`
- [ ] `app/Http/Requests/FuncionRequest.php`
- [ ] `app/Http/Controllers/PeliculaController.php`
- [ ] `app/Http/Controllers/SalaController.php`
- [ ] `app/Http/Controllers/FuncionController.php`
- [ ] `app/Http/Controllers/DashboardController.php`
- [ ] `routes/cine.php` + `require` en `web.php`
- [ ] `database/seeders/CineSeeder.php`

### Frontend

- [ ] `resources/js/types/cine.ts`
- [ ] `resources/js/lib/cine.ts`
- [ ] componentes en `resources/js/components/cine/`
- [ ] páginas `peliculas/*`
- [ ] páginas `salas/*`
- [ ] páginas `funciones/*`
- [ ] `dashboard.tsx` actualizado
- [ ] menú lateral con los 3 módulos

---

# Errores frecuentes

| Error | Causa probable | Qué hacer |
|-------|----------------|-----------|
| `Your Composer dependencies require a PHP version ">= 8.3"` | PATH usa PHP 7 de XAMPP | Usa el PHP 8.3 de Laragon |
| `Unable to locate file in Vite manifest` | Falta `npm run dev` o `npm run build` | Arranca Vite |
| Ruta `funciones/{funcione}` | Singularización en inglés | `->parameters(['funciones' => 'funcion'])` |
| Tabla `funcions` no existe | Modelo sin `$table` | `protected $table = 'funciones';` |
| 404 en `/peliculas` | Rutas no incluidas o servidor de otro proyecto | Revisa `web.php` y el puerto |
| No deja borrar película | Tiene funciones | Es correcto; desactívala |
| Vite: `wayfinder:generate` falla | PHP viejo en PATH | Pon PHP 8.3 primero en el PATH |

---

# Cómo explicar el proyecto en 3 minutos

1. **Qué hace:** administra catálogo, salas y cartelera.  
2. **Cómo está organizado:** rutas → validación → controlador → modelo → pantalla React.  
3. **La regla clave:** `Funcion::hayCruce()` evita solapar horarios en la misma sala.  
4. **Desactivar ≠ eliminar:** desactivar archiva; eliminar quita el registro (solo si no tiene funciones).  

---

# Relación con tu documento Word

| En *Creación de proyecto laravel.docx* | Continúa aquí en… |
|----------------------------------------|-------------------|
| Crear proyecto + npm + Inertia | Ya hecho (prerrequisito) |
| `make:model Pelicula -mrc` | Fase 1 (completar migración) y Fase 2–4 |
| Campos de la tabla películas | Paso 1.1 |
| `php artisan migrate` | Paso 1.4 (después de salas y funciones) |
| *(no estaba)* | Salas, funciones, React, seeder, menú |

Si te pierdes en un archivo concreto, ábrelo en este mismo proyecto: el código está comentado para clase. Esta guía te dice **en qué orden crearlo**; los archivos del repo son el **resultado esperado**.
