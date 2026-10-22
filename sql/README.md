# SQL Server

Base `CafeteriaCampus`. Este directorio levanta el motor y deja los scripts para que un DBA cree el esquema y la carga. La API y MongoDB se entregan aparte.

## Docker

Desde este directorio:

```text
docker compose up -d
```

El motor queda en `localhost:1434`. Usuario `sa`, contraseña `Cafeteria!2026`. El contenedor no crea tablas ni datos.

## Orden de los scripts

Cuando el contenedor ya responde:

```text
sqlcmd -S localhost,1434 -U sa -P "Cafeteria!2026" -C -i DDL/01-tablas.sql
sqlcmd -S localhost,1434 -U sa -P "Cafeteria!2026" -C -i DDL/02-indices.sql
sqlcmd -S localhost,1434 -U sa -P "Cafeteria!2026" -C -i DDL/03-stored-procedure.sql
sqlcmd -S localhost,1434 -U sa -P "Cafeteria!2026" -C -i DML/01-carga-inicial.sql
```

| Script | Qué hace |
|---|---|
| `DDL/01-tablas.sql` | Crea la base y las tablas `Perfiles`, `Usuarios`, `Productos` y `Pedidos` |
| `DDL/02-indices.sql` | Índices de `Pedidos` por usuario y por producto. El correo único ya queda en la tabla |
| `DDL/03-stored-procedure.sql` | Procedimientos de usuarios, productos y pedidos, incluidos `sp_registrar_pedido` y `sp_cancelar_pedido` |
| `DML/01-carga-inicial.sql` | Perfiles, Ana, Luis, dos productos y un pedido |

`DDL/01-tablas.sql` vuelve a crear las tablas si ya existen. Ejecutarlo de nuevo borra los datos de esas tablas.

El diagrama está en `diagrama.md`.
