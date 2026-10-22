# Spec Delta

## Purpose

Permite confirmar un pedido de un producto y una cantidad, descontando el stock y devolviéndolo al cancelar.

## ADDED Requirements

### Requirement: Registrar pedido
El sistema MUST confirmar un pedido solo cuando el usuario y el producto existen y están activos, y la cantidad es un entero mayor que cero que no supera el stock. El estado inicial MUST ser `CONFIRMADO`. El stock del producto MUST bajar en esa cantidad. Un `Cliente` MUST pedir solo para sí. Un `Administrador` MUST poder indicar cualquier usuario.

#### Scenario: Pedido válido
- **WHEN** el cliente envía `POST /api/pedidos` con un usuario activo, un producto activo y una cantidad entera que el stock alcanza
- **THEN** el sistema responde `201` con el pedido, su identificador, estado `CONFIRMADO` y el precio unitario vigente, y el stock baja en esa cantidad

#### Scenario: Cantidad inválida
- **WHEN** el cliente envía `POST /api/pedidos` sin identificadores, sin cantidad, o con una cantidad no entera o menor que uno
- **THEN** el sistema responde `400` y no crea el pedido ni modifica el stock

#### Scenario: Usuario o producto inexistente
- **WHEN** el cliente envía `POST /api/pedidos` con un usuario o un producto que no existe
- **THEN** el sistema responde `404` y no crea el pedido

#### Scenario: Usuario o producto inactivo
- **WHEN** el cliente envía `POST /api/pedidos` con un usuario inactivo o un producto inactivo
- **THEN** el sistema responde `409` y no crea el pedido ni modifica el stock

#### Scenario: Cliente pide para otro
- **WHEN** un `Cliente` envía `POST /api/pedidos` con un `usuarioId` distinto del suyo
- **THEN** el sistema responde `403` y no crea el pedido

### Requirement: Rechazar stock insuficiente
El sistema MUST rechazar un pedido cuya cantidad supere el stock disponible. El stock MUST NOT quedar negativo. El stock de otro producto MUST permanecer independiente.

#### Scenario: Cantidad mayor al stock
- **WHEN** el cliente envía `POST /api/pedidos` con una cantidad mayor que el stock actual del producto
- **THEN** el sistema responde `409` y el stock permanece sin cambios

#### Scenario: Última unidad en competencia
- **WHEN** dos pedidos válidos piden al mismo tiempo la última unidad de un producto
- **THEN** uno responde `201`, el otro responde `409` y el stock queda en cero

#### Scenario: Otro producto con stock
- **WHEN** el cliente envía `POST /api/pedidos` de un producto con stock, aunque otro producto esté agotado
- **THEN** el sistema responde `201` si el resto de condiciones se cumple

### Requirement: Consultar pedidos
El sistema MUST devolver cada pedido con identificador, usuario, producto, cantidad, precio unitario y estado. Un `Cliente` MUST ver solo los suyos. Un `Administrador` MUST poder filtrar por producto o por usuario.

#### Scenario: Listado del cliente
- **WHEN** un `Cliente` envía `GET /api/pedidos`
- **THEN** el sistema responde `200` solo con los pedidos de ese cliente

#### Scenario: Filtro del administrador
- **WHEN** un `Administrador` envía `GET /api/pedidos` con `productoId` o `usuarioId`
- **THEN** el sistema responde `200` solo con los pedidos que coinciden con esos filtros

#### Scenario: Cliente filtra a otro usuario
- **WHEN** un `Cliente` envía `GET /api/pedidos` con el `usuarioId` de otra persona
- **THEN** el sistema responde `403`

#### Scenario: Pedido propio
- **WHEN** el dueño o un `Administrador` envía `GET /api/pedidos/{id}` de un pedido existente
- **THEN** el sistema responde `200` con ese pedido

#### Scenario: Pedido de otro cliente
- **WHEN** un `Cliente` envía `GET /api/pedidos/{id}` de un pedido de otra persona
- **THEN** el sistema responde `403`

#### Scenario: Pedido inexistente
- **WHEN** un `Administrador` envía `GET /api/pedidos/{id}` con un identificador que no existe
- **THEN** el sistema responde `404`

### Requirement: Cancelar pedido
El sistema MUST pasar un pedido `CONFIRMADO` a `CANCELADO` sin borrarlo, y MUST devolver la cantidad al stock. Un pedido que no está `CONFIRMADO` MUST NOT volver a sumar stock. Un `Cliente` MUST cancelar solo lo suyo.

#### Scenario: Cancelación
- **WHEN** el dueño o un `Administrador` envía `DELETE /api/pedidos/{id}` de un pedido `CONFIRMADO`
- **THEN** el sistema responde `200` con estado `CANCELADO` y el stock sube en la cantidad del pedido

#### Scenario: Cancelar inexistente
- **WHEN** el cliente envía `DELETE /api/pedidos/{id}` de un identificador que no existe
- **THEN** el sistema responde `404` y el stock no cambia

#### Scenario: Cancelar ajeno
- **WHEN** un `Cliente` envía `DELETE /api/pedidos/{id}` de un pedido de otra persona
- **THEN** el sistema responde `403` y el pedido sigue `CONFIRMADO`

#### Scenario: Cancelar de nuevo
- **WHEN** el cliente envía `DELETE /api/pedidos/{id}` de un pedido que ya está `CANCELADO`
- **THEN** el sistema responde `409` y el stock no cambia

#### Scenario: Reutilizar stock liberado
- **WHEN** el cliente envía `POST /api/pedidos` de una cantidad que solo queda disponible porque un pedido previo fue `CANCELADO`
- **THEN** el sistema responde `201` y confirma el nuevo pedido

### Requirement: Registrar fecha de actualización del pedido
Al crear un pedido, `fechaActualizacion` MUST quedar nula. MUST llenarse cuando ese pedido se cancela.

#### Scenario: Alta sin fecha de actualización
- **WHEN** un pedido queda confirmado
- **THEN** `fechaActualizacion` es nula

#### Scenario: Cancelación con fecha
- **WHEN** un pedido `CONFIRMADO` se cancela
- **THEN** `fechaActualizacion` queda registrada
