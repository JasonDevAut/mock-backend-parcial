use cafeteria

db.comentarios.insertMany([
  {
    pedidoId: NumberInt(1),
    texto: "Sin azúcar",
    fecha: new Date("2026-10-21T14:00:00Z")
  },
  {
    pedidoId: NumberInt(1),
    texto: "Para llevar",
    fecha: new Date("2026-10-21T14:05:00Z")
  }
])

db.logs.insertMany([
  {
    accion: "Peticion HTTP",
    statusCode: NumberInt(200),
    IP: "127.0.0.1",
    id_usuario: "anonimo",
    metodo: "GET",
    ruta: "/",
    fecha_ejecucion: new Date("2026-10-21T13:00:00Z"),
    mensaje: "Operación correcta",
    descripcion: "GET /"
  },
  {
    accion: "Registro Pedido",
    statusCode: NumberInt(201),
    IP: "127.0.0.1",
    id_usuario: "2",
    metodo: "POST",
    ruta: "/api/pedidos",
    fecha_ejecucion: new Date("2026-10-21T14:00:00Z"),
    pedidoId: NumberInt(1),
    mensaje: "Recurso creado"
  },
  {
    accion: "Registro Comentario",
    statusCode: NumberInt(201),
    IP: "127.0.0.1",
    id_usuario: "2",
    metodo: "POST",
    ruta: "/api/pedidos/1/comentarios",
    fecha_ejecucion: new Date("2026-10-21T14:05:00Z"),
    pedidoId: NumberInt(1),
    comentarioId: "comentario-ejemplo",
    texto: "Para llevar"
  }
])
