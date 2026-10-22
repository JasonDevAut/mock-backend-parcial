# usuarios Specification

## Purpose

Permite registrar y mantener a las personas que piden en la cafetería, con correo único, perfil y desactivación lógica.

## Requirements

### Requirement: Crear usuario
El sistema MUST crear un usuario activo cuando un `Administrador` envía nombre, apellido y un correo no registrado. El teléfono es opcional. Si no viene perfil, MUST quedar `Cliente`. La respuesta MUST NOT incluir la contraseña.

#### Scenario: Alta válida
- **WHEN** un `Administrador` envía `POST /api/usuarios` con nombre, apellido, un correo nuevo y una contraseña de al menos 8 caracteres
- **THEN** el sistema responde `201` con el usuario, `activo` en verdadero, un identificador y sin la contraseña

#### Scenario: Datos incompletos
- **WHEN** un `Administrador` envía `POST /api/usuarios` sin nombre, sin apellido, sin correo, o con una contraseña de menos de 8 caracteres
- **THEN** el sistema responde `400` y no crea el usuario

#### Scenario: Correo duplicado
- **WHEN** un `Administrador` envía `POST /api/usuarios` con un correo ya registrado
- **THEN** el sistema responde `409` y no crea otro usuario

#### Scenario: Cliente crea usuarios
- **WHEN** un `Cliente` envía `POST /api/usuarios`
- **THEN** el sistema responde `403` y no crea el usuario

### Requirement: Consultar usuarios
El sistema MUST devolver cada usuario con identificador, nombre, apellido, correo, teléfono, perfil y estado activo, sin la contraseña. El listado MUST quedar reservado al `Administrador`. Un `Cliente` MUST consultar solo su propio usuario.

#### Scenario: Listado
- **WHEN** un `Administrador` envía `GET /api/usuarios`
- **THEN** el sistema responde `200` con la colección de usuarios, activos e inactivos

#### Scenario: Usuario propio
- **WHEN** un usuario autenticado envía `GET /api/usuarios/{id}` con su propio identificador
- **THEN** el sistema responde `200` con ese usuario y sin la contraseña

#### Scenario: Usuario de otro cliente
- **WHEN** un `Cliente` envía `GET /api/usuarios/{id}` con el identificador de otra persona
- **THEN** el sistema responde `403`

#### Scenario: Usuario inexistente
- **WHEN** un `Administrador` envía `GET /api/usuarios/{id}` con un identificador que no existe
- **THEN** el sistema responde `404`

### Requirement: Actualizar usuario
El sistema MUST reemplazar nombre, apellido, correo y teléfono de un usuario existente. El correo resultante MUST seguir siendo único. La contraseña es opcional. Solo un `Administrador` MUST poder cambiar el perfil. Un `Cliente` MUST actualizar solo su usuario.

#### Scenario: Actualización válida
- **WHEN** el dueño o un `Administrador` envía `PUT /api/usuarios/{id}` con datos válidos de un usuario existente
- **THEN** el sistema responde `200` con el usuario actualizado y sin la contraseña

#### Scenario: Actualización inválida
- **WHEN** el cliente envía `PUT /api/usuarios/{id}` sin nombre, sin apellido, sin correo, o con un correo de otro usuario
- **THEN** el sistema responde `400` si faltan datos o `409` si el correo pertenece a otro usuario, y no modifica el registro

#### Scenario: Cliente cambia su perfil
- **WHEN** un `Cliente` envía `PUT /api/usuarios/{id}` de su usuario con otro perfil
- **THEN** el sistema responde `200` y el perfil permanece sin cambios

#### Scenario: Cliente edita a otro
- **WHEN** un `Cliente` envía `PUT /api/usuarios/{id}` del identificador de otra persona
- **THEN** el sistema responde `403` y no modifica el registro

#### Scenario: Actualizar inexistente
- **WHEN** un `Administrador` envía `PUT /api/usuarios/{id}` para un identificador que no existe
- **THEN** el sistema responde `404`

### Requirement: Desactivar usuario
El sistema MUST desactivar un usuario existente sin borrar su historial. Un usuario inactivo MUST seguir siendo consultable. Un `Administrador` MUST NOT desactivarse a sí mismo.

#### Scenario: Desactivación
- **WHEN** un `Administrador` envía `DELETE /api/usuarios/{id}` de otro usuario existente
- **THEN** el sistema responde `200` con `activo` en falso y el usuario sigue en el listado

#### Scenario: Desactivar al propio administrador
- **WHEN** un `Administrador` envía `DELETE /api/usuarios/{id}` con su propio identificador
- **THEN** el sistema responde `403` y el usuario sigue activo

#### Scenario: Desactivar inexistente
- **WHEN** un `Administrador` envía `DELETE /api/usuarios/{id}` de un identificador que no existe
- **THEN** el sistema responde `404`

### Requirement: Registrar fecha de actualización del usuario
Al crear un usuario, `fechaActualizacion` MUST quedar nula. MUST llenarse cuando ese usuario se edita o se desactiva.

#### Scenario: Alta sin fecha de actualización
- **WHEN** un usuario queda creado
- **THEN** `fechaActualizacion` es nula

#### Scenario: Edición o desactivación
- **WHEN** un usuario existente se edita o se desactiva
- **THEN** `fechaActualizacion` queda registrada
