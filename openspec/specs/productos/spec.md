# productos Specification

## Purpose

Permite registrar y mantener el catálogo de la cafetería, con precio, stock y disponibilidad lógica para pedir.

## Requirements

### Requirement: Crear producto
El sistema MUST crear un producto activo cuando un `Administrador` envía nombre, un precio mayor que cero y un stock entero mayor o igual que cero. La descripción es opcional.

#### Scenario: Alta válida
- **WHEN** un `Administrador` envía `POST /api/productos` con nombre, precio mayor que cero y stock entero mayor o igual que cero
- **THEN** el sistema responde `201` con el producto creado, `activo` en verdadero y un identificador

#### Scenario: Datos inválidos
- **WHEN** un `Administrador` envía `POST /api/productos` sin nombre, con precio ausente o no mayor que cero, o con stock ausente, no entero o negativo
- **THEN** el sistema responde `400` y no crea el producto

### Requirement: Consultar productos
El sistema MUST devolver los productos persistidos con identificador, nombre, precio, stock, descripción y estado activo. Cualquier usuario autenticado MUST poder consultarlos.

#### Scenario: Listado
- **WHEN** un usuario autenticado envía `GET /api/productos`
- **THEN** el sistema responde `200` con la colección de productos, activos e inactivos

#### Scenario: Producto existente
- **WHEN** un usuario autenticado envía `GET /api/productos/{id}` con un identificador existente
- **THEN** el sistema responde `200` con ese producto

#### Scenario: Producto inexistente
- **WHEN** un usuario autenticado envía `GET /api/productos/{id}` con un identificador que no existe
- **THEN** el sistema responde `404`

### Requirement: Actualizar producto
El sistema MUST reemplazar nombre, precio, stock y descripción de un producto existente. El precio MUST seguir siendo mayor que cero y el stock MUST seguir siendo un entero mayor o igual que cero. La acción MUST quedar reservada al `Administrador`.

#### Scenario: Actualización válida
- **WHEN** un `Administrador` envía `PUT /api/productos/{id}` con datos válidos de un producto existente
- **THEN** el sistema responde `200` con el producto actualizado

#### Scenario: Actualización inválida
- **WHEN** un `Administrador` envía `PUT /api/productos/{id}` con nombre vacío, precio no mayor que cero o stock inválido
- **THEN** el sistema responde `400` y no modifica el producto

#### Scenario: Actualizar inexistente
- **WHEN** un `Administrador` envía `PUT /api/productos/{id}` para un identificador que no existe
- **THEN** el sistema responde `404`

### Requirement: Desactivar producto
El sistema MUST desactivar un producto existente sin borrar los pedidos ya registrados. Un producto inactivo MUST seguir siendo consultable.

#### Scenario: Desactivación
- **WHEN** un `Administrador` envía `DELETE /api/productos/{id}` de un producto existente
- **THEN** el sistema responde `200` con `activo` en falso y el producto sigue siendo consultable

#### Scenario: Desactivar inexistente
- **WHEN** un `Administrador` envía `DELETE /api/productos/{id}` de un identificador que no existe
- **THEN** el sistema responde `404`

### Requirement: Registrar fecha de actualización del producto
Al crear un producto, `fechaActualizacion` MUST quedar nula. MUST llenarse cuando ese producto se edita o se desactiva.

#### Scenario: Alta sin fecha de actualización
- **WHEN** un producto queda creado
- **THEN** `fechaActualizacion` es nula

#### Scenario: Edición o desactivación
- **WHEN** un producto existente se edita o se desactiva
- **THEN** `fechaActualizacion` queda registrada
