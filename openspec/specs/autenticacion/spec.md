# autenticacion Specification

## Purpose

Permite entrar a la API con correo y contraseña, y limita el resto de las rutas según el perfil del token.

## Requirements

### Requirement: Iniciar sesión
El sistema MUST entregar un token y los datos del usuario cuando el correo y la contraseña corresponden a un usuario activo. La respuesta MUST NOT incluir la contraseña.

#### Scenario: Credenciales válidas
- **WHEN** el cliente envía `POST /api/auth/login` con el correo y la contraseña de un usuario activo
- **THEN** el sistema responde `200` con `token` y `usuario`, sin la contraseña

#### Scenario: Credenciales incorrectas
- **WHEN** el cliente envía `POST /api/auth/login` con un correo inexistente o una contraseña que no coincide
- **THEN** el sistema responde `401` y no entrega token

#### Scenario: Usuario inactivo
- **WHEN** el cliente envía `POST /api/auth/login` con las credenciales de un usuario inactivo
- **THEN** el sistema responde `403` y no entrega token

### Requirement: Registrar cliente
El sistema MUST crear un usuario activo con perfil `Cliente` a partir del registro público. La contraseña MUST tener al menos 8 caracteres. El teléfono es opcional. El perfil enviado por el cliente MUST ignorarse.

#### Scenario: Registro válido
- **WHEN** el cliente envía `POST /api/auth/registro` con nombre, apellido, un correo nuevo y una contraseña de al menos 8 caracteres
- **THEN** el sistema responde `201` con el usuario, `activo` en verdadero, perfil `Cliente` y sin la contraseña

#### Scenario: Datos inválidos
- **WHEN** el cliente envía `POST /api/auth/registro` sin nombre, sin apellido, sin correo, o con una contraseña de menos de 8 caracteres
- **THEN** el sistema responde `400` y no crea el usuario

#### Scenario: Correo duplicado
- **WHEN** el cliente envía `POST /api/auth/registro` con un correo ya registrado
- **THEN** el sistema responde `409` y no crea otro usuario

### Requirement: Exigir token
El sistema MUST exigir un token válido en las rutas de `/api`, salvo login y registro. `GET /` MUST ser pública.

#### Scenario: Petición sin token
- **WHEN** el cliente consulta un recurso de `/api` distinto de login y registro sin cabecera `Authorization`
- **THEN** el sistema responde `401`

#### Scenario: Token inválido
- **WHEN** el cliente envía `Authorization` con un token que no es válido o está vencido
- **THEN** el sistema responde `401`

#### Scenario: Usuario inactivo con token
- **WHEN** el cliente usa un token de un usuario que ya está inactivo
- **THEN** el sistema responde `403`

#### Scenario: Ruta pública
- **WHEN** el cliente envía `GET /` sin token
- **THEN** el sistema responde `200`

### Requirement: Limitar por perfil
El sistema MUST responder `403` cuando el perfil del token no puede ejecutar la acción. Crear, listar y desactivar usuarios, y crear, editar y desactivar productos, MUST quedar reservado al `Administrador`.

#### Scenario: Cliente administra el catálogo
- **WHEN** un `Cliente` envía `POST /api/productos`
- **THEN** el sistema responde `403` y no crea el producto

#### Scenario: Cliente lista usuarios
- **WHEN** un `Cliente` envía `GET /api/usuarios`
- **THEN** el sistema responde `403`
