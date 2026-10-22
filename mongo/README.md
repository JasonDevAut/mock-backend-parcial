# MongoDB

Este directorio guarda los comentarios y el historial de actividad. La API y los scripts de SQL Server se entregan aparte.

`esquemas.md` describe las colecciones `comentarios` y `logs`. `logs` siempre trae `accion`, `statusCode`, `IP`, `id_usuario` y `fecha_ejecucion`. `pedidoId` y `comentarioId` solo aparecen en los eventos que los tienen. Ningún documento guarda la contraseña.

`carga-inicial.js` inserta comentarios y logs de formas distintas con `insertMany`.

## Docker

Desde este directorio:

```text
docker compose up -d
```

Levanta MongoDB y publica el puerto `27019` del host. No crea colecciones ni inserta documentos.

Con el motor en marcha:

```text
mongosh --host 127.0.0.1 --port 27019 < carga-inicial.js
```

El script entra por stdin. `mongosh` 2.x no ejecuta el resto del archivo si la primera línea es `use` y el archivo se pasa como argumento.
