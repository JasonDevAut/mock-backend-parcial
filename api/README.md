# Cafetería Campus

API REST para usuarios, productos y pedidos de una cafetería de campus. Los datos transaccionales están en SQL Server. Los comentarios y el historial de actividad están en MongoDB. El acceso usa JWT y dos perfiles: `Administrador` y `Cliente`.

## Cómo levantarla

Hacen falta Docker Desktop, Node.js 20 o superior, `sqlcmd` y `mongosh`.

1. En `sql/`, `docker compose up -d` y luego los scripts del README de esa carpeta. El motor queda en `localhost:1434`.
2. En `mongo/`, `docker compose up -d` y luego `mongosh --host 127.0.0.1 --port 27019 < carga-inicial.js`.
3. En esta carpeta:

```text
copy .env.example .env
npm install
npm start
```

La API escucha en `PORT`, por defecto `3001`. `GET http://localhost:3001/` responde `{ "nombre": "cafeteria-campus" }`.

`.env` no se sube. La contraseña de SQL va entre comillas porque contiene `!`. Cambia `JWT_SECRET` antes de usar el proyecto fuera de tu máquina.

Las cuentas de la carga inicial:

| Correo | Contraseña | Perfil |
|---|---|---|
| `ana@cafeteria.test` | `Admin123!` | Administrador |
| `luis@cafeteria.test` | `Cliente123!` | Cliente |

## Autenticación

`POST /api/auth/login` recibe correo y contraseña y responde `token` y `usuario`, sin la contraseña. El token dura lo que indique `JWT_EXPIRES`, por defecto 8 horas, y se envía como `Authorization: Bearer <token>`.

`POST /api/auth/registro` crea un cliente. La contraseña tiene al menos 8 caracteres. El teléfono es opcional. Si el cuerpo trae perfil, se ignora.

`GET /` y `/api/auth` son públicas. El resto de `/api` exige token. Un token inválido o vencido responde `401`. Un usuario inactivo responde `403` tanto al entrar como al usar un token ya emitido.

El administrador crea, lista y desactiva usuarios, administra productos y puede pedir para cualquier usuario. No puede desactivarse a sí mismo. El cliente consulta productos, ve y edita solo su usuario, y solo pide, cancela y comenta lo suyo.

## Códigos de estado

| Código | Cuándo |
|---|---|
| 200 | Consulta, actualización, desactivación o cancelación correcta |
| 201 | Usuario, producto, pedido o comentario creado |
| 400 | Cuerpo inválido. El cuerpo trae `error.mensaje` y `error.detalles` |
| 401 | Falta el token, el token no es válido o las credenciales no coinciden |
| 403 | El perfil no puede hacer esa acción, o el usuario está inactivo |
| 404 | El recurso o la ruta no existe |
| 409 | Correo duplicado, usuario o producto inactivo, stock insuficiente o pedido ya cancelado |
| 500 | Error no previsto. El cliente ve un mensaje genérico, sin la traza |

## Usuarios

`POST /api/usuarios` lo usa el administrador.

```json
{ "nombre": "Ana", "apellido": "Rojas", "email": "ana@cafeteria.test", "telefono": "999111222", "password": "Clave123!", "perfil": "Cliente" }
```

`perfil` es opcional y, si no viene, queda `Cliente`. La respuesta no incluye la contraseña. `fechaActualizacion` nace nula y se llena al editar o desactivar.

`GET /api/usuarios` es del administrador y devuelve activos e inactivos. `GET /api/usuarios/{id}` devuelve uno: el cliente solo el suyo. `PUT /api/usuarios/{id}` reemplaza nombre, apellido, correo y teléfono. La contraseña es opcional. Solo el administrador cambia el perfil; si un cliente lo envía, el perfil queda igual y la respuesta es `200`. `DELETE /api/usuarios/{id}` deja `activo` en falso. El usuario sigue en las consultas.

## Productos

`POST /api/productos` recibe nombre, precio mayor que cero, stock entero mayor o igual que cero y una descripción opcional. Cualquier usuario autenticado puede consultar productos. Crear, editar y desactivar es del administrador. `DELETE /api/productos/{id}` deja `activo` en falso y el producto sigue siendo consultable.

## Pedidos

`POST /api/pedidos` registra el pedido solo a través de `sp_registrar_pedido`.

```json
{ "usuarioId": 2, "productoId": 1, "cantidad": 2 }
```

El estado inicial es `CONFIRMADO`. La cantidad es un entero mayor que cero. El procedimiento bloquea la fila del producto, copia el precio vigente y descuenta el stock. Si no hay stock, o el usuario o el producto están inactivos, responde `409` y el stock no cambia. Si el usuario o el producto no existen, responde `404`. El cliente solo puede pedir para sí. El mismo pedido sobre otro producto con stock se acepta.

`GET /api/pedidos` acepta `productoId` y `usuarioId`. El cliente solo ve los suyos. `DELETE /api/pedidos/{id}` pasa el estado a `CANCELADO`, guarda `fechaActualizacion` y devuelve la cantidad al stock. Una segunda cancelación responde `409` y no vuelve a sumar. El pedido no se borra.

## Comentarios

`POST /api/pedidos/{id}/comentarios` recibe `{ "texto": "Sin azúcar" }`. `GET /api/pedidos/{id}/comentarios` los devuelve del más antiguo al más reciente. El cliente solo comenta y lista los de sus pedidos.

## Actividad

Cada petición atendida agrega un documento en `logs` con método, ruta, código y fecha. Sin token, `id_usuario` queda `anonimo`. La contraseña no se guarda. Al confirmar un pedido, el historial también guarda un evento con el id del pedido. Al comentar, guarda el id del comentario y el del pedido. Si MongoDB no puede escribir, la respuesta de negocio no cambia.
