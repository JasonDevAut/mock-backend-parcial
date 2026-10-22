# Tasks

## 1. Esqueleto de la API

- [x] 1.1 Crear `api/package.json` con `express`, `mssql`, `mongodb`, `dotenv`, `jsonwebtoken` y `bcrypt`, más `nodemon` en desarrollo, y los scripts `start` y `dev`. Verificar que `npm install` termina sin error.
- [x] 1.2 Ignorar `node_modules/`, `package-lock.json` y `.env` en `api/.gitignore`. Verificar con `git check-ignore` que los tres quedan excluidos.
- [x] 1.3 Crear `api/.env.example` con `PORT` `3001`, `SQL_SERVER`, `SQL_PORT` `1434`, `SQL_DATABASE` `CafeteriaCampus`, `SQL_USER`, `SQL_PASSWORD`, `MONGO_URI` hacia el puerto `27019`, `MONGO_DB` `cafeteria`, `JWT_SECRET` y la duración del token, sin secretos reales. Verificar que esas claves están en el archivo.
- [x] 1.4 Crear `api/src/server.js` y `api/src/app.js` para escuchar en `PORT` y responder `GET /` sin token. Verificar que, con `PORT` definido, el proceso anuncia el puerto y `GET /` responde `200`.

## 2. SQL Server

- [x] 2.1 Crear `sql/docker-compose.yml` con SQL Server publicado en `1434`. Verificar que `docker compose up -d` deja el puerto `1434` en escucha.
- [x] 2.2 Crear `sql/DDL/01-tablas.sql` con `Perfiles`, `Usuarios`, `Productos` y `Pedidos` en 3FN, claves foráneas, `Email` único, precio mayor que cero, stock mayor o igual que cero, cantidad mayor que cero y `Estado` limitado a `CONFIRMADO` o `CANCELADO`. Verificar ejecutando el script y listando las cuatro tablas con sus claves.
- [x] 2.3 Crear `sql/DDL/02-indices.sql` con el índice único de correo, si no quedó en la tabla, y los índices de `Pedidos` por `UsuarioId` y por `ProductoId`. Verificar que esos índices existen tras ejecutar el script.
- [x] 2.4 Crear `sql/DDL/03-stored-procedure.sql` con `sp_registrar_pedido` y `sp_cancelar_pedido`, cada uno en una transacción y con bloqueo de la fila del producto. El alta devuelve códigos para válido, no encontrado, inactivo, stock insuficiente y cantidad inválida. La cancelación devuelve el stock solo si el pedido está `CONFIRMADO`. Verificar que el primer llamado confirma y descuenta, un segundo llamado por encima del stock devuelve el código de stock, la cancelación repone las unidades y una segunda cancelación no vuelve a sumar.
- [x] 2.5 Crear el resto de procedimientos de usuarios y productos, incluido el `PUT` de producto que bloquea la fila al cambiar el stock. Verificar que un alta de usuario con correo repetido falla por la restricción única y que desactivar un producto lo deja consultable con `Activo` en falso.
- [x] 2.6 Crear `sql/DML/01-carga-inicial.sql` con los perfiles `Administrador` y `Cliente`, Ana, Luis, dos productos y un pedido llamando a `sp_registrar_pedido`. Las contraseñas van como hash bcrypt. Verificar que, tras ejecutarlo, hay filas en las cuatro tablas y el stock del producto pedido ya está descontado.
- [x] 2.7 Crear `sql/diagrama.md` con el diagrama entidad-relación en Mermaid y `sql/README.md` con el orden de ejecución. Verificar que el diagrama muestra las cuatro entidades y las relaciones hacia `Usuarios` y `Pedidos`, y que el README nombra los scripts en orden.

## 3. MongoDB

- [x] 3.1 Crear `mongo/docker-compose.yml` con MongoDB publicado en `27019`. Verificar que `docker compose up -d` deja el puerto `27019` en escucha.
- [x] 3.2 Crear `mongo/esquemas.md` con la forma de `comentarios` y la de `logs`, incluyendo `pedidoId` y `comentarioId` solo en los eventos que los tienen. Verificar que el documento distingue los campos comunes de los campos que solo aparecen en algunos tipos, y que la contraseña no figura en ninguno.
- [x] 3.3 Crear `mongo/carga-inicial.js` con `insertMany` de comentarios y de logs de formas distintas, y `mongo/README.md` con el comando de ejecución contra el puerto `27019`. Verificar que, al correrlo, ambas colecciones tienen documentos y que no todos los logs traen los mismos campos.

## 4. Conexiones y middlewares

- [x] 4.1 Crear `api/src/db/SQL/DBConexion.js`, `api/src/db/mongo/DBConexion.js` y los módulos de queries y commands leyendo `.env`. Verificar que el servidor arranca con ambas conexiones cuando `.env` apunta a los contenedores locales.
- [x] 4.2 Crear el middleware de logging que escribe un log al terminar cada respuesta, identifica como `anonimo` la petición sin token y no cambia el código de negocio si MongoDB falla. Verificar que una ruta inexistente responde `404` con `error.mensaje` y que, con MongoDB disponible, `logs` guarda método, ruta, código y fecha, sin la contraseña.
- [x] 4.3 Crear `api/src/middlewares/validate.js`, `authenticate`, `authorize`, `selfOrAdmin`, `asyncHandler` y el manejador global de errores, con cuerpo `{ error: { mensaje, detalles } }` y sin traza en un `500`. Verificar el `400` con un cuerpo inválido, el `401` sin token en `/api/productos` y el `500` provocando un error no previsto cuyo cuerpo no trae la traza.

## 5. Autenticación

- [x] 5.1 Implementar `POST /api/auth/login`. Documentar la ruta en `api/README.md` y agregar los casos a `api/request.http`. Verificar `200` con `token` y `usuario` sin contraseña, `401` con credenciales incorrectas y `403` con un usuario inactivo.
- [x] 5.2 Implementar `POST /api/auth/registro` para crear siempre un `Cliente`, ignorando el perfil enviado. Documentarlo y agregarlo a `request.http`. Verificar `201` con perfil `Cliente`, `400` si la contraseña tiene menos de 8 caracteres y `409` si el correo ya existe.
- [x] 5.3 Exigir token en `/api` salvo login y registro, y rechazar con `403` el token de un usuario inactivo. Documentar las rutas públicas. Verificar que `GET /` responde `200` sin token y que un token vencido o inválido responde `401`.

## 6. Usuarios

- [x] 6.1 Implementar `POST /api/usuarios` solo para el administrador, con perfil opcional que por defecto es `Cliente`. Documentarlo y agregarlo a `request.http`. Verificar `201` sin devolver la contraseña, `400` si faltan datos, `409` si el correo ya existe, `403` si lo llama un cliente y `fechaActualizacion` nula.
- [x] 6.2 Implementar `GET /api/usuarios` y `GET /api/usuarios/:id`. Documentarlos y agregarlos a `request.http`. Verificar `200` del listado solo con administrador, `200` al consultar el propio usuario, `403` si un cliente consulta a otro y `404` si el administrador pide un id que no existe.
- [x] 6.3 Implementar `PUT /api/usuarios/:id`. Documentarlo y agregarlo a `request.http`. Verificar `200` del dueño o del administrador, `400` si faltan datos, `409` si el correo es de otro usuario, `403` si un cliente edita a otro, que el perfil de un cliente no cambia aunque lo envíe, `404` si no existe y que `fechaActualizacion` queda llena.
- [x] 6.4 Implementar `DELETE /api/usuarios/:id` como desactivación lógica. Documentarlo y agregarlo a `request.http`. Verificar `200` con `activo` en falso, que el usuario sigue en el listado, `403` si el administrador se desactiva a sí mismo y `404` si el id no existe.

## 7. Productos

- [x] 7.1 Implementar `POST /api/productos`. Documentarlo y agregarlo a `request.http`. Verificar `201` con precio mayor que cero y stock entero mayor o igual que cero, `400` si el nombre, el precio o el stock no son válidos, y `403` si lo llama un cliente.
- [x] 7.2 Implementar `GET /api/productos` y `GET /api/productos/:id` para cualquier usuario autenticado. Documentarlos y agregarlos a `request.http`. Verificar `200` en el listado, `200` al consultar uno existente y `404` si el id no existe.
- [x] 7.3 Implementar `PUT /api/productos/:id`. Documentarlo y agregarlo a `request.http`. Verificar `200` con datos válidos, `400` con precio o stock inválido, `404` si el id no existe y que `fechaActualizacion` queda llena.
- [x] 7.4 Implementar `DELETE /api/productos/:id` como desactivación lógica. Documentarlo y agregarlo a `request.http`. Verificar `200` con `activo` en falso, que el producto sigue siendo consultable, y `404` si el id no existe.

## 8. Pedidos

- [x] 8.1 Implementar `POST /api/pedidos` llamando solo a `sp_registrar_pedido` y traduciendo sus códigos a `201`, `400`, `404` y `409`. Guardar el precio unitario vigente y, al confirmar, un evento con el id del pedido. Documentar la ruta y agregar los casos a `request.http`. Verificar pedido válido con stock descontado, cantidad inválida, usuario o producto inexistente, usuario o producto inactivo, stock insuficiente, otro producto con stock y `403` cuando un cliente pide para otra persona.
- [x] 8.2 Implementar `GET /api/pedidos`, los filtros `productoId` y `usuarioId`, y `GET /api/pedidos/:id`. Documentarlos y agregarlos a `request.http`. Verificar que el cliente solo ve los suyos, que el administrador filtra, `403` si el cliente pide lo de otro, `200` de un pedido propio y `404` si el administrador pide un id que no existe.
- [x] 8.3 Implementar `DELETE /api/pedidos/:id` llamando a `sp_cancelar_pedido`. Documentarlo y agregarlo a `request.http`. Verificar `200` con estado `CANCELADO` y stock repuesto, `404` si no existe, `403` si un cliente cancela lo de otro, `409` al cancelar de nuevo sin sumar stock otra vez, y que un `POST` posterior de esa cantidad responde `201`.

## 9. Comentarios

- [x] 9.1 Implementar `POST /api/pedidos/:id/comentarios` y `GET /api/pedidos/:id/comentarios`. Al guardar, escribir el evento con el id del comentario y el del pedido. Documentar ambas rutas y agregarlas a `request.http`. Verificar `201`, `400` con texto vacío, `404` si el pedido no existe, `403` si el pedido es de otro cliente, listado del más antiguo al más reciente y `200` con colección vacía.

## 10. Integración

- [x] 10.1 Agregar al final de `request.http` el flujo completo: entrar como administrador, crear un producto con stock 2, pedir esas 2 unidades, rechazar un pedido más, comentar, cancelar y volver a pedir las unidades liberadas. Verificar que esa secuencia, ejecutada en orden contra el servidor, devuelve `200`, `201`, `201`, `409`, `201`, `200` y `201`.

## Workflow follow-up

- Archivar el cambio OpenSpec cuando la implementación esté revisada.
- El informe Word/PDF y las diapositivas quedan fuera de este cambio.
