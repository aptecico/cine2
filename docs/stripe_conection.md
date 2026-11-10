# AUDITORÍA Y ESTANDARIZACIÓN DE BASE DE DATOS – PROYECTO DE CINE

## 1. Contexto del proyecto

Estamos desarrollando un sistema de gestión de cine con la siguiente tecnología:

- Laravel 13.
- Inertia.js 3.
- React 19.
- MySQL.
- PHP.
- Stripe para el procesamiento de pagos (próxima implementación).

Actualmente, el proyecto cuenta con funcionalidades para:

- Listar películas.
- Consultar funciones disponibles de cada película.
- Consultar las sillas pertenecientes a una sala.
- Visualizar las sillas disponibles y ocupadas para una función.
- Seleccionar las sillas que desea comprar el usuario.

Todavía no se ha implementado el módulo de compras, boletas ni pagos.

## 2. Objetivo principal

Realizar una auditoría completa de las migraciones, modelos, relaciones y estructura actual de la base de datos.

Posteriormente, diseñar una estructura general, organizada y estandarizada que permita que todos los estudiantes trabajen sobre el mismo modelo de base de datos.

La auditoría debe realizarse antes de modificar cualquier archivo.

## 3. Primera fase: auditoría del proyecto

Analizar las siguientes carpetas y archivos:

- `database/migrations`
- `app/Models`
- `app/Http/Controllers`
- `routes/web.php`
- `routes/api.php`
- Relaciones Eloquent.
- Consultas utilizadas para películas, funciones, salas y sillas.
- Componentes React relacionados con la selección de sillas.

Identificar:

1. Todas las tablas existentes.
2. Todos los campos de cada tabla.
3. Tipos de datos y restricciones.
4. Claves primarias.
5. Claves foráneas.
6. Índices y restricciones UNIQUE.
7. Relaciones entre tablas.
8. Campos obligatorios y opcionales.
9. Modelos existentes y sus relaciones Eloquent.
10. Campos duplicados o inconsistentes.
11. Problemas de integridad referencial.
12. Migraciones repetidas o incompatibles.

No asumir que los campos existen. Verificar cada uno directamente en el código.

## 4. Segunda fase: diseñar la estructura general

Proponer una estructura de base de datos que permita gestionar correctamente el proceso de compra de entradas de cine.

La estructura debe contemplar como mínimo las siguientes entidades:

### Películas
Información de las películas disponibles.

### Salas
Espacios físicos donde se proyectan las películas.

### Sillas
Sillas físicas pertenecientes a una sala. Cada sala puede tener sillas con identificadores iguales, por ejemplo A1, A2, B1.

### Funciones
Programación de una película en una sala, con fecha, hora, precio y estado.

### Compras
Registro general de una transacción realizada por un cliente.

### Boletas
Registro individual de cada silla adquirida dentro de una compra y asociada a una función.

### Pagos
Registro de los pagos realizados y su relación con una compra.

### Clientes o usuarios
Identificación del comprador, reutilizando la tabla de usuarios existente si corresponde.

### Detalles adicionales
Proponer otras tablas únicamente cuando sean necesarias para garantizar integridad, trazabilidad y funcionamiento correcto.

## 5. Tercera fase: definir las relaciones

Diseñar las relaciones necesarias:

- Una película puede tener muchas funciones.
- Una sala puede tener muchas sillas.
- Una sala puede tener muchas funciones.
- Una función pertenece a una película y a una sala.
- Una compra pertenece a un cliente.
- Una compra puede contener varias boletas.
- Una boleta pertenece a una función.
- Una boleta identifica una silla específica.
- Una compra puede tener uno o varios registros de pago, si se necesitan reintentos.
- Una silla no puede venderse dos veces para la misma función.

La combinación de `funcion_id` y `silla_id` debe tener una restricción UNIQUE en boletas para evitar ventas duplicadas, independientemente de que se intente realizar la compra desde dos navegadores simultáneamente.

## 6. Cuarta fase: estructura de pagos con Stripe

Preparar el diseño para integrar Stripe Checkout.

La tabla de pagos debe contemplar como mínimo:

- id.
- compra_id.
- proveedor.
- referencia_externa.
- session_id.
- payment_intent_id.
- monto.
- moneda.
- estado.
- metodo_pago.
- respuesta_proveedor (JSON, opcional).
- pagado_en.
- created_at.
- updated_at.

Estados sugeridos:

- pendiente.
- procesando.
- aprobado.
- rechazado.
- cancelado.
- reembolsado.

La tabla de compras debe contemplar:

- id.
- codigo_compra.
- usuario_id o cliente_id, según la estructura existente.
- subtotal.
- total.
- moneda.
- estado.
- fecha_compra.
- created_at.
- updated_at.

Estados sugeridos para compras:

- pendiente.
- pagada.
- cancelada.
- vencida.
- reembolsada.

Consideraciones importantes:

- El precio debe calcularse en Laravel y nunca confiar en el valor enviado por React.
- Una compra puede contener varias boletas.
- Una compra puede tener varios intentos de pago.
- Una boleta no debe confirmarse hasta recibir una notificación válida de Stripe.
- Los webhooks deben verificarse mediante la firma de Stripe.
- Los eventos repetidos deben procesarse de forma idempotente.
- Se debe contemplar la liberación de sillas cuando una compra pendiente expire o sea cancelada.
- La selección de sillas debe tener una reserva temporal para evitar que dos usuarios intenten adquirirlas simultáneamente.
- El precio de la boleta debe conservarse aunque posteriormente cambie el precio de la función.

## 7. Quinta fase: auditoría de seguridad e integridad

Verificar:

- Que no existan ventas duplicadas para una misma función y silla.
- Que las relaciones tengan claves foráneas.
- Que los montos utilicen DECIMAL y no FLOAT.
- Que los identificadores externos de Stripe no se repitan cuando corresponda.
- Que las compras y pagos puedan consultarse mediante sus relaciones.
- Que las operaciones críticas utilicen transacciones de base de datos.
- Que se controlen las condiciones de concurrencia durante la selección y compra de sillas.

## 8. Sexta fase: estandarización para todos los estudiantes

Generar una propuesta única y documentada para que todos los estudiantes utilicen exactamente:

- Los mismos nombres de tablas.
- Los mismos nombres de campos.
- Los mismos tipos de datos.
- Las mismas relaciones.
- Las mismas claves foráneas.
- Los mismos estados.
- Las mismas reglas de negocio.

La propuesta debe incluir:

1. Diagrama entidad-relación.
2. Diccionario de datos.
3. Listado de migraciones necesarias.
4. Campos y tipos de datos de cada tabla.
5. Relaciones Eloquent de cada modelo.
6. Explicación de cada relación.
7. Orden correcto para ejecutar las migraciones.
8. Reglas de negocio para evitar inconsistencias.

## 9. Restricciones importantes

- No eliminar información existente.
- No modificar migraciones ejecutadas sin analizar previamente sus consecuencias.
- No recrear tablas que ya existen.
- No cambiar funcionalidades actuales de películas, funciones y sillas.
- No implementar todavía Stripe.
- No desarrollar todavía controladores ni componentes de compra.
- No generar código innecesario.
- No asumir que todos los estudiantes tienen exactamente las mismas migraciones.

Primero presentar el diagnóstico y la propuesta de estructura.

## 10. Entregables

Presentar el resultado en este orden:

**A. Diagnóstico actual:** tablas, campos, relaciones y problemas encontrados.

**B. Estructura propuesta:** tablas definitivas, campos, tipos de datos y relaciones.

**C. Comparación:** estructura actual frente a estructura recomendada.

**D. Diagrama entidad-relación:** representación visual de todas las entidades.

**E. Plan de implementación:** orden de creación y modificación de migraciones.

**F. Estandarización académica:** documento de referencia que todos los estudiantes deberán seguir.

**G. Observaciones:** inconsistencias, riesgos y recomendaciones antes de comenzar la implementación.

IMPORTANTE: No realizar modificaciones automáticas hasta que el diagnóstico y la estructura propuesta hayan sido presentados y aprobados.