# Proposal

## Why

La cafetería del campus necesita un backend que registre usuarios, el catálogo de productos y los pedidos sin vender de más, y que conserve el historial de actividad. El caso reemplaza al de reservas de salas ya sustentado: la arquitectura y las funcionalidades se mantienen, y cambia el negocio.

## What Changes

Alcance de este cambio:

- API REST en Express para crear, consultar, actualizar y desactivar usuarios y productos, y para registrar, consultar y cancelar pedidos.
- Un pedido confirma un solo producto y una cantidad entera. Solo se confirma si el usuario y el producto están activos y el stock alcanza. Al confirmar, el stock baja. Al cancelar, el stock vuelve y el pedido queda `CANCELADO`, sin borrarse.
- Autenticación con JWT y dos perfiles: `Administrador` y `Cliente`. El cliente solo ve y modifica lo suyo. El administrador administra usuarios y productos, y puede pedir para cualquier usuario.
- Esquema SQL Server en tercera forma normal, con integridad referencial, índices, procedimientos almacenados y carga inicial.
- MongoDB para dos usos distintos: el registro de actividad del sistema y los comentarios asociados a un pedido.
- Contrato HTTP de nivel 2 de Richardson: verbos, rutas por recurso y códigos de estado (`201` al crear, `400` si la entrada es inválida, `404` si no existe, `409` si el stock no alcanza, el correo está duplicado o el usuario o el producto está inactivo).
- Documentación de los endpoints y un archivo de pruebas HTTP.
- Entrega separada en tres carpetas: aplicativo Node.js, scripts SQL y scripts MongoDB.

Supuesto de alcance: el pedido no lleva varias líneas. Un carrito con detalle de productos cambiaría el modelo transaccional respecto del parcial ya sustentado.

Fuera de este cambio:

- Pagos, comprobantes, delivery y preparación en cocina.
- Interfaz de usuario.
- Actualización en vivo por WebSockets.
- Informe Word/PDF y diapositivas de sustentación.

## Capabilities

### New Capabilities

- `autenticacion`: login, registro de clientes y acceso con token según el perfil.
- `usuarios`: alta, consulta, actualización y desactivación de quienes piden en la cafetería.
- `productos`: alta, consulta, actualización y desactivación del catálogo, incluido el stock.
- `pedidos`: registro transaccional, consulta y cancelación de pedidos, rechazando cantidades que superan el stock.
- `comentarios`: comentarios de texto ligados a un pedido, guardados fuera del modelo transaccional.
- `registro-actividad`: historial flexible de eventos del sistema, incluidos los generados por cada petición.

### Modified Capabilities

- Ninguna. El proyecto no tiene especificaciones previas.

## Impact

- Proyecto nuevo, sin código de aplicación. La referencia de arquitectura es el parcial de reservas de coworking ya entregado.
- Nuevas superficies HTTP bajo `/api/auth`, `/api/usuarios`, `/api/productos`, `/api/pedidos` y `/api/pedidos/{id}/comentarios`.
- Dependencias nuevas: runtime Node.js, Express, cliente de SQL Server, cliente de MongoDB, JWT y bcrypt. La configuración sensible vive en variables de entorno; el puerto de escucha es `PORT`.
- La entrega académica no incluye `node_modules`, `package-lock.json` ni `.env`.
