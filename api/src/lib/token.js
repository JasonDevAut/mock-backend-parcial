const jwt = require('jsonwebtoken');

function secreto() {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error('La variable de entorno JWT_SECRET es obligatoria');
  }
  return value;
}

function duracion() {
  return process.env.JWT_EXPIRES || '8h';
}

function firmar(usuario) {
  return jwt.sign(
    { sub: usuario.id, email: usuario.email, perfil: usuario.perfil },
    secreto(),
    { expiresIn: duracion() }
  );
}

function verificar(token) {
  const payload = jwt.verify(token, secreto());
  return {
    id: Number(payload.sub),
    email: payload.email,
    perfil: payload.perfil
  };
}

module.exports = { firmar, verificar };
