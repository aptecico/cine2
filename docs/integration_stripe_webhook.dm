# IMPLEMENTACIÓN COMPLETA DE STRIPE + GENERACIÓN DE BOLETAS PDF – PROYECTO DE CINE

## 1. CONTEXTO DEL PROYECTO

Estamos desarrollando un sistema de cine con:

- Laravel 13.
- PHP 8.3 o superior.
- Inertia.js 3.
- React 19.
- MySQL.
- Tailwind CSS.
- Shadcn/UI.
- Lucide React.
- Stripe como pasarela de pagos.

El proyecto se ejecuta localmente mediante:

```bash
composer run dev
```

El entorno de desarrollo utiliza Laragon y no está publicado en internet.

Actualmente ya se encuentran implementadas y funcionando estas funcionalidades:

1. Listado de películas.
2. Visualización de información de las películas.
3. Consulta de funciones disponibles por película.
4. Consulta de la sala correspondiente a cada función.
5. Consulta de las sillas pertenecientes a cada sala.
6. Visualización de sillas disponibles y ocupadas.
7. Selección de una o varias sillas para una función.

**NO volver a desarrollar estas funcionalidades.** Se deben reutilizar los controladores, modelos, consultas y componentes React existentes.

## 2. OBJETIVO PRINCIPAL

Implementar el proceso completo de compra de entradas de cine, integrando Stripe Checkout con el sistema existente.

Cuando el usuario termine de seleccionar sus sillas, debe poder:

1. Consultar el resumen de su compra.
2. Visualizar la película y función seleccionadas.
3. Visualizar las sillas seleccionadas.
4. Consultar el precio individual y el total.
5. Continuar al proceso de pago.
6. Ser redirigido a Stripe Checkout.
7. Realizar un pago de prueba.
8. Regresar al sistema.
9. Confirmar la compra mediante Stripe.
10. Generar automáticamente las boletas en PDF.
11. Visualizar y descargar el PDF desde el frontend.

El resultado debe ser un flujo funcional de principio a fin, no una implementación parcial.

## 3. PRIMERA FASE: AUDITORÍA OBLIGATORIA

Antes de desarrollar, revisar:

- `composer.json`
- `package.json`
- `.env`
- `config/services.php`
- `bootstrap/app.php`
- `database/migrations`
- `app/Models`
- `app/Http/Controllers`
- `app/Services`
- `routes/web.php`
- `routes/api.php`
- Componentes React de películas, funciones y sillas.

Identificar exactamente cómo funciona actualmente:

- La selección de películas.
- La consulta de funciones.
- La consulta de sillas.
- La identificación de sillas ocupadas.
- La relación entre funciones, salas y sillas.
- El cálculo del precio de una función.

Verificar si ya existen modelos o tablas de compras, pagos y boletas.

Si no existen, crearlos sin duplicar estructuras existentes.

Antes de realizar cambios, presentar un resumen de los archivos y estructuras que se reutilizarán y los que se crearán.

## 4. SEGUNDA FASE: CONFIGURACIÓN DE STRIPE

Instalar el SDK oficial si todavía no está instalado:

```bash
composer require stripe/stripe-php
```

Configurar las credenciales en `.env`:

```env
STRIPE_KEY=pk_test_xxxxxxxxx
STRIPE_SECRET=sk_test_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx
```

Configurar `config/services.php` para acceder a estas credenciales.

No exponer las claves secretas en React ni en las respuestas de Inertia.

Trabajar inicialmente con las claves de prueba de Stripe.

### Conexión local

Como el proyecto se ejecuta localmente mediante `composer run dev`, utilizar Stripe CLI para recibir los eventos de pago.

No depender de un webhook registrado con una URL pública de localhost.

El agente debe identificar el puerto real de Laravel a partir de la salida de `composer run dev`.

Preparar la integración para ejecutar:

```bash
stripe listen --forward-to 127.0.0.1:8000/stripe/webhook
```

Ajustar el puerto y la ruta según la configuración real del proyecto.

El secreto `whsec_` mostrado por Stripe CLI debe utilizarse en `STRIPE_WEBHOOK_SECRET` para las pruebas locales.

No utilizar el secreto de un endpoint diferente.

## 5. TERCERA FASE: ESTRUCTURA DE BASE DE DATOS

Auditar las migraciones actuales.

Si todavía no existen, implementar las siguientes entidades:

### Tabla compras

Representa la compra general del usuario.

Campos sugeridos:

- id.
- codigo_compra (único).
- user_id o cliente_id, según los modelos existentes.
- subtotal.
- total.
- moneda.
- estado.
- fecha_compra.
- created_at.
- updated_at.

Estados:

- pendiente.
- pagada.
- cancelada.
- vencida.
- reembolsada.

### Tabla boletas

Representa cada entrada individual.

Campos sugeridos:

- id.
- compra_id.
- funcion_id.
- silla_id.
- codigo_boleta (único).
- precio.
- estado.
- created_at.
- updated_at.

Cada boleta debe identificar una silla específica de una función específica.

Establecer una restricción UNIQUE sobre:

```text
funcion_id + silla_id
```

Esta restricción debe impedir que una silla tenga dos ventas confirmadas para la misma función.

Si se necesitan reservas temporales, diseñar su almacenamiento por separado para no impedir reintentos de compra después de que una reserva expire.

### Tabla pagos

Representa las transacciones realizadas mediante Stripe.

Campos sugeridos:

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
- respuesta_proveedor (JSON nullable).
- pagado_en.
- created_at.
- updated_at.

Estados:

- pendiente.
- procesando.
- aprobado.
- rechazado.
- cancelado.
- reembolsado.

Adaptar los campos a las convenciones existentes.

Utilizar DECIMAL para almacenar valores monetarios.

Conservar el precio histórico de cada boleta.

## 6. CUARTA FASE: CREAR STRIPESERVICE

Crear:

`app/Services/StripeService.php`

Centralizar toda la comunicación con Stripe.

Implementar:

### crearSesionPago()

Recibir una compra previamente creada en Laravel.

Crear una sesión Stripe Checkout con:

- mode: payment.
- line_items.
- currency.
- product_data.
- unit_amount.
- quantity.
- metadata con el identificador de la compra.
- success_url.
- cancel_url.

El total debe calcularse exclusivamente en Laravel.

Guardar el identificador de sesión generado por Stripe en la tabla pagos.

Retornar la URL de Checkout al controlador.

### consultarSesion()

Consultar una sesión de Stripe por su identificador.

Obtener:

- ID.
- Estado de sesión.
- Estado del pago.
- Monto total.
- Moneda.
- Payment Intent.
- Metadata.

### verificarFirmaWebhook()

Verificar la autenticidad de los eventos utilizando el secreto del webhook y el SDK oficial.

Gestionar correctamente las excepciones.

## 7. QUINTA FASE: IMPLEMENTAR PAGOCONTROLLER

Crear:

`app/Http/Controllers/PagoController.php`

Implementar los siguientes métodos:

### iniciarPago()

Recibir desde React:

- funcion_id.
- sillas seleccionadas.

Validar:

1. Que la función exista.
2. Que la función esté activa.
3. Que las sillas pertenezcan a la sala de esa función.
4. Que las sillas no estén repetidas.
5. Que todas estén disponibles.
6. Que el usuario tenga permiso para comprar.

Calcular el precio desde la base de datos.

Crear una compra pendiente.

Crear las boletas pendientes.

Crear un registro de pago.

Crear la sesión de Stripe Checkout.

Guardar el session_id.

Retornar la URL de pago a React.

Utilizar transacciones y bloqueos de filas para evitar compras simultáneas de una misma silla.

### exitoso()

Recibir el `session_id` que Stripe envía en success_url.

Consultar la sesión directamente mediante StripeService.

Validar:

- Que la sesión exista.
- Que corresponda a un pago registrado.
- Que el session_id coincida.
- Que la metadata corresponda a la compra.
- Que el monto coincida con la compra.
- Que la moneda coincida.
- Que el estado del pago sea `paid`.
- Que la compra todavía pueda confirmarse.

Si todo es correcto:

1. Actualizar el pago a aprobado.
2. Actualizar la compra a pagada.
3. Actualizar las boletas a pagadas.
4. Registrar la fecha de pago.
5. Guardar el Payment Intent.
6. Generar o dejar disponible el PDF de las boletas.

Realizar la confirmación dentro de una transacción.

La operación debe ser idempotente: recargar la página no debe generar compras, pagos o boletas duplicadas.

Nunca confiar exclusivamente en que el usuario llegó a la URL de éxito.

### cancelado()

Gestionar la cancelación del proceso.

No confirmar la compra ni las boletas.

Registrar el estado de la operación de forma consistente.

### webhook()

Recibir eventos enviados por Stripe CLI.

Verificar la firma antes de procesarlos.

Gestionar como mínimo:

- checkout.session.completed
- checkout.session.async_payment_succeeded
- checkout.session.async_payment_failed
- checkout.session.expired
- payment_intent.payment_failed

Los eventos de pago completado deben ejecutar la misma lógica de confirmación que el proceso de verificación de sesión.

Evitar procesar dos veces el mismo evento.

Guardar los identificadores de eventos procesados con una restricción UNIQUE o utilizar otro mecanismo idempotente.

No permitir que un evento fallido o de cancelación revierta una compra que ya fue confirmada como pagada sin realizar el procedimiento de negocio correspondiente.

## 8. SEXTA FASE: RESERVA TEMPORAL DE SILLAS

Implementar un mecanismo para evitar que dos usuarios compren simultáneamente la misma silla.

Cuando comienza una compra:

- Crear una reserva temporal de las sillas seleccionadas.
- Definir una expiración, por ejemplo, 15 minutos.
- Impedir que otros usuarios seleccionen las sillas reservadas.
- Liberar las sillas cuando la reserva expire y no exista un pago confirmado.
- Mantenerlas ocupadas después de confirmar el pago.

La disponibilidad debe consultarse desde Laravel.

No utilizar únicamente estados visuales en React para controlar la disponibilidad.

No liberar una silla únicamente porque el navegador regresa desde una página de cancelación: comprobar primero que no exista un pago exitoso.

## 9. SÉPTIMA FASE: GENERACIÓN DE BOLETAS PDF

Implementar la generación de un documento PDF profesional.

Primero revisar si el proyecto ya tiene una librería para generar PDF.

Si no existe, utilizar DomPDF:

```bash
composer require barryvdh/laravel-dompdf
```

Crear una plantilla Blade:

`resources/views/pdf/boletas.blade.php`

El PDF debe contener:

- Nombre del cine.
- Logo del cine, si existe.
- Código de compra.
- Código individual de cada boleta.
- Nombre de la película.
- Fecha de la función.
- Hora de inicio.
- Sala.
- Identificación de cada silla.
- Precio individual.
- Total pagado.
- Estado del pago.
- Fecha de compra.

Cada boleta debe identificarse individualmente.

Si el usuario compra tres sillas, el PDF debe incluir las tres boletas.

Diseñar el documento con una presentación profesional, limpia y organizada.

Cada boleta debe tener un identificador único y un código QR si es viable con las librerías existentes.

El QR debe contener una URL o identificador verificable de la boleta, no información sensible del usuario.

No generar boletas válidas cuando el pago esté pendiente, rechazado o cancelado.

El PDF debe generarse o estar disponible únicamente después de verificar el pago.

Guardar los archivos en una ubicación privada o controlada y entregar su descarga mediante una ruta protegida.

No guardar los PDF en una carpeta pública con acceso irrestricto si contienen información de compras.

## 10. OCTAVA FASE: INTEGRACIÓN CON EL FRONTEND REACT

Reutilizar el componente actual donde se seleccionan las sillas.

No modificar el funcionamiento actual de películas, funciones o selección de sillas salvo lo necesario para conectar el proceso de compra.

Después de seleccionar las sillas, mostrar un resumen de compra.

### Resumen de compra

Mostrar:

- Película seleccionada.
- Imagen o cartel de la película.
- Fecha de la función.
- Hora.
- Sala.
- Sillas seleccionadas.
- Precio por silla.
- Cantidad de boletas.
- Total de la compra.

Agregar el botón:

**Continuar al pago**

Al pulsarlo:

1. Mostrar estado de carga.
2. Deshabilitar el botón para evitar envíos repetidos.
3. Enviar la información a Laravel.
4. Recibir la URL de Stripe.
5. Redirigir al usuario a Stripe Checkout.

Utilizar el sistema de peticiones que ya tenga el proyecto, respetando Inertia y Wayfinder si están implementados.

No enviar ni aceptar el precio como fuente de verdad desde React.

### Página de pago exitoso

Crear:

`resources/js/Pages/Pagos/Exitoso.jsx`

Debe mostrar:

- Confirmación de compra.
- Código de compra.
- Película.
- Función.
- Sillas adquiridas.
- Total pagado.
- Estado del pago.
- Botón para descargar las boletas PDF.

La página debe consultar los datos confirmados por Laravel.

### Página de pago cancelado

Crear:

`resources/js/Pages/Pagos/Cancelado.jsx`

Mostrar:

- Mensaje de cancelación.
- Información de la compra.
- Opción para regresar a las funciones.
- Opción para volver a seleccionar sillas cuando corresponda.

### Página de boletas

Crear o adaptar una página para consultar las boletas de la compra.

Permitir descargar el PDF generado.

Diseño responsive y consistente con el resto del sistema.

Utilizar los componentes existentes, Shadcn/UI y Lucide React.

No usar emojis como iconos.

## 11. NOVENA FASE: RUTAS

Registrar las rutas necesarias en `routes/web.php` o donde corresponda según la arquitectura actual.

Como mínimo:

- POST `/pagos/iniciar`.
- GET `/pago/exitoso`.
- GET `/pago/cancelado`.
- POST `/stripe/webhook`.
- GET `/compras/{compra}/boletas/pdf`.

Proteger las rutas de compras y descarga de PDF para que un usuario no pueda consultar las boletas de otro.

Para el webhook:

- Excluir la ruta de la validación CSRF de Laravel de forma específica y segura.
- Verificar obligatoriamente la firma Stripe.
- No desactivar CSRF globalmente.

Si se utiliza `routes/web.php`, adaptar correctamente la excepción CSRF a la configuración de Laravel 13 en `bootstrap/app.php`.

## 12. DÉCIMA FASE: CONFIGURACIÓN LOCAL Y EJECUCIÓN

El proyecto se ejecuta mediante:

```bash
composer run dev
```

Stripe CLI debe ejecutarse en una segunda terminal independiente.

Instalar Stripe CLI si no está instalado y verificar su autenticación.

Ejecutar:

```bash
stripe login
```

Después iniciar el reenvío de eventos:

```bash
stripe listen --forward-to 127.0.0.1:8000/stripe/webhook
```

Ajustar el puerto según el que realmente utilice Laravel.

Copiar el secreto `whsec_` que muestra Stripe CLI y configurarlo en `.env`.

Después ejecutar:

```bash
php artisan config:clear
```

Mantener las dos terminales abiertas durante las pruebas:

- Terminal 1: `composer run dev`.
- Terminal 2: `stripe listen`.

No afirmar que los webhooks funcionan si Stripe CLI no está recibiendo los eventos.

## 13. UNDÉCIMA FASE: PRUEBAS COMPLETAS

Realizar pruebas utilizando el modo de prueba de Stripe.

Tarjeta para pago exitoso:

```text
4242 4242 4242 4242
```

Tarjeta para pago rechazado:

```text
4000 0000 0000 0002
```

Utilizar cualquier fecha futura y CVC válido para las tarjetas de prueba.

Probar todo el proceso:

1. Entrar al sistema.
2. Seleccionar una película.
3. Seleccionar una función.
4. Consultar las sillas.
5. Seleccionar una silla.
6. Seleccionar varias sillas.
7. Visualizar el resumen.
8. Continuar al pago.
9. Verificar la redirección a Stripe.
10. Realizar un pago exitoso.
11. Regresar al cine.
12. Verificar la compra en MySQL.
13. Verificar los registros de pago.
14. Verificar las boletas.
15. Descargar el PDF.
16. Abrir el PDF y verificar su contenido.
17. Confirmar que las sillas adquiridas aparecen ocupadas.

Probar también:

- Pago rechazado.
- Cancelación.
- Sesión expirada.
- Webhook repetido.
- Recarga de la página de éxito.
- Intento de comprar una silla ocupada.
- Intento de comprar una silla reservada.
- Intento de descargar boletas de otra compra.
- Manipulación del total desde el navegador.

## 14. REGLAS OBLIGATORIAS

- No reconstruir películas, funciones ni selección de sillas.
- No romper funcionalidades existentes.
- No duplicar tablas o relaciones.
- No generar boletas antes de confirmar el pago.
- No confiar en valores enviados desde React.
- No guardar claves secretas en el frontend.
- No marcar sillas como vendidas antes de verificar el pago.
- No procesar dos veces una misma compra.
- No permitir ventas duplicadas.
- No utilizar pagos simulados.
- No utilizar tarjetas reales durante las pruebas.
- Mantener una arquitectura organizada y fácil de explicar a los estudiantes.
- Manejar errores de forma controlada.
- No dejar funcionalidades pendientes sustituidas por comentarios.

## 15. RESULTADO FINAL

El proyecto debe quedar completamente integrado para que el usuario pueda realizar el siguiente proceso:

PELÍCULA → FUNCIÓN → SELECCIÓN DE SILLAS → RESUMEN → STRIPE CHECKOUT → PAGO CONFIRMADO → COMPRA REGISTRADA → BOLETAS GENERADAS → PDF DESCARGABLE.

Al finalizar, entregar un informe indicando:

1. Migraciones creadas.
2. Modelos creados o modificados.
3. Relaciones implementadas.
4. Servicios desarrollados.
5. Controladores implementados.
6. Rutas creadas.
7. Componentes React modificados o creados.
8. Librerías instaladas.
9. Variables necesarias en `.env`.
10. Comandos para ejecutar.
11. Configuración de Stripe CLI.
12. Pruebas realizadas y resultados.

No declarar la integración terminada hasta haber probado una compra completa, recibido el evento de Stripe, confirmado los datos en MySQL y generado y descargado correctamente el PDF.