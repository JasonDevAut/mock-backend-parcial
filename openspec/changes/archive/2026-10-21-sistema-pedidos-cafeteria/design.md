# Design

## Context

La carpeta del proyecto está vacía: no hay código, repositorio git ni bases creadas. La motivación y el alcance están en `proposal.md`. El comportamiento observable está en las specs de `autenticacion`, `usuarios`, `productos`, `pedidos`, `comentarios` y `registro-actividad`.

La referencia de implementación es el parcial de reservas de coworking ya sustentado. Este caso conserva sus capas, sus motores y sus perfiles. Cambia el recurso de sala a producto y la regla de conflicto de horario a stock.

## Goals / Non-Goals

**Goals:**

- Tres carpetas hermanas, una por entrega: `api/`, `sql/` y `mongo/`.
- El descuento y la devolución de stock se deciden dentro de SQL Server, cada uno en una sola transacción.
- Comentarios y eventos viven en MongoDB, con documentos de forma distinta según el tipo de evento.
- Cada recurso deja sus casos en `request.http` y su sección en el README al mismo tiempo que se implementa.

**Non-Goals:**

- Reactivar un usuario o un producto después de desactivarlos. `DELETE` solo pasa el flag a inactivo.
- Elegir el motor de base de datos por variable de entorno. SQL Server y MongoDB son fijos.
- Suite de pruebas automatizada. La verificación es `request.http` contra el servidor en marcha.
- Publicar repositorios remotos desde este cambio.

## Decisions

### Un workspace, tres carpetas de entrega

Cada entrega es una carpeta:

- `api/`: `src/`, `package.json`, `request.http`, `README.md` y `.env.example`.
- `sql/`: motor SQL Server, tablas, índices, procedimientos, carga inicial y diagrama.
- `mongo/`: motor MongoDB, esquema y carga de logs y comentarios.

La raíz del workspace no es una de las tres entregas. Conserva OpenSpec y, más adelante, el informe si el curso lo pide.

Los puertos no coinciden con los del coworking, para poder tener los dos proyectos levantados en la misma máquina: API `3001`, SQL Server `1434` y MongoDB `27019`.

### Capas de la API

- `src/server.js` lee `PORT` y arranca.
- `src/app.js` monta el logger, JSON, los routers y el manejador de errores.
- `src/routes/` tiene un router para auth, otro para usuarios, otro para productos y otro para pedidos. Los comentarios cuelgan del router de pedidos en `/api/pedidos/:id/comentarios`.
- Los controladores no escriben SQL. Las consultas están en `src/db/SQL/queries` y los cambios en `src/db/SQL/commands`. Todos pasan por procedimientos almacenados.
- `src/db/SQL/DBConexion.js` y `src/db/mongo/DBConexion.js` concentran cada conexión.

Los middlewares entran en este orden:

1. `requestLogger` escribe el log de auditoría en MongoDB cuando la respuesta termina.
2. `express.json()` lee el cuerpo JSON.
3. `validate` revisa el cuerpo y responde `400` con `{ error: { mensaje, detalles } }` antes del controlador.
4. `authenticate` exige el token en `/api`, salvo login y registro.
5. `authorize` limita la ruta a un perfil.
6. `selfOrAdmin` deja que un cliente consulte o edite solo su usuario.
7. `asyncHandler` pasa al manejador global los errores de los controladores.

Si la ruta no existe, `notFoundHandler` responde `404`. `errorHandler` arma la respuesta de error. En un `500`, el cliente recibe el mensaje genérico y el log conserva el error original.

En pedidos y comentarios, la regla de que el cliente solo toque lo suyo la aplica `exigirDueno` dentro del controlador, después de saber de quién es el pedido. Un `usuarioId` ajeno en el alta también se rechaza ahí, con `403`, antes de llamar al procedimiento.

Alternativa considerada: `express-validator` o Zod. Se descartó para que el middleware de validación sea código visible, igual que en el parcial anterior.

### Autenticación

`POST /api/auth/login` compara el correo y la contraseña con bcrypt y responde `token` y `usuario`. El token dura 8 horas y se envía como `Authorization: Bearer <token>`. `JWT_SECRET` vive en el entorno.

`POST /api/auth/registro` crea siempre un `Cliente`. Si el cuerpo trae perfil, se ignora. `POST /api/usuarios` es del administrador; el perfil es opcional y, si no viene, queda `Cliente`. Solo el administrador puede cambiar el perfil en un `PUT`. Si un cliente lo envía, la API conserva el perfil actual y responde `200`.

La contraseña no se guarda en claro, no se devuelve en las respuestas y no se escribe en el log. Un administrador no puede desactivarse a sí mismo.

La carga inicial deja a Ana como `Administrador` y a Luis como `Cliente`.

### Modelo SQL en 3FN

Base `CafeteriaCampus`. Cuatro tablas. No hay atributos que dependan de algo que no sea la clave de su tabla.

- `Perfiles`: `PerfilId`, `Nombre` único.
- `Usuarios`: `UsuarioId`, `Nombre`, `Apellido`, `Email` único, `Telefono` nulo, `PasswordHash`, `PerfilId` FK, `Activo`, `FechaCreacion`, `FechaActualizacion` nula.
- `Productos`: `ProductoId`, `Nombre`, `Precio` `DECIMAL(10,2)` mayor que cero, `Stock` entero mayor o igual que cero, `Descripcion` nula, `Activo`, `FechaCreacion`, `FechaActualizacion` nula.
- `Pedidos`: `PedidoId`, `UsuarioId` FK, `ProductoId` FK, `Cantidad` entera mayor que cero, `PrecioUnitario` `DECIMAL(10,2)` mayor que cero, `Estado` restringido a `CONFIRMADO` o `CANCELADO`, `FechaCreacion`, `FechaActualizacion` nula.

`Estado` no tiene tabla propia: no posee atributos aparte del código. Un `CHECK` fija el dominio. `PrecioUnitario` se copia del producto al confirmar. No se recalcula al leer, así un cambio posterior de precio no reescribe el pedido.

Índices: único sobre `Usuarios.Email`; `UsuarioId` y `ProductoId` en pedidos para los filtros.

### Procedimientos como única vía de cambio

`sp_registrar_pedido` recibe usuario, producto y cantidad, y devuelve el id nuevo más un código de resultado: válido, no encontrado, inactivo, stock insuficiente o cantidad inválida. Corre en una transacción, bloquea la fila del producto (`UPDLOCK, HOLDLOCK`), comprueba usuario y producto, y solo entonces descuenta el stock e inserta el pedido con el precio vigente.

`sp_cancelar_pedido` corre en otra transacción. Solo actúa sobre un pedido `CONFIRMADO`: lo pasa a `CANCELADO`, llena `FechaActualizacion` y suma la cantidad al stock. Un pedido ya cancelado devuelve un código propio y no vuelve a sumar.

La API traduce los códigos de alta a `201`, `404`, `409` y `400`. Los de cancelación, a `200`, `404` y `409`. El `403` de dueño o de perfil lo decide la API antes de llamar al procedimiento.

Alternativa considerada: descontar el stock en Node y luego insertar. Se descartó porque dos peticiones simultáneas podrían confirmar la última unidad dos veces. Cancelar con un `UPDATE` suelto también se descartó: si el proceso cae entre el cambio de estado y la suma del stock, las unidades se pierden.

El resto de altas, ediciones y desactivaciones también pasa por procedimientos. Un `PUT` de producto que cambia el stock bloquea esa fila, para no pisar un descuento en curso.

### MongoDB sin esquema rígido

Base `cafeteria`, dos colecciones:

- `comentarios`: `pedidoId` entero, `texto`, `fecha`.
- `logs`: siempre `accion`, `statusCode`, `IP`, `id_usuario` y `fecha_ejecucion`. `metodo`, `ruta`, `pedidoId`, `comentarioId`, `texto`, `mensaje` y `descripcion` completan el detalle. No se usa un validador que rechace campos extra.

Cada petición atendida agrega un documento con acción `Peticion HTTP`. Si no hay un token válido, `id_usuario` queda como `anonimo`. En un error previsto, `mensaje` es el texto que ve el cliente. En un `500`, el log conserva el error original. La contraseña no entra en `descripcion`.

El controlador, además, escribe el evento de dominio al confirmar un pedido o guardar un comentario. Si MongoDB rechaza la escritura, se registra el fallo en la consola del servidor y la respuesta de negocio ya calculada se mantiene.

### Configuración

`.env.example` declara `PORT`, `SQL_SERVER`, `SQL_PORT`, `SQL_DATABASE`, `SQL_USER`, `SQL_PASSWORD`, `MONGO_URI`, `MONGO_DB`, `JWT_SECRET` y la duración del token. No hay secretos reales. `package-lock.json` entra al `.gitignore` junto con `node_modules` y `.env`.

Scripts npm: `start` ejecuta el servidor; `dev` lo reinicia al cambiar archivos. Node.js 20 o superior.

`docker compose up` solo enciende el motor. No crea tablas, colecciones ni datos. Esa parte la ejecutan los scripts de cada carpeta.

### Orden de los scripts SQL

1. `sql/DDL/01-tablas.sql` crea la base y las cuatro tablas.
2. `sql/DDL/02-indices.sql` crea los índices de consulta.
3. `sql/DDL/03-stored-procedure.sql` crea los procedimientos, incluidos `sp_registrar_pedido` y `sp_cancelar_pedido`.
4. `sql/DML/01-carga-inicial.sql` inserta los perfiles, Ana, Luis, dos productos y un pedido llamando a `sp_registrar_pedido`.
5. `sql/diagrama.md` contiene el diagrama entidad-relación en Mermaid.

## Risks / Trade-offs

- [La instancia de SQL Server o MongoDB no está levantada en esta máquina] → Los scripts, Docker Compose y `.env.example` quedan listos; la prueba con `request.http` se ejecuta cuando ambas instancias respondan.
- [Dos altas simultáneas de la última unidad] → El procedimiento bloquea la fila del producto dentro de la transacción.
- [Un administrador cambia el stock mientras entra un pedido] → El `PUT` del producto también bloquea esa fila.
- [MongoDB caído durante un pedido válido] → El pedido queda en SQL y la API responde `201`. El historial de esa petición se pierde. Es el aislamiento que pide la spec.
- [Sin `package-lock.json` la instalación puede variar de versión] → `package.json` fija rangos compatibles con Node 20 y se anota la versión usada en el README.
- [Los puertos del coworking siguen ocupados] → Este proyecto usa `3001`, `1434` y `27019`.

## Migration Plan

No hay datos previos que migrar.

1. `docker compose up -d` en `sql/` y en `mongo/`.
2. Ejecutar los SQL en el orden de arriba.
3. Ejecutar el esquema y la carga de MongoDB.
4. Copiar `.env.example` a `.env`.
5. `npm install` y `npm start` dentro de `api/`.
6. Correr `request.http`. El primer login útil es el de Ana.

Rollback: borrar la base `CafeteriaCampus` y las colecciones `comentarios` y `logs`. No hay otro entorno que revertir.
