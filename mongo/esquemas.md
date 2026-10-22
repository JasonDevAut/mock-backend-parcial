# Esquema de MongoDB

Base `cafeteria`. No hay un validador que rechace campos extra: el historial admite documentos de distinta forma.

## Colección `comentarios`

Siempre trae estos campos:

| Campo | Tipo | Qué guarda |
|---|---|---|
| `pedidoId` | entero | Pedido al que pertenece el comentario |
| `texto` | texto | Contenido del comentario |
| `fecha` | fecha | Momento en que se registró |

## Colección `logs`

Campos comunes a toda petición atendida:

| Campo | Tipo | Qué guarda |
|---|---|---|
| `accion` | texto | Tipo del evento. Una petición HTTP usa `Peticion HTTP` |
| `statusCode` | entero | Código de estado de la respuesta |
| `IP` | texto | Dirección de quien llamó |
| `id_usuario` | texto | Usuario autenticado, o `anonimo` si no hay token |
| `fecha_ejecucion` | fecha | Momento del evento |

Campos que solo aparecen en algunos tipos:

| Campo | Cuándo aparece |
|---|---|
| `metodo` | Peticiones HTTP |
| `ruta` | Peticiones HTTP |
| `mensaje` | Resumen de la respuesta |
| `descripcion` | Detalle de la respuesta. Nunca incluye la contraseña |
| `pedidoId` | Alta de un pedido, o un comentario ligado a ese pedido |
| `comentarioId` | Alta de un comentario |
| `texto` | Comentario, cuando el evento guarda el texto |

Un log de petición no trae `pedidoId` ni `comentarioId`. Un evento de pedido trae `pedidoId` y no trae `comentarioId`. Un evento de comentario trae ambos.
