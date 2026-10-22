# Spec Delta

## Purpose

Conserva un historial flexible de lo que ocurre en la API, con documentos de distinta forma según el tipo de evento, separado del modelo transaccional.

## ADDED Requirements

### Requirement: Registrar petición atendida
El sistema MUST agregar un evento de actividad por cada petición HTTP que la API termina de atender, con tipo, fecha, método, ruta y código de estado. Si no hay un usuario autenticado, el evento MUST identificar la petición como anónima. El evento MUST NOT guardar la contraseña.

#### Scenario: Petición completada
- **WHEN** la API termina de atender cualquier petición a un recurso conocido
- **THEN** el historial contiene un evento con método, ruta, código de estado y fecha

#### Scenario: Ruta desconocida
- **WHEN** el cliente solicita una ruta que no existe
- **THEN** el sistema responde `404` y el historial contiene un evento con ese código

#### Scenario: Petición con contraseña
- **WHEN** el cliente envía login, registro o un alta de usuario
- **THEN** el historial de esa petición no contiene la contraseña

### Requirement: Eventos de distinta forma
El sistema MUST aceptar en el mismo historial eventos con campos adicionales distintos, sin exigir el mismo conjunto de campos a todos los tipos.

#### Scenario: Evento de pedido
- **WHEN** un pedido queda confirmado
- **THEN** el historial contiene un evento cuyo tipo identifica el alta de pedido e incluye el identificador de ese pedido

#### Scenario: Evento de comentario
- **WHEN** un comentario queda guardado
- **THEN** el historial contiene un evento cuyo tipo identifica el comentario e incluye el identificador del comentario y el del pedido

#### Scenario: Evento de error de entrada
- **WHEN** el cliente envía un cuerpo que no cumple la validación
- **THEN** el sistema responde `400` con `error.mensaje` y `error.detalles`, y el historial contiene un evento con código `400`

### Requirement: Aislar el historial del resultado de negocio
El sistema MUST conservar el resultado ya decidido de una operación de usuarios, productos o pedidos aunque el historial no pueda persistirse.

#### Scenario: Historial no disponible
- **WHEN** una operación de usuario, producto o pedido es válida y el almacén de actividad rechaza la escritura
- **THEN** el sistema responde el código de negocio correspondiente y deja el dato transaccional persistido

### Requirement: Error no controlado
El sistema MUST responder `500` con un mensaje genérico cuando ocurre un fallo no previsto, sin incluir la traza interna en el cuerpo.

#### Scenario: Fallo interno
- **WHEN** una petición provoca un error no previsto durante su atención
- **THEN** el sistema responde `500` con `error.mensaje` y sin traza de ejecución en el cuerpo
