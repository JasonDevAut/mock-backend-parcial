# Spec Delta

## Purpose

Permite agregar y leer comentarios de texto asociados a un pedido, sin mezclarlos con los datos transaccionales de usuarios, productos y pedidos.

## ADDED Requirements

### Requirement: Crear comentario
El sistema MUST guardar un comentario con texto no vacío para un pedido existente, junto con la fecha en que se registró. Un `Cliente` MUST comentar solo sus pedidos.

#### Scenario: Comentario válido
- **WHEN** el dueño o un `Administrador` envía `POST /api/pedidos/{id}/comentarios` con texto no vacío y el pedido existe
- **THEN** el sistema responde `201` con el comentario, su identificador, el identificador del pedido y la fecha

#### Scenario: Texto vacío
- **WHEN** el cliente envía `POST /api/pedidos/{id}/comentarios` sin texto o con texto en blanco
- **THEN** el sistema responde `400` y no guarda el comentario

#### Scenario: Pedido inexistente
- **WHEN** el cliente envía `POST /api/pedidos/{id}/comentarios` para un pedido que no existe
- **THEN** el sistema responde `404` y no guarda el comentario

#### Scenario: Pedido de otro cliente
- **WHEN** un `Cliente` envía `POST /api/pedidos/{id}/comentarios` para un pedido de otra persona
- **THEN** el sistema responde `403` y no guarda el comentario

### Requirement: Listar comentarios
El sistema MUST devolver los comentarios de un pedido en orden cronológico ascendente. Un `Cliente` MUST listar solo los de sus pedidos.

#### Scenario: Pedido con comentarios
- **WHEN** el dueño o un `Administrador` envía `GET /api/pedidos/{id}/comentarios` y el pedido existe
- **THEN** el sistema responde `200` con los comentarios de ese pedido, del más antiguo al más reciente

#### Scenario: Pedido sin comentarios
- **WHEN** el dueño o un `Administrador` envía `GET /api/pedidos/{id}/comentarios` y el pedido existe pero no tiene comentarios
- **THEN** el sistema responde `200` con una colección vacía

#### Scenario: Pedido inexistente
- **WHEN** el cliente envía `GET /api/pedidos/{id}/comentarios` para un pedido que no existe
- **THEN** el sistema responde `404`

#### Scenario: Pedido de otro cliente
- **WHEN** un `Cliente` envía `GET /api/pedidos/{id}/comentarios` para un pedido de otra persona
- **THEN** el sistema responde `403`
